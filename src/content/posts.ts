import { postVideoThumbnails } from "./generated/postVideoThumbnails";
import {
  normalizeOptionalField,
  normalizeRequiredField,
  parseFrontmatter,
  parseInteger,
  parseMarkdownBlocks,
  sanitizeHref,
  splitField,
  type TextBlock,
} from "./sharedMarkdown";

const postSources = import.meta.glob("./posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export type PostMeta = {
  title: string;
  date: string;
  order: number;
  tags: string[];
};

export type PostMediaBlock = {
  type: "media";
  kind: "image" | "video";
  src: string;
  alt?: string;
  caption?: string;
};

export type PostBlock = TextBlock | PostMediaBlock;

export type PostDefinition = {
  slug: string;
  route: string;
  meta: PostMeta;
  blocks: PostBlock[];
  previewText?: string;
  previewMedia?: PostMediaBlock;
  previewMediaThumbnail?: string;
};

export const posts = Object.entries(postSources)
  .map(([path, source]) => parsePost(extractSlug(path), source))
  .sort((left, right) => left.meta.order - right.meta.order);

const postRegistry = buildPostRegistry(posts);

export function getPostBySlug(slug: string) {
  return postRegistry[slug];
}

function extractSlug(path: string) {
  const match = path.match(/\/([^/]+)\.md$/);

  if (!match) {
    throw new Error(`Unable to determine post slug for "${path}".`);
  }

  return match[1];
}

function parsePost(slug: string, source: string): PostDefinition {
  const { meta, content } = parseFrontmatter("Post", slug, source);
  const title = normalizeRequiredField(meta.title, "Post", slug, "title");
  const date = normalizeRequiredField(meta.date, "Post", slug, "date");
  const tags = parseTags(meta.tags, slug);
  const order = parseInteger(meta.order, "Post", slug, "order");
  const blocks = parseMarkdownBlocks<PostMediaBlock>("Post", slug, content, {
    parseDirectiveBlock(lines, startIndex, context) {
      const opener = lines[startIndex].trim();
      const bodyLines: string[] = [];
      let index = startIndex + 1;

      while (index < lines.length) {
        const trimmedLine = lines[index].trim();

        if (trimmedLine === "::") {
          return {
            block: buildDirectiveBlock(opener.slice(2), bodyLines, context.slug),
            nextIndex: index + 1,
          };
        }

        bodyLines.push(lines[index]);
        index += 1;
      }

      throw new Error(`Post "${context.slug}" directive "${opener}" is not closed.`);
    },
  });

  return {
    slug,
    route: `/blog/${slug}`,
    meta: {
      title,
      date,
      order,
      tags,
    },
    blocks,
    previewText: getPreviewText(blocks),
    previewMedia: getPreviewMedia(blocks),
    previewMediaThumbnail: getPreviewMediaThumbnail(slug, blocks),
  };
}

function buildPostRegistry(items: PostDefinition[]) {
  const registry: Record<string, PostDefinition> = {};
  const routeOwners = new Map<string, string>();

  for (const post of items) {
    if (registry[post.slug]) {
      throw new Error(`Post slug "${post.slug}" is declared more than once.`);
    }

    const routeOwner = routeOwners.get(post.route);

    if (routeOwner) {
      throw new Error(`Post route "${post.route}" is declared by both "${routeOwner}" and "${post.slug}".`);
    }

    registry[post.slug] = post;
    routeOwners.set(post.route, post.slug);
  }

  return registry;
}

function parseTags(rawTags: string | undefined, slug: string) {
  const normalized = normalizeRequiredField(rawTags, "Post", slug, "tags");
  const tags = normalized
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!tags.length) {
    throw new Error(`Post "${slug}" must declare at least one tag.`);
  }

  return tags;
}

function buildDirectiveBlock(name: string, bodyLines: string[], slug: string): PostMediaBlock {
  if (name === "media") {
    return parseMediaDirective(bodyLines, slug);
  }

  throw new Error(`Post "${slug}" uses unsupported directive "::${name}".`);
}

function parseMediaDirective(lines: string[], slug: string): PostMediaBlock {
  let kind = "";
  let src = "";
  let alt = "";
  let caption = "";

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const field = splitField(trimmedLine, "Post", slug, "media");

    if (field.key === "kind") {
      kind = field.value;
      continue;
    }

    if (field.key === "src") {
      const safeHref = sanitizeHref(field.value);

      if (!safeHref) {
        throw new Error(`Post "${slug}" media has unsupported src "${field.value}".`);
      }

      src = safeHref;
      continue;
    }

    if (field.key === "alt") {
      alt = field.value;
      continue;
    }

    if (field.key === "caption") {
      caption = field.value;
      continue;
    }

    throw new Error(`Post "${slug}" "::media" does not support field "${field.key}".`);
  }

  if (!isMediaKind(kind) || !src) {
    throw new Error(`Post "${slug}" "::media" requires valid "kind" and "src".`);
  }

  return {
    type: "media",
    kind,
    src,
    alt: normalizeOptionalField(alt),
    caption: normalizeOptionalField(caption),
  };
}

function getPreviewText(blocks: PostBlock[]) {
  for (const block of blocks) {
    if (block.type === "paragraph" || block.type === "blockquote") {
      return block.text;
    }

    if (block.type === "unordered-list" || block.type === "ordered-list") {
      return block.items[0];
    }
  }

  return undefined;
}

function getPreviewMedia(blocks: PostBlock[]) {
  return blocks.find((block): block is PostMediaBlock => block.type === "media");
}

function getPreviewMediaThumbnail(slug: string, blocks: PostBlock[]) {
  const previewMedia = getPreviewMedia(blocks);

  if (!previewMedia) {
    return undefined;
  }

  if (previewMedia.kind === "image") {
    return previewMedia.src;
  }

  return postVideoThumbnails[slug] ?? undefined;
}

function isMediaKind(value: string): value is PostMediaBlock["kind"] {
  return value === "image" || value === "video";
}
