const projectSources = import.meta.glob("./projects/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export type ProjectMeta = {
  title: string;
  order: number;
  summary?: string;
};

export type ProjectTextBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; text: string };

export type ProjectDefinition = {
  slug: string;
  route: string;
  meta: ProjectMeta;
  blocks: ProjectTextBlock[];
  previewText?: string;
};

export const projects = Object.entries(projectSources)
  .map(([path, source]) => parseProject(extractSlug(path), source))
  .sort((left, right) => left.meta.order - right.meta.order);

const projectRegistry = buildProjectRegistry(projects);

export function getProjectBySlug(slug: string) {
  return projectRegistry[slug];
}

function extractSlug(path: string) {
  const match = path.match(/\/([^/]+)\.md$/);

  if (!match) {
    throw new Error(`Unable to determine project slug for "${path}".`);
  }

  return match[1];
}

function parseProject(slug: string, source: string): ProjectDefinition {
  const { meta, content } = parseFrontmatter(slug, source);
  const title = normalizeRequiredField(meta.title, slug, "title");
  const order = parseOrder(meta.order, slug);
  const summary = normalizeOptionalField(meta.summary);
  const blocks = parseProjectBlocks(slug, content);

  return {
    slug,
    route: `/projects/${slug}`,
    meta: {
      title,
      order,
      summary,
    },
    blocks,
    previewText: summary ?? getPreviewText(blocks),
  };
}

function buildProjectRegistry(items: ProjectDefinition[]) {
  const registry: Record<string, ProjectDefinition> = {};
  const routeOwners = new Map<string, string>();

  for (const project of items) {
    if (registry[project.slug]) {
      throw new Error(`Project slug "${project.slug}" is declared more than once.`);
    }

    const routeOwner = routeOwners.get(project.route);

    if (routeOwner) {
      throw new Error(`Project route "${project.route}" is declared by both "${routeOwner}" and "${project.slug}".`);
    }

    registry[project.slug] = project;
    routeOwners.set(project.route, project.slug);
  }

  return registry;
}

function parseFrontmatter(slug: string, source: string) {
  const normalized = source.replace(/\r\n/g, "\n").trim();

  if (!normalized.startsWith("---\n")) {
    throw new Error(`Project "${slug}" is missing frontmatter.`);
  }

  const lines = normalized.split("\n");
  const closingIndex = lines.indexOf("---", 1);

  if (closingIndex === -1) {
    throw new Error(`Project "${slug}" has an unclosed frontmatter block.`);
  }

  const meta: Record<string, string> = {};

  for (const line of lines.slice(1, closingIndex)) {
    if (!line.trim()) {
      continue;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      throw new Error(`Project "${slug}" has invalid frontmatter line "${line}".`);
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (!key) {
      throw new Error(`Project "${slug}" has a frontmatter entry without a key.`);
    }

    meta[key] = stripMatchingQuotes(rawValue);
  }

  return {
    meta,
    content: lines.slice(closingIndex + 1).join("\n").trim(),
  };
}

function parseOrder(rawOrder: string | undefined, slug: string) {
  const normalized = normalizeRequiredField(rawOrder, slug, "order");
  const parsedOrder = Number.parseInt(normalized, 10);

  if (!Number.isInteger(parsedOrder)) {
    throw new Error(`Project "${slug}" has invalid "order" value "${normalized}".`);
  }

  return parsedOrder;
}

function parseProjectBlocks(slug: string, source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ProjectTextBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmedLine = lines[index].trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (/^::/.test(trimmedLine)) {
      throw new Error(`Project "${slug}" does not support markdown directives in body.`);
    }

    if (/^#\s+/.test(trimmedLine)) {
      throw new Error(`Project "${slug}" may not contain H1 headings. Use "##" for section titles.`);
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
        /^::/.test(paragraphLine) ||
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

function getPreviewText(blocks: ProjectTextBlock[]) {
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

      if (isHeading(trimmedLine) || /^#\s+/.test(trimmedLine) || isBlockquote(trimmedLine) || isListMarker(trimmedLine)) {
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

function normalizeRequiredField(value: string | undefined, slug: string, fieldName: string) {
  if (!value || !value.trim()) {
    throw new Error(`Project "${slug}" is missing required field "${fieldName}".`);
  }

  return value.trim();
}

function normalizeOptionalField(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return value.trim() ? value.trim() : undefined;
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
