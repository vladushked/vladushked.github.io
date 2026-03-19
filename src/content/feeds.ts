import { pages, type PageDefinition, type PageFeedBlock } from "./pages";

export type FeedDefinition = {
  id: string;
  pageSlug: string;
  pageRoute: string;
};

export const feeds = pages.flatMap((page) => getPageFeeds(page));

const feedRegistry = buildFeedRegistry(feeds);

export function getFeedById(id: string) {
  return feedRegistry[id];
}

function getPageFeeds(page: PageDefinition): FeedDefinition[] {
  return page.blocks
    .filter((block): block is PageFeedBlock => block.type === "post-feed")
    .map((block) => ({
      id: block.feed,
      pageSlug: page.slug,
      pageRoute: page.route,
    }));
}

function buildFeedRegistry(items: FeedDefinition[]) {
  const registry: Record<string, FeedDefinition> = {};

  for (const item of items) {
    if (registry[item.id]) {
      throw new Error(
        `Feed "${item.id}" is declared by both "${registry[item.id].pageSlug}" and "${item.pageSlug}".`,
      );
    }

    registry[item.id] = item;
  }

  return registry;
}
