import { Fragment } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import type { ProjectDefinition, ProjectTextBlock } from "../content/projects";

type ProjectPageProps = {
  project: ProjectDefinition;
};

const inlineTokenPattern = /(\[[^\]]+\]\([^)]+\)|\*\*.+?\*\*|`[^`]+`|\*[^*]+\*)/g;

export function ProjectPage({ project }: ProjectPageProps) {
  return (
    <div className="page-shell min-h-screen">
      <article className="mx-auto max-w-4xl">
        <header className="markdown-page-header post-page-header space-y-4 border-b border-[var(--color-border)] pb-8">
          <Link to="/projects" className="post-back-link">
            Все проекты
          </Link>
          <h1 className="type-page-title">{project.meta.title}</h1>
          {project.meta.summary ? (
            <p className="type-body-lead ui-text-muted max-w-3xl">{project.meta.summary}</p>
          ) : null}
        </header>

        <div className="markdown-content post-content">
          {project.blocks.map((block, index) => renderProjectBlock(block, index))}
        </div>
      </article>
    </div>
  );
}

function renderProjectBlock(block: ProjectTextBlock, index: number) {
  if (block.type === "heading") {
    if (block.level === 2) {
      return (
        <h2 key={`project-block-${index}`} className="type-section-title markdown-section-title">
          {block.text}
        </h2>
      );
    }

    return (
      <h3 key={`project-block-${index}`} className="markdown-subheading">
        {block.text}
      </h3>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p key={`project-block-${index}`} className="type-body markdown-paragraph">
        {renderInline(block.text, `project-paragraph-${index}`)}
      </p>
    );
  }

  if (block.type === "unordered-list") {
    return (
      <ul key={`project-block-${index}`} className="markdown-list">
        {block.items.map((item, itemIndex) => (
          <li key={`project-item-${index}-${itemIndex}`} className="markdown-list-item">
            <span className="accent-ink markdown-list-marker">•</span>
            <span>{renderInline(item, `project-unordered-${index}-${itemIndex}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol key={`project-block-${index}`} className="markdown-list">
        {block.items.map((item, itemIndex) => (
          <li key={`project-item-${index}-${itemIndex}`} className="markdown-list-item">
            <span className="accent-ink markdown-list-marker">{itemIndex + 1}.</span>
            <span>{renderInline(item, `project-ordered-${index}-${itemIndex}`)}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <blockquote key={`project-block-${index}`} className="markdown-quote">
      {renderInline(block.text, `project-quote-${index}`)}
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
