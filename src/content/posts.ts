import { parseMediaDirective, type PostMediaBlock } from "./media";
import { postVideoThumbnails } from "./generated/postVideoThumbnails";
import { getFeedById } from "./feeds";
import {
  normalizeRequiredField,
  parseFrontmatter,
  normalizeRoute,
  type TextBlock,
} from "./sharedMarkdown";
import {
  buildRouteRegistry,
  buildSlugRegistry,
  extractMarkdownSlug,
  getPreviewText,
  parseDirectiveBlocks,
} from "./contentUtils";

const postSources = import.meta.glob("./cards/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export type PostMeta = {
  title: string;
  date: string;
  feed: string;
  tags: string[];
};

export type { PostMediaBlock } from "./media";

export type PostBlock = TextBlock | PostMediaBlock;

export type PostDefinition = {
  slug: string;
  route: string;
  feedRoute: string;
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
  const feed = parsePostFeed(meta.feed, slug);
  const tags = parseTags(meta.tags, slug);
  const blocks = parseDirectiveBlocks(
    "Post",
    slug,
    content,
    buildDirectiveBlock,
  );
  const textBlocks = blocks.filter(
    (block): block is TextBlock => block.type !== "media",
  );
  const feedDefinition = getFeedById(feed);

  if (!feedDefinition) {
    throw new Error(`Post "${slug}" references unknown feed "${feed}".`);
  }

  return {
    slug,
    route: buildPostRoute(feedDefinition.pageRoute, slug),
    feedRoute: feedDefinition.pageRoute,
    meta: {
      title,
      date,
      feed,
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

function parsePostFeed(rawFeed: string | undefined, slug: string) {
  return normalizeRequiredField(rawFeed, "Post", slug, "feed");
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

function buildPostRoute(feedRoute: string, slug: string) {
  const prefix = feedRoute === "/" ? "" : feedRoute;

  return normalizeRoute(`${prefix}/${slug}`, "Post", slug, "route");
}

function buildDirectiveBlock(
  name: string,
  bodyLines: string[],
  slug: string,
): PostMediaBlock {
  if (name === "media") {
    return parseMediaDirective(bodyLines, slug);
  }

  throw new Error(`Post "${slug}" uses unsupported directive "::${name}".`);
}

function getPreviewMedia(blocks: PostBlock[]) {
  return blocks.find(
    (block): block is PostMediaBlock => block.type === "media",
  );
}

function getPreviewMediaThumbnail(slug: string, blocks: PostBlock[]) {
  const previewMedia = getPreviewMedia(blocks);

  if (!previewMedia) {
    return undefined;
  }

  if (previewMedia.kind === "video") {
    return previewMedia.preview ?? postVideoThumbnails[slug] ?? undefined;
  }

  if (previewMedia.kind === "image") {
    return previewMedia.src;
  }

  return undefined;
}

function comparePostsByDateDesc(left: PostDefinition, right: PostDefinition) {
  const timeDiff =
    Date.parse(`${right.meta.date}T00:00:00Z`) -
    Date.parse(`${left.meta.date}T00:00:00Z`);

  if (timeDiff !== 0) {
    return timeDiff;
  }

  return left.slug.localeCompare(right.slug);
}
