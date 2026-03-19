export type ParsedMarkdownSource = {
  meta: Record<string, string>;
  content: string;
};

export type TextBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; text: string };

type ParseContext = {
  kind: string;
  slug: string;
};

type DirectiveResult<TDirectiveBlock> = {
  block: TDirectiveBlock;
  nextIndex: number;
};

type ParseBlocksOptions<TDirectiveBlock> = {
  parseDirectiveBlock?: (
    lines: string[],
    startIndex: number,
    context: ParseContext,
  ) => DirectiveResult<TDirectiveBlock>;
};

export function parseFrontmatter(kind: string, slug: string, source: string): ParsedMarkdownSource {
  const normalized = source.replace(/\r\n/g, "\n").trim();

  if (!normalized.startsWith("---\n")) {
    throw new Error(`${kind} "${slug}" is missing frontmatter.`);
  }

  const lines = normalized.split("\n");
  const closingIndex = lines.indexOf("---", 1);

  if (closingIndex === -1) {
    throw new Error(`${kind} "${slug}" has an unclosed frontmatter block.`);
  }

  const meta: Record<string, string> = {};

  for (const line of lines.slice(1, closingIndex)) {
    if (!line.trim()) {
      continue;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      throw new Error(`${kind} "${slug}" has invalid frontmatter line "${line}".`);
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (!key) {
      throw new Error(`${kind} "${slug}" has a frontmatter entry without a key.`);
    }

    meta[key] = stripMatchingQuotes(rawValue);
  }

  return {
    meta,
    content: lines.slice(closingIndex + 1).join("\n").trim(),
  };
}

export function parseMarkdownBlocks<TDirectiveBlock>(
  kind: string,
  slug: string,
  source: string,
  options: ParseBlocksOptions<TDirectiveBlock> = {},
) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Array<TextBlock | TDirectiveBlock> = [];
  let index = 0;

  while (index < lines.length) {
    const trimmedLine = lines[index].trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (isDirectiveStart(trimmedLine)) {
      if (!options.parseDirectiveBlock) {
        throw new Error(`${kind} "${slug}" does not support markdown directives in body.`);
      }

      const directive = options.parseDirectiveBlock(lines, index, { kind, slug });
      blocks.push(directive.block);
      index = directive.nextIndex;
      continue;
    }

    if (/^#\s+/.test(trimmedLine)) {
      throw new Error(`${kind} "${slug}" may not contain H1 headings. Use "##" for section titles.`);
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

export function splitField(line: string, kind: string, slug: string, scope: string) {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex === -1) {
    throw new Error(`${kind} "${slug}" has invalid ${scope} field "${line}".`);
  }

  const key = line.slice(0, separatorIndex).trim();
  const rawValue = line.slice(separatorIndex + 1).trim();

  if (!key) {
    throw new Error(`${kind} "${slug}" has invalid ${scope} field "${line}".`);
  }

  return {
    key,
    value: stripMatchingQuotes(rawValue),
  };
}

export function normalizeRequiredField(value: string | undefined, kind: string, slug: string, fieldName: string) {
  if (!value || !value.trim()) {
    throw new Error(`${kind} "${slug}" is missing required field "${fieldName}".`);
  }

  return value.trim();
}

export function normalizeOptionalField(value?: string) {
  if (!value) {
    return undefined;
  }

  return value.trim() ? value.trim() : undefined;
}

export function normalizeRoute(value: string, kind: string, slug: string, fieldName = "route") {
  const route = value.trim();

  if (!route.startsWith("/")) {
    throw new Error(`${kind} "${slug}" field "${fieldName}" must start with "/".`);
  }

  if (route.length > 1 && route.endsWith("/")) {
    return route.slice(0, -1);
  }

  return route;
}

export function parseInteger(value: string | undefined, kind: string, slug: string, fieldName: string) {
  const normalized = normalizeRequiredField(value, kind, slug, fieldName);
  const parsedValue = Number.parseInt(normalized, 10);

  if (!Number.isInteger(parsedValue)) {
    throw new Error(`${kind} "${slug}" has invalid "${fieldName}" value "${normalized}".`);
  }

  return parsedValue;
}

export function parseBoolean(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return undefined;
}

export function stripMatchingQuotes(value: string) {
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

export function sanitizeHref(rawHref: string) {
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

      if (isHeading(trimmedLine) || isDirectiveStart(trimmedLine) || /^#\s+/.test(trimmedLine) || isBlockquote(trimmedLine) || isListMarker(trimmedLine)) {
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

function isDirectiveStart(line: string) {
  return /^::/.test(line);
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
