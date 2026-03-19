import { Fragment } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Mail, Phone, PlayCircle, Send } from "lucide-react";
import type { SiteDocument } from "../content/documents";
import { posts, projects } from "../content/documents";
import type { CardBlock, HeroBlock, PageBlock, SkillGroupBlock } from "../content/pages";
import type { PostBlock, PostMediaBlock } from "../content/posts";
import { sanitizeHref, type TextBlock } from "../content/sharedMarkdown";
import { PostPreviewCard } from "./PostPreviewCard";
import { ProjectPreviewCard } from "./ProjectPreviewCard";

type HeroContactType = "phone" | "email" | "telegram";

type BaseCardProps = {
  fill: "none" | "gray" | "accent";
  stroke: "none" | "gray" | "accent";
  headingVariant: "page" | "card";
  heading: ReactNode;
  title?: string;
  subtitle?: string;
  period?: string;
  meta?: string;
  summary?: string;
  subtitleLines: Array<{ text: string; period: string }>;
  bullets: string[];
  footer?: ReactNode;
};

const inlineTokenPattern = /(\[[^\]]+\]\([^)]+\)|\*\*.+?\*\*|`[^`]+`|\*[^*]+\*)/g;

export function DocumentPage({ document }: { document: SiteDocument }) {
  if (document.kind === "page") {
    return (
      <PageFrame
        eyebrow={document.page.meta.eyebrow ? <Link to="/" className="type-eyebrow inline-block">{document.page.meta.eyebrow}</Link> : undefined}
        title={document.page.meta.title}
        description={document.page.meta.description}
      >
        {document.page.blocks.map((block, index) => renderPageBlock(block, index))}
      </PageFrame>
    );
  }

  if (document.kind === "post") {
    return (
      <PageFrame
        backLink={{ to: "/", label: "Все записи" }}
        headerSupplement={
          <div className="post-tag-list">
            {document.post.meta.tags.map((tag) => (
              <span key={tag} className="post-tag">
                {tag}
              </span>
            ))}
          </div>
        }
        eyebrow={<p className="type-eyebrow">{document.post.meta.date}</p>}
        title={document.post.meta.title}
        contentClassName="post-content"
      >
        {document.post.blocks.map((block, index) => renderPostBlock(block, index, document.post.meta.title))}
      </PageFrame>
    );
  }

  return (
    <PageFrame
      backLink={{ to: "/projects", label: "Все проекты" }}
      title={document.project.meta.title}
      description={document.project.meta.summary}
      contentClassName="post-content"
    >
      {document.project.blocks.map((block, index) => renderTextBlock(block, index, "project"))}
    </PageFrame>
  );
}

function PageFrame({
  eyebrow,
  title,
  description,
  backLink,
  headerSupplement,
  contentClassName,
  children,
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  backLink?: { to: string; label: string };
  headerSupplement?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}) {
  const hasPageHeader = Boolean(backLink || eyebrow || title || description || headerSupplement);

  return (
    <div className="page-shell min-h-screen">
      <article className="mx-auto max-w-4xl">
        {hasPageHeader ? (
          <header className="markdown-page-header space-y-4 border-b border-[var(--color-border)] pb-8">
            {backLink ? (
              <Link to={backLink.to} className="post-back-link">
                {backLink.label}
              </Link>
            ) : null}
            {headerSupplement}
            {eyebrow}
            {title ? <h1 className="type-page-title">{title}</h1> : null}
            {description ? <p className="type-body-lead ui-text-muted max-w-3xl">{description}</p> : null}
          </header>
        ) : null}

        <div className={`markdown-content${contentClassName ? ` ${contentClassName}` : ""}`}>{children}</div>
      </article>
    </div>
  );
}

function renderPageBlock(block: PageBlock, index: number) {
  if (block.type === "hero") {
    return <HeroSection key={`page-block-${index}`} block={block} />;
  }

  if (block.type === "card") {
    return <CardSection key={`page-block-${index}`} block={block} />;
  }

  if (block.type === "skill-group") {
    return <SkillGroupSection key={`page-block-${index}`} block={block} />;
  }

  if (block.type === "post-feed") {
    return (
      <section key={`page-block-${index}`} className="post-feed">
        {posts.map((post) => (
          <PostPreviewCard key={post.slug} post={post} />
        ))}
      </section>
    );
  }

  if (block.type === "project-feed") {
    return (
      <section key={`page-block-${index}`} className="post-feed">
        {projects.map((project) => (
          <ProjectPreviewCard key={project.slug} project={project} />
        ))}
      </section>
    );
  }

  return renderTextBlock(block, index, "page");
}

function renderPostBlock(block: PostBlock, index: number, title: string) {
  if (block.type === "media") {
    return <PostMediaSection key={`post-block-${index}`} block={block} title={title} />;
  }

  return renderTextBlock(block, index, "post");
}

function renderTextBlock(block: TextBlock, index: number, keyPrefix: string) {
  if (block.type === "heading") {
    if (block.level === 2) {
      return (
        <h2 key={`${keyPrefix}-block-${index}`} className="type-section-title markdown-section-title">
          {block.text}
        </h2>
      );
    }

    return (
      <h3 key={`${keyPrefix}-block-${index}`} className="markdown-subheading">
        {block.text}
      </h3>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p key={`${keyPrefix}-block-${index}`} className="type-body markdown-paragraph">
        {renderInline(block.text, `${keyPrefix}-paragraph-${index}`)}
      </p>
    );
  }

  if (block.type === "unordered-list") {
    return (
      <ul key={`${keyPrefix}-block-${index}`} className="markdown-list">
        {block.items.map((item, itemIndex) => (
          <li key={`${keyPrefix}-item-${index}-${itemIndex}`} className="markdown-list-item">
            <span className="accent-ink markdown-list-marker">•</span>
            <span>{renderInline(item, `${keyPrefix}-unordered-${index}-${itemIndex}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol key={`${keyPrefix}-block-${index}`} className="markdown-list">
        {block.items.map((item, itemIndex) => (
          <li key={`${keyPrefix}-item-${index}-${itemIndex}`} className="markdown-list-item">
            <span className="accent-ink markdown-list-marker">{itemIndex + 1}.</span>
            <span>{renderInline(item, `${keyPrefix}-ordered-${index}-${itemIndex}`)}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <blockquote key={`${keyPrefix}-block-${index}`} className="markdown-quote">
      {renderInline(block.text, `${keyPrefix}-quote-${index}`)}
    </blockquote>
  );
}

function HeroSection({ block }: { block: HeroBlock }) {
  const footer = block.contacts.length ? (
    <ul className="hero-contact-list">
      {block.contacts.map((contact, index) => {
        const Icon = getContactIcon(contact.type);
        const opensNewTab = /^https?:\/\//.test(contact.href);

        return (
          <li key={`${contact.type}-${index}`} className="hero-contact-item">
            <Icon size={16} strokeWidth={1.8} />
            <a
              href={contact.href}
              target={opensNewTab ? "_blank" : undefined}
              rel={opensNewTab ? "noopener noreferrer" : undefined}
              className="card-contact-link"
            >
              {contact.label}
            </a>
          </li>
        );
      })}
    </ul>
  ) : null;

  return (
    <section
      className={`card card-fill-${block.fill} card-stroke-${block.stroke} card-heading-${block.headingVariant} ${
        block.photo ? "hero-card hero-card-with-photo" : "hero-card"
      }`}
    >
      <div className="card-stack hero-card-content">
        <div className="card-stack-tight">
          <h1 className="card-heading card-heading-page">{block.name}</h1>
          {block.title ? <p className="card-title">{renderInline(block.title, `${block.name}-title`)}</p> : null}

          {block.subtitleLines.length ? (
            <div className="card-subtitle-lines">
              {block.subtitleLines.map((line, index) => (
                <div key={`${line.text}-${index}`} className="card-subtitle-line">
                  <span className="card-subtitle">{line.text}</span>
                  <span className="card-period">{line.period}</span>
                </div>
              ))}
            </div>
          ) : block.subtitle || block.period ? (
            <p className="card-subtitle-row">
              {block.subtitle ? <span className="card-subtitle">{block.subtitle}</span> : null}
              {block.subtitle && block.period ? <span className="card-separator">·</span> : null}
              {block.period ? <span className="card-period">{block.period}</span> : null}
            </p>
          ) : null}

          {block.meta ? <p className="card-meta">{renderInline(block.meta, `${block.name}-meta`)}</p> : null}
        </div>

        {block.summary ? (
          <p className="type-body card-summary">{renderInline(block.summary, `${block.name}-summary`)}</p>
        ) : null}

        {footer}
      </div>

      {block.photo ? (
        <div className="hero-card-media">
          <img src={block.photo} alt={block.name} className="hero-card-image" />
        </div>
      ) : null}
    </section>
  );
}

function CardSection({ block }: { block: CardBlock }) {
  return (
    <BaseCard
      fill={block.fill}
      stroke={block.stroke}
      headingVariant={block.headingVariant}
      heading={<h3 className="card-heading card-heading-card">{block.title}</h3>}
      subtitle={block.subtitle}
      period={block.period}
      meta={block.meta}
      summary={block.summary}
      subtitleLines={block.subtitleLines}
      bullets={block.bullets}
    />
  );
}

function BaseCard({
  fill,
  stroke,
  headingVariant,
  heading,
  title,
  subtitle,
  period,
  meta,
  summary,
  subtitleLines,
  bullets,
  footer,
}: BaseCardProps) {
  return (
    <section className={`card card-fill-${fill} card-stroke-${stroke} card-heading-${headingVariant}`}>
      <div className="card-stack">
        <div className="card-stack-tight">
          {heading}
          {title ? <p className="card-title">{renderInline(title, `${title}-title`)}</p> : null}

          {subtitleLines.length ? (
            <div className="card-subtitle-lines">
              {subtitleLines.map((line, index) => (
                <div key={`${line.text}-${index}`} className="card-subtitle-line">
                  <span className="card-subtitle">{line.text}</span>
                  <span className="card-period">{line.period}</span>
                </div>
              ))}
            </div>
          ) : subtitle || period ? (
            <p className="card-subtitle-row">
              {subtitle ? <span className="card-subtitle">{subtitle}</span> : null}
              {subtitle && period ? <span className="card-separator">·</span> : null}
              {period ? <span className="card-period">{period}</span> : null}
            </p>
          ) : null}

          {meta ? <p className="card-meta">{renderInline(meta, `${meta}-meta`)}</p> : null}
        </div>

        {summary ? <p className="type-body card-summary">{renderInline(summary, `${summary}-summary`)}</p> : null}

        {bullets.length ? (
          <ul className="markdown-list">
            {bullets.map((item, itemIndex) => (
              <li key={`${item}-item-${itemIndex}`} className="markdown-list-item">
                <span className="accent-ink markdown-list-marker">•</span>
                <span>{renderInline(item, `${item}-bullet-${itemIndex}`)}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {footer}
      </div>
    </section>
  );
}

function SkillGroupSection({ block }: { block: SkillGroupBlock }) {
  return (
    <section className="skill-group">
      <p className="type-eyebrow">{block.title}</p>
      <div className="skill-chip-list">
        {block.skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className={block.variant === "solid" ? "skill-chip skill-chip-solid" : "skill-chip skill-chip-outline"}
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
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

function getContactIcon(type: HeroContactType) {
  if (type === "phone") {
    return Phone;
  }

  if (type === "email") {
    return Mail;
  }

  return Send;
}
