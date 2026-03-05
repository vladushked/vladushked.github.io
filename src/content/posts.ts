const postSources = import.meta.glob("./posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
import { postVideoThumbnails } from "./generated/postVideoThumbnails";

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

export type PostTextBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; text: string };

export type PostBlock = PostMediaBlock | PostTextBlock;

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
  const { meta, content } = parseFrontmatter(slug, source);
  const title = normalizeRequiredField(meta.title, slug, "title");
  const date = normalizeRequiredField(meta.date, slug, "date");
  const tags = parseTags(meta.tags, slug);
  const order = parseOrder(meta.order, slug);
  const blocks = parsePostBlocks(slug, content);

  return {
    slug,
    route: `/posts/${slug}`,
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

function parseFrontmatter(slug: string, source: string) {
  const normalized = source.replace(/\r\n/g, "\n").trim();

  if (!normalized.startsWith("---\n")) {
    throw new Error(`Post "${slug}" is missing frontmatter.`);
  }

  const lines = normalized.split("\n");
  const closingIndex = lines.indexOf("---", 1);

  if (closingIndex === -1) {
    throw new Error(`Post "${slug}" has an unclosed frontmatter block.`);
  }

  const meta: Record<string, string> = {};

  for (const line of lines.slice(1, closingIndex)) {
    if (!line.trim()) {
      continue;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      throw new Error(`Post "${slug}" has invalid frontmatter line "${line}".`);
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (!key) {
      throw new Error(`Post "${slug}" has a frontmatter entry without a key.`);
    }

    meta[key] = stripMatchingQuotes(rawValue);
  }

  return {
    meta,
    content: lines.slice(closingIndex + 1).join("\n").trim(),
  };
}

function parseTags(rawTags: string | undefined, slug: string) {
  const normalized = normalizeRequiredField(rawTags, slug, "tags");
  const tags = normalized
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!tags.length) {
    throw new Error(`Post "${slug}" must declare at least one tag.`);
  }

  return tags;
}

function parseOrder(rawOrder: string | undefined, slug: string) {
  const normalized = normalizeRequiredField(rawOrder, slug, "order");
  const parsedOrder = Number.parseInt(normalized, 10);

  if (!Number.isInteger(parsedOrder)) {
    throw new Error(`Post "${slug}" has invalid "order" value "${normalized}".`);
  }

  return parsedOrder;
}

function parsePostBlocks(slug: string, source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: PostBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmedLine = lines[index].trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (isDirectiveStart(trimmedLine)) {
      const directive = parseDirectiveBlock(lines, index, slug);
      blocks.push(directive.block);
      index = directive.nextIndex;
      continue;
    }

    if (/^#\s+/.test(trimmedLine)) {
      throw new Error(`Post "${slug}" may not contain H1 headings. Use "##" for section titles.`);
    }

    const headingMatch = trimmedLine.match(/^(#{2,3})\s+(.+)$/);

    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 2 | 3,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmedLine)) {
      const result = parseList(lines, index, "unordered");
      blocks.push({ type: "unordered-list", items: result.items });
      index = result.nextIndex;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmedLine)) {
      const result = parseList(lines, index, "ordered");
      blocks.push({ type: "ordered-list", items: result.items });
      index = result.nextIndex;
      continue;
    }

    if (/^>\s+/.test(trimmedLine)) {
      const quoteLines: string[] = [];

      while (index < lines.length) {
        const quoteLine = lines[index].trim();
        const match = quoteLine.match(/^>\s+(.+)$/);

        if (!match) {
          break;
        }

        quoteLines.push(match[1].trim());
        index += 1;
      }

      blocks.push({ type: "blockquote", text: quoteLines.join(" ") });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const paragraphLine = lines[index].trim();

      if (
        !paragraphLine ||
        isDirectiveStart(paragraphLine) ||
        /^#\s+/.test(paragraphLine) ||
        /^(#{2,3})\s+/.test(paragraphLine) ||
        /^[-*]\s+/.test(paragraphLine) ||
        /^\d+\.\s+/.test(paragraphLine) ||
        /^>\s+/.test(paragraphLine)
      ) {
        break;
      }

      paragraphLines.push(paragraphLine);
      index += 1;
    }

    if (paragraphLines.length) {
      blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
      continue;
    }

    index += 1;
  }

  return blocks;
}

function isDirectiveStart(line: string) {
  return /^::media$/.test(line);
}

function parseDirectiveBlock(lines: string[], startIndex: number, slug: string) {
  const opener = lines[startIndex].trim();
  const bodyLines: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    const trimmedLine = lines[index].trim();

    if (trimmedLine === "::") {
      return {
        block: buildDirectiveBlock(opener.slice(2), bodyLines, slug),
        nextIndex: index + 1,
      };
    }

    bodyLines.push(lines[index]);
    index += 1;
  }

  throw new Error(`Post "${slug}" directive "${opener}" is not closed.`);
}

function buildDirectiveBlock(name: string, bodyLines: string[], slug: string): PostBlock {
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

    const field = splitField(trimmedLine, slug, "media");

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

function parseList(lines: string[], startIndex: number, type: "unordered" | "ordered") {
  const items: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const currentLine = lines[index].trim();
    const markerMatch =
      type === "unordered"
        ? currentLine.match(/^[-*]\s+(.+)$/)
        : currentLine.match(/^\d+\.\s+(.+)$/);

    if (!markerMatch) {
      break;
    }

    const itemLines = [markerMatch[1].trim()];
    index += 1;

    while (index < lines.length) {
      const rawLine = lines[index];
      const trimmedLine = rawLine.trim();

      if (!trimmedLine) {
        const nextLine = lines[index + 1];

        if (nextLine && isContinuationLine(nextLine) && !isListMarker(nextLine.trim())) {
          index += 1;
          continue;
        }

        break;
      }

      if (
        isHeading(trimmedLine) ||
        isDirectiveStart(trimmedLine) ||
        /^#\s+/.test(trimmedLine) ||
        isBlockquote(trimmedLine) ||
        isListMarker(trimmedLine)
      ) {
        break;
      }

      if (isContinuationLine(rawLine)) {
        itemLines.push(trimmedLine);
        index += 1;
        continue;
      }

      break;
    }

    items.push(itemLines.join(" "));
  }

  return { items, nextIndex: index };
}

function splitField(line: string, slug: string, directiveName: string) {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex === -1) {
    throw new Error(`Post "${slug}" "::${directiveName}" has invalid line "${line}".`);
  }

  const key = line.slice(0, separatorIndex).trim();
  const value = line.slice(separatorIndex + 1).trim();

  if (!key) {
    throw new Error(`Post "${slug}" "::${directiveName}" has invalid line "${line}".`);
  }

  return { key, value: stripMatchingQuotes(value) };
}

function sanitizeHref(rawHref: string) {
  const href = rawHref.trim();

  if (!href || /[\u0000-\u001F\u007F]/.test(href) || href.startsWith("//")) {
    return null;
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return href;
  }

  const lowercaseHref = href.toLowerCase();

  if (
    lowercaseHref.startsWith("https://") ||
    lowercaseHref.startsWith("http://") ||
    lowercaseHref.startsWith("mailto:") ||
    lowercaseHref.startsWith("tel:")
  ) {
    return href;
  }

  return null;
}

function normalizeRequiredField(value: string | undefined, slug: string, fieldName: string) {
  if (!value || !value.trim()) {
    throw new Error(`Post "${slug}" is missing required field "${fieldName}".`);
  }

  return value.trim();
}

function normalizeOptionalField(value: string) {
  return value.trim() ? value : undefined;
}

function stripMatchingQuotes(value: string) {
  if (value.length < 2) {
    return value;
  }

  const firstChar = value[0];
  const lastChar = value[value.length - 1];

  if ((firstChar === "\"" && lastChar === "\"") || (firstChar === "'" && lastChar === "'")) {
    return value.slice(1, -1);
  }

  return value;
}

function isMediaKind(value: string): value is PostMediaBlock["kind"] {
  return value === "image" || value === "video";
}

function isContinuationLine(line: string) {
  return /^(?: {2,}|\t+)/.test(line);
}

function isHeading(line: string) {
  return /^(#{2,3})\s+/.test(line);
}

function isBlockquote(line: string) {
  return /^>\s+/.test(line);
}

function isListMarker(line: string) {
  return /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line);
}
