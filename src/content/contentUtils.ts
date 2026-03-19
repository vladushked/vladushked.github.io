import { parseMarkdownBlocks, type TextBlock } from "./sharedMarkdown";

type DirectiveBuilder<TDirectiveBlock> = (name: string, bodyLines: string[], slug: string) => TDirectiveBlock;

export function extractMarkdownSlug(path: string, kind: string) {
  const match = path.match(/\/([^/]+)\.md$/);

  if (!match) {
    throw new Error(`Unable to determine ${kind.toLowerCase()} slug for "${path}".`);
  }

  return match[1];
}

export function buildSlugRegistry<TItem extends { slug: string }>(items: TItem[], kind: string) {
  const registry: Record<string, TItem> = {};

  for (const item of items) {
    if (registry[item.slug]) {
      throw new Error(`${kind} slug "${item.slug}" is declared more than once.`);
    }

    registry[item.slug] = item;
  }

  return registry;
}

export function buildRouteRegistry<TItem extends { route: string; slug: string }>(items: TItem[], kind: string) {
  const registry: Record<string, TItem> = {};

  for (const item of items) {
    if (registry[item.route]) {
      throw new Error(`${kind} route "${item.route}" is declared by both "${registry[item.route].slug}" and "${item.slug}".`);
    }

    registry[item.route] = item;
  }

  return registry;
}

export function parseDirectiveBlocks<TDirectiveBlock>(
  kind: string,
  slug: string,
  source: string,
  buildDirectiveBlock: DirectiveBuilder<TDirectiveBlock>,
) {
  return parseMarkdownBlocks<TDirectiveBlock>(kind, slug, source, {
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

      throw new Error(`${kind} "${context.slug}" directive "${opener}" is not closed.`);
    },
  });
}

export function getPreviewText(blocks: TextBlock[]) {
  for (const block of blocks) {
    if (block.type === "paragraph" || block.type === "blockquote") {
      return stripInlineMarkdown(block.text);
    }

    if (block.type === "unordered-list" || block.type === "ordered-list") {
      return stripInlineMarkdown(block.items[0]);
    }
  }

  return undefined;
}

function stripInlineMarkdown(text: string) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1");
}
