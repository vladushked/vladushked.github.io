import { Fragment } from "react";
import type { ReactNode } from "react";
import type { MarkdownPageDefinition } from "../content/markdownPages";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; text: string };

type MarkdownPageProps = {
  page: MarkdownPageDefinition;
};

const inlineTokenPattern = /(\[[^\]]+\]\([^)]+\)|\*\*.+?\*\*|`[^`]+`|\*[^*]+\*)/g;

export function MarkdownPage({ page }: MarkdownPageProps) {
  const blocks = parseMarkdownBlocks(page.content);

  return (
    <div className="min-h-screen px-6 py-12 md:px-12 md:py-20">
      <article className="mx-auto max-w-4xl">
        <header className="space-y-4 border-b border-[var(--color-border)] pb-8">
          {page.meta.eyebrow ? <p className="type-eyebrow">{page.meta.eyebrow}</p> : null}
          <h1 className="type-page-title">{page.meta.title}</h1>
          {page.meta.description ? (
            <p className="type-body-lead ui-text-muted max-w-3xl">{page.meta.description}</p>
          ) : null}
        </header>

        <div className="markdown-content">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>
      </article>
    </div>
  );
}

function parseMarkdownBlocks(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];

  let index = 0;

  while (index < lines.length) {
    const trimmedLine = lines[index].trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (/^#\s+/.test(trimmedLine)) {
      throw new Error('Markdown body may not contain H1 headings. Use "##" for section titles.');
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

function renderBlock(block: MarkdownBlock, index: number) {
  if (block.type === "heading") {
    if (block.level === 2) {
      return (
        <h2 key={`block-${index}`} className="type-section-title markdown-section-title">
          {block.text}
        </h2>
      );
    }

    return (
      <h3 key={`block-${index}`} className="markdown-subheading">
        {block.text}
      </h3>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p key={`block-${index}`} className="type-body markdown-paragraph">
        {renderInline(block.text, `paragraph-${index}`)}
      </p>
    );
  }

  if (block.type === "unordered-list") {
    return (
      <ul key={`block-${index}`} className="markdown-list">
        {block.items.map((item, itemIndex) => (
          <li key={`item-${index}-${itemIndex}`} className="markdown-list-item">
            <span className="accent-ink markdown-list-marker">•</span>
            <span>{renderInline(item, `unordered-${index}-${itemIndex}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol key={`block-${index}`} className="markdown-list">
        {block.items.map((item, itemIndex) => (
          <li key={`item-${index}-${itemIndex}`} className="markdown-list-item">
            <span className="accent-ink markdown-list-marker">{itemIndex + 1}.</span>
            <span>{renderInline(item, `ordered-${index}-${itemIndex}`)}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <blockquote key={`block-${index}`} className="markdown-quote">
      {renderInline(block.text, `quote-${index}`)}
    </blockquote>
  );
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(inlineTokenPattern)) {
    const token = match[0];
    const tokenIndex = match.index ?? 0;

    if (tokenIndex > lastIndex) {
      parts.push(text.slice(lastIndex, tokenIndex));
    }

    parts.push(renderInlineToken(token, `${keyPrefix}-${tokenIndex}`));
    lastIndex = tokenIndex + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, index) =>
    typeof part === "string" ? (
      <Fragment key={`${keyPrefix}-text-${index}`}>{part}</Fragment>
    ) : (
      <Fragment key={`${keyPrefix}-node-${index}`}>{part}</Fragment>
    ),
  );
}

function renderInlineToken(token: string, key: string) {
  const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

  if (linkMatch) {
    const [, label, href] = linkMatch;
    const safeHref = sanitizeHref(href);

    if (!safeHref) {
      return label;
    }

    const opensNewTab = /^https?:\/\//.test(safeHref);

    return (
      <a
        key={key}
        href={safeHref}
        target={opensNewTab ? "_blank" : undefined}
        rel={opensNewTab ? "noopener noreferrer" : undefined}
        className="markdown-link"
      >
        {label}
      </a>
    );
  }

  const strongMatch = token.match(/^\*\*(.+)\*\*$/);

  if (strongMatch) {
    return (
      <strong key={key} className="markdown-strong">
        {strongMatch[1]}
      </strong>
    );
  }

  const codeMatch = token.match(/^`(.+)`$/);

  if (codeMatch) {
    return (
      <code key={key} className="markdown-inline-code">
        {codeMatch[1]}
      </code>
    );
  }

  const emphasisMatch = token.match(/^\*(.+)\*$/);

  if (emphasisMatch) {
    return <em key={key}>{emphasisMatch[1]}</em>;
  }

  return token;
}

// This parser supports a narrow markdown subset tuned for site content, not full CommonMark.
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
