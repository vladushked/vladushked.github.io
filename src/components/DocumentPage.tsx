import { Fragment, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Mail,
  Phone,
  PlayCircle,
  Send,
} from "lucide-react";
import type { SiteDocument } from "../content/documents";
import { posts } from "../content/documents";
import type {
  CardBlock,
  HeroBlock,
  PageBlock,
  SkillGroupBlock,
} from "../content/pages";
import type { PostBlock, PostMediaBlock } from "../content/posts";
import { sanitizeHref, type TextBlock } from "../content/sharedMarkdown";
import { ButtonLink, ContentList, Identity, TextLink } from "./ui/primitives";
import { TopicFilter } from "./ui/TopicFilter";
import { CodeBlock } from "./ui/primitives";
import { useArchiveTopics } from "./ArchiveState";
import {
  matchesTopics,
  postListItem,
  projectItems,
  topicOptions,
} from "../content/site";
const NativeDemo = lazy(() => import("./ui/ObsidianGraphDemo"));

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
  collapseBullets?: boolean;
  footer?: ReactNode;
};

const inlineTokenPattern =
  /(\[[^\]]+\]\([^)]+\)|\*\*.+?\*\*|`[^`]+`|\*[^*]+\*)/g;

export function DocumentPage({ document }: { document: SiteDocument }) {
  if (document.kind === "page") {
    if (document.slug === "about") {
      const identity = document.page.blocks.find(
        (block): block is HeroBlock => block.type === "hero",
      );
      if (!identity)
        throw Error("About page requires a Markdown identity block.");
      return (
        <div className="site-preview site-preview--home">
          <div className="ps-personal-home ps-about">
            <nav className="page-back-links" aria-label="Возврат">
              <Link to="/" className="site-back ps-link ps-link--muted">
                <ArrowLeft size={14} aria-hidden="true" />
                На главную
              </Link>
            </nav>
            <div className="ps-home-identity">
              <Identity
                name={identity.name}
                subtitle={identity.title}
                avatarSrc={identity.photo}
                href="/about"
                heading="h1"
              />
            </div>
            <section className="ps-home-section" aria-label="Резюме">
              <h2>
                {identity.actions.map((action) => (
                  <TextLink key={action.href} href={action.href}>
                    {action.label}
                  </TextLink>
                ))}
              </h2>
            </section>
          </div>
        </div>
      );
    }
    const isBlog = document.page.blocks.some(
      (block) => block.type === "post-feed",
    );
    const hasHero = document.page.blocks.some((block) => block.type === "hero");
    return (
      <PageFrame
        title={isBlog ? "blog" : hasHero ? undefined : document.page.meta.title}
        description={
          hasHero || isBlog ? undefined : document.page.meta.description
        }
      >
        {(isBlog
          ? document.page.blocks.filter((block) => block.type === "post-feed")
          : document.page.blocks
        ).map((block, index) => renderPageBlock(block, index))}
      </PageFrame>
    );
  }
  return (
    <PageFrame
      title={document.post.meta.title}
      backLink={{ to: document.post.feedRoute, label: "Все публикации" }}
      headerSupplement={
        <div className="post-meta">
          <time dateTime={document.post.meta.date}>
            {new Intl.DateTimeFormat("ru-RU").format(
              new Date(document.post.meta.date + "T00:00:00Z"),
            )}
          </time>
          <span>{document.post.meta.tags.join(" · ")}</span>
        </div>
      }
    >
      {document.post.blocks.map((block, index) =>
        renderPostBlock(
          block,
          index,
          document.post.meta.title,
          document.post.previewMediaThumbnail,
        ),
      )}
    </PageFrame>
  );
}
function PageFrame({
  title,
  description,
  backLink,
  headerSupplement,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  backLink?: { to: string; label: string };
  headerSupplement?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="site-preview">
      <article className="ps-article">
        <nav className="page-back-links" aria-label="Возврат">
          <Link to="/" className="site-back ps-link ps-link--muted">
            <ArrowLeft size={14} aria-hidden="true" />
            На главную
          </Link>
          {backLink && (
            <Link to={backLink.to} className="site-back ps-link ps-link--muted">
              {backLink.label}
            </Link>
          )}
        </nav>
        {title && <h1>{title}</h1>}
        {description && <p className="document-description">{description}</p>}
        {headerSupplement}
        <div className="markdown-content">{children}</div>
      </article>
    </div>
  );
}

function renderPageBlock(block: PageBlock, index: number) {
  if (block.type === "media")
    return (
      <PostMediaSection
        key={`page-media-${index}`}
        block={block}
        title={block.alt || "Медиа проекта"}
      />
    );
  if (block.type === "project-feed")
    return <ProjectFeedSection key={`project-feed-${index}`} />;
  if (block.type === "native-demo")
    return (
      <figure key={`native-${index}`} className="native-project-media">
        <Suspense
          fallback={
            <p role="status" className="native-project-loading">
              Загрузка интерактивного демо…
            </p>
          }
        >
          <NativeDemo poster={block.poster} />
        </Suspense>
      </figure>
    );
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
    return <PostFeedSection key={`page-block-${index}`} feed={block.feed} />;
  }

  return renderTextBlock(block, index, "page");
}

function renderPostBlock(
  block: PostBlock,
  index: number,
  title: string,
  thumbnailUrl?: string,
) {
  if (block.type === "media") {
    return (
      <PostMediaSection
        key={`post-block-${index}`}
        block={block}
        title={title}
        thumbnailUrl={thumbnailUrl}
      />
    );
  }

  return renderTextBlock(block, index, "post");
}

function renderTextBlock(block: TextBlock, index: number, keyPrefix: string) {
  if (block.type === "code")
    return (
      <CodeBlock
        key={`${keyPrefix}-code-${index}`}
        code={block.code}
        language={block.language}
        label={block.language || "Код"}
      />
    );
  if (block.type === "heading") {
    if (block.level === 2) {
      return (
        <h2
          key={`${keyPrefix}-block-${index}`}
          className="type-section-title markdown-section-title"
        >
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
      <p
        key={`${keyPrefix}-block-${index}`}
        className="type-body markdown-paragraph"
      >
        {renderInline(block.text, `${keyPrefix}-paragraph-${index}`)}
      </p>
    );
  }

  if (block.type === "unordered-list") {
    return (
      <ul key={`${keyPrefix}-block-${index}`} className="markdown-list">
        {block.items.map((item, itemIndex) => (
          <li
            key={`${keyPrefix}-item-${index}-${itemIndex}`}
            className="markdown-list-item"
          >
            <span className="accent-ink markdown-list-marker">•</span>
            <span>
              {renderInline(
                item,
                `${keyPrefix}-unordered-${index}-${itemIndex}`,
              )}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol key={`${keyPrefix}-block-${index}`} className="markdown-list">
        {block.items.map((item, itemIndex) => (
          <li
            key={`${keyPrefix}-item-${index}-${itemIndex}`}
            className="markdown-list-item"
          >
            <span className="accent-ink markdown-list-marker">
              {itemIndex + 1}.
            </span>
            <span>
              {renderInline(item, `${keyPrefix}-ordered-${index}-${itemIndex}`)}
            </span>
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
  const actions = block.actions.length ? (
    <div className="hero-action-list">
      {block.actions.map((action, index) =>
        renderHeroAction(action, `${action.href}-${index}`),
      )}
    </div>
  ) : null;

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
        block.photo
          ? `hero-card hero-card-with-photo hero-card-photo-layout-${block.photoLayout}`
          : "hero-card"
      }`}
    >
      {block.photo && block.photoLayout === "banner" ? (
        <div
          className={`hero-card-media hero-card-media-size-${block.imageSize} hero-card-media-banner`}
        >
          <img src={block.photo} alt={block.name} className="hero-card-image" />
        </div>
      ) : null}

      <div className="card-stack hero-card-content">
        <div className="card-stack-tight">
          <h1 className="card-heading card-heading-page">{block.name}</h1>
          {block.title ? (
            <p className="card-title">
              {renderInline(block.title, `${block.name}-title`)}
            </p>
          ) : null}

          {block.subtitleLines.length ? (
            <div className="card-subtitle-lines">
              {block.subtitleLines.map((line, index) => (
                <div
                  key={`${line.text}-${index}`}
                  className="card-subtitle-line"
                >
                  <span className="card-subtitle">{line.text}</span>
                  <span className="card-period">{line.period}</span>
                </div>
              ))}
            </div>
          ) : block.subtitle || block.period ? (
            <p className="card-subtitle-row">
              {block.subtitle ? (
                <span className="card-subtitle">{block.subtitle}</span>
              ) : null}
              {block.subtitle && block.period ? (
                <span className="card-separator">·</span>
              ) : null}
              {block.period ? (
                <span className="card-period">{block.period}</span>
              ) : null}
            </p>
          ) : null}

          {block.meta ? (
            <p className="card-meta">
              {renderInline(block.meta, `${block.name}-meta`)}
            </p>
          ) : null}
        </div>

        {block.summary ? (
          <p className="type-body card-summary">
            {renderInline(block.summary, `${block.name}-summary`)}
          </p>
        ) : null}

        {actions}
        {footer}
      </div>

      {block.photo && block.photoLayout !== "banner" ? (
        <div
          className={`hero-card-media hero-card-media-size-${block.imageSize}`}
        >
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
      heading={
        <h3 className="card-heading card-heading-card">{block.title}</h3>
      }
      subtitle={block.subtitle}
      period={block.period}
      meta={block.meta}
      summary={block.summary}
      subtitleLines={block.subtitleLines}
      bullets={block.bullets}
      collapseBullets={block.kind === "experience"}
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
  collapseBullets = false,
  footer,
}: BaseCardProps) {
  const bulletList = bullets.length ? (
    <ul className="markdown-list">
      {bullets.map((item, itemIndex) => (
        <li key={`${item}-item-${itemIndex}`} className="markdown-list-item">
          <span className="accent-ink markdown-list-marker">•</span>
          <span>{renderInline(item, `${item}-bullet-${itemIndex}`)}</span>
        </li>
      ))}
    </ul>
  ) : null;
  return (
    <section
      className={`card card-fill-${fill} card-stroke-${stroke} card-heading-${headingVariant}`}
    >
      <div className="card-stack">
        <div className="card-stack-tight">
          {heading}
          {title ? (
            <p className="card-title">
              {renderInline(title, `${title}-title`)}
            </p>
          ) : null}

          {subtitleLines.length ? (
            <div className="card-subtitle-lines">
              {subtitleLines.map((line, index) => (
                <div
                  key={`${line.text}-${index}`}
                  className="card-subtitle-line"
                >
                  <span className="card-subtitle">{line.text}</span>
                  <span className="card-period">{line.period}</span>
                </div>
              ))}
            </div>
          ) : subtitle || period ? (
            <p className="card-subtitle-row">
              {subtitle ? (
                <span className="card-subtitle">{subtitle}</span>
              ) : null}
              {subtitle && period ? (
                <span className="card-separator">·</span>
              ) : null}
              {period ? <span className="card-period">{period}</span> : null}
            </p>
          ) : null}

          {meta ? (
            <p className="card-meta">{renderInline(meta, `${meta}-meta`)}</p>
          ) : null}
        </div>

        {summary ? (
          <p className="type-body card-summary">
            {renderInline(summary, `${summary}-summary`)}
          </p>
        ) : null}

        {collapseBullets && bulletList ? (
          <details className="experience-details">
            <summary>
              <ChevronRight size={15} aria-hidden="true" />
              Подробнее об опыте
            </summary>
            {bulletList}
          </details>
        ) : bulletList}

        {footer}
      </div>
    </section>
  );
}

function SkillGroupSection({ block }: { block: SkillGroupBlock }) {
  return (
    <section className="skill-group">
      <p className="type-eyebrow">{block.title}</p>
      <div className="chip-list">
        {block.skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className={
              block.variant === "solid"
                ? "chip chip-static chip-solid"
                : "chip chip-static chip-outline"
            }
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}

function PostFeedSection({ feed }: { feed: string }) {
  const items = posts
    .filter((post) => post.meta.feed === feed)
    .map((post) => postListItem(post));
  const [selected, setSelected] = useArchiveTopics(feed);
  const visible = items.filter((item) => matchesTopics(item, selected));
  return (
    <section className="post-feed">
      <TopicFilter
        options={topicOptions(items)}
        value={selected}
        onValueChange={setSelected}
        resultCount={visible.length}
        totalCount={items.length}
      />
      <ContentList
        items={visible}
        variant="posts"
        empty="По этим темам пока ничего нет."
      />
    </section>
  );
}
function ProjectFeedSection() {
  const [selected, setSelected] = useArchiveTopics("projects");
  const visible = projectItems.filter((item) => matchesTopics(item, selected));
  return (
    <section className="post-feed">
      <TopicFilter
        options={topicOptions(projectItems)}
        value={selected}
        onValueChange={setSelected}
        resultCount={visible.length}
        totalCount={projectItems.length}
      />
      <ContentList
        items={visible}
        variant="projects"
        empty="По этим темам пока ничего нет."
      />
    </section>
  );
}

function PostMediaSection({
  block,
  title,
  thumbnailUrl,
}: {
  block: PostMediaBlock;
  title: string;
  thumbnailUrl?: string;
}) {
  if (block.kind === "image") {
    return (
      <figure className="post-detail-media">
        <img
          src={block.src}
          alt={block.alt ?? title}
          className="post-detail-image"
        />
        {block.caption ? (
          <figcaption className="post-media-caption">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (thumbnailUrl) {
    return (
      <figure className="post-detail-media">
        <a
          href={block.src}
          target="_blank"
          rel="noopener noreferrer"
          className="post-detail-video-preview"
          aria-label={`Открыть видео "${title}"`}
        >
          <img
            src={thumbnailUrl}
            alt={block.alt ?? title}
            className="post-detail-video-image"
          />
          <span className="post-detail-video-overlay" aria-hidden="true">
            <PlayCircle size={40} strokeWidth={1.7} />
            <span className="post-detail-media-label">Видео</span>
          </span>
        </a>
        {block.caption ? (
          <figcaption className="post-media-caption">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <section className="post-detail-media post-detail-video">
      <a
        href={block.src}
        target="_blank"
        rel="noopener noreferrer"
        className="post-detail-video-link"
      >
        <PlayCircle size={40} strokeWidth={1.7} />
        <span>Открыть видео</span>
      </a>
      {block.caption ? (
        <p className="post-media-caption">{block.caption}</p>
      ) : null}
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

function renderHeroAction(action: HeroBlock["actions"][number], key: string) {
  const content = (
    <>
      <span>{action.label}</span>
      <ArrowRight size={16} strokeWidth={1.8} />
    </>
  );

  const className = `hero-action hero-action-${action.variant}`;

  if (action.href.startsWith("https://t.me/")) {
    return (
      <ButtonLink
        key={key}
        href={action.href}
        variant={action.variant}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </ButtonLink>
    );
  }

  if (action.href.startsWith("/")) {
    return (
      <Link key={key} to={action.href} className={className}>
        {content}
      </Link>
    );
  }

  const opensNewTab = /^https?:\/\//.test(action.href);

  return (
    <a
      key={key}
      href={action.href}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
      className={className}
    >
      {content}
    </a>
  );
}

function getVisiblePostTags(post: { meta: { tags: string[]; date: string } }) {
  const yearTag = getPostYearTag(post);

  return post.meta.tags.filter((tag) => tag !== yearTag && !isYearOnlyTag(tag));
}

function getPostYearTag(post: { meta: { date: string } }) {
  return post.meta.date.slice(0, 4);
}

function isYearOnlyTag(tag: string) {
  return /^\d{4}$/.test(tag);
}
