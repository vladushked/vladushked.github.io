import { postVideoThumbnails } from "./generated/postVideoThumbnails";
import {
  normalizeOptionalField,
  normalizeRequiredField,
  parseFrontmatter,
  normalizeRoute,
  sanitizeHref,
  splitField,
  type TextBlock,
} from "./sharedMarkdown";
import { buildRouteRegistry, buildSlugRegistry, extractMarkdownSlug, getPreviewText, parseDirectiveBlocks } from "./contentUtils";

const postSources = import.meta.glob("./posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export type PostMeta = {
  title: string;
  date: string;
  section: PostSection;
  tags: string[];
};

export type PostSection = "blog" | "projects";

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
  .map(([path, source]) => parsePost(extractMarkdownSlug(path, "Post"), source))
  .sort(comparePostsByDateDesc);

const postRegistry = buildSlugRegistry(posts, "Post");
buildRouteRegistry(posts, "Post");

export function getPostBySlug(slug: string) {
  return postRegistry[slug];
}

function parsePost(slug: string, source: string): PostDefinition {
  const { meta, content } = parseFrontmatter("Post", slug, source);
  const title = normalizeRequiredField(meta.title, "Post", slug, "title");
  const date = parsePostDate(meta.date, slug);
  const section = parsePostSection(meta.section, slug);
  const tags = parseTags(meta.tags, slug);
  const blocks = parseDirectiveBlocks("Post", slug, content, buildDirectiveBlock);
  const textBlocks = blocks.filter((block): block is TextBlock => block.type !== "media");

  return {
    slug,
    route: buildPostRoute(section, slug),
    meta: {
      title,
      date,
      section,
      tags,
    },
    blocks,
    previewText: getPreviewText(textBlocks),
    previewMedia: getPreviewMedia(blocks),
    previewMediaThumbnail: getPreviewMediaThumbnail(slug, blocks),
  };
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

function parsePostSection(rawSection: string | undefined, slug: string): PostSection {
  const section = normalizeRequiredField(rawSection, "Post", slug, "section");

  if (section !== "blog" && section !== "projects") {
    throw new Error(`Post "${slug}" has unsupported section "${section}".`);
  }

  return section;
}

function parsePostDate(rawDate: string | undefined, slug: string) {
  const date = normalizeRequiredField(rawDate, "Post", slug, "date");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Post "${slug}" field "date" must use YYYY-MM-DD format.`);
  }

  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Post "${slug}" has invalid date "${date}".`);
  }

  return date;
}

function buildPostRoute(section: PostSection, slug: string) {
  const prefix = section === "projects" ? "/projects" : "/blog";

  return normalizeRoute(`${prefix}/${slug}`, "Post", slug, "route");
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

function comparePostsByDateDesc(left: PostDefinition, right: PostDefinition) {
  const timeDiff = Date.parse(`${right.meta.date}T00:00:00Z`) - Date.parse(`${left.meta.date}T00:00:00Z`);

  if (timeDiff !== 0) {
    return timeDiff;
  }

  return left.slug.localeCompare(right.slug);
}

function isMediaKind(value: string): value is PostMediaBlock["kind"] {
  return value === "image" || value === "video";
}
