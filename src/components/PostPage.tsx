import { Fragment } from "react";
import type { ReactNode } from "react";
import { PlayCircle } from "lucide-react";
import { Link } from "react-router";
import type { PostDefinition, PostBlock, PostMediaBlock } from "../content/posts";

type PostPageProps = {
  post: PostDefinition;
};

const inlineTokenPattern = /(\[[^\]]+\]\([^)]+\)|\*\*.+?\*\*|`[^`]+`|\*[^*]+\*)/g;

export function PostPage({ post }: PostPageProps) {
  return (
    <div className="page-shell min-h-screen">
      <article className="mx-auto max-w-4xl">
        <header className="markdown-page-header post-page-header space-y-4 border-b border-[var(--color-border)] pb-8">
          <Link to="/posts" className="post-back-link">
            Все посты
          </Link>
          <div className="post-tag-list">
            {post.meta.tags.map((tag) => (
              <span key={tag} className="post-tag">
                {tag}
              </span>
            ))}
          </div>
          <p className="type-eyebrow">{post.meta.date}</p>
          <h1 className="type-page-title">{post.meta.title}</h1>
        </header>

        <div className="markdown-content post-content">
          {post.blocks.map((block, index) => renderPostBlock(block, index, post.meta.title))}
        </div>
      </article>
    </div>
  );
}

export function renderPostPreviewMedia(
  media: PostMediaBlock,
  title: string,
  thumbnailUrl?: string,
) {
  if (thumbnailUrl) {
    return (
      <div className="post-preview-media-frame">
        <img src={thumbnailUrl} alt={media.alt ?? title} className="post-preview-image" />
        {media.kind === "video" ? (
          <span className="post-preview-video-overlay" aria-hidden="true">
            <PlayCircle size={32} strokeWidth={1.7} />
            <span className="post-preview-media-label">Видео</span>
          </span>
        ) : null}
      </div>
    );
  }

  if (media.kind === "image") {
    return (
      <div className="post-preview-media-frame">
        <img src={media.src} alt={media.alt ?? title} className="post-preview-image" />
      </div>
    );
  }

  return (
    <div className="post-preview-media-frame post-preview-video" aria-label={`Видео "${title}"`}>
      <PlayCircle size={32} strokeWidth={1.7} />
      <span className="post-preview-media-label">Видео</span>
    </div>
  );
}

function renderPostBlock(block: PostBlock, index: number, title: string) {
  if (block.type === "media") {
    return <PostMediaSection key={`post-block-${index}`} block={block} title={title} />;
  }

  if (block.type === "heading") {
    if (block.level === 2) {
      return (
        <h2 key={`post-block-${index}`} className="type-section-title markdown-section-title">
          {block.text}
        </h2>
      );
    }

    return (
      <h3 key={`post-block-${index}`} className="markdown-subheading">
        {block.text}
      </h3>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p key={`post-block-${index}`} className="type-body markdown-paragraph">
        {renderInline(block.text, `post-paragraph-${index}`)}
      </p>
    );
  }

  if (block.type === "unordered-list") {
    return (
      <ul key={`post-block-${index}`} className="markdown-list">
        {block.items.map((item, itemIndex) => (
          <li key={`post-item-${index}-${itemIndex}`} className="markdown-list-item">
            <span className="accent-ink markdown-list-marker">•</span>
            <span>{renderInline(item, `post-unordered-${index}-${itemIndex}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol key={`post-block-${index}`} className="markdown-list">
        {block.items.map((item, itemIndex) => (
          <li key={`post-item-${index}-${itemIndex}`} className="markdown-list-item">
            <span className="accent-ink markdown-list-marker">{itemIndex + 1}.</span>
            <span>{renderInline(item, `post-ordered-${index}-${itemIndex}`)}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <blockquote key={`post-block-${index}`} className="markdown-quote">
      {renderInline(block.text, `post-quote-${index}`)}
    </blockquote>
  );
}

function PostMediaSection({ block, title }: { block: PostMediaBlock; title: string }) {
  if (block.kind === "image") {
    return (
      <figure className="post-detail-media">
        <img src={block.src} alt={block.alt ?? title} className="post-detail-image" />
        {block.caption ? <figcaption className="post-media-caption">{block.caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <section className="post-detail-media post-detail-video">
      <a href={block.src} target="_blank" rel="noopener noreferrer" className="post-detail-video-link">
        <PlayCircle size={40} strokeWidth={1.7} />
        <span>Открыть видео</span>
      </a>
      {block.caption ? <p className="post-media-caption">{block.caption}</p> : null}
    </section>
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
