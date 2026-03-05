import { Fragment } from "react";
import type { ReactNode } from "react";
import { Mail, Phone, Send } from "lucide-react";
import type { RoutedMarkdownPage } from "../content/markdownPages";
import { posts } from "../content/posts";
import { PostPreviewCard } from "./PostPreviewCard";

type HeroContactType = "phone" | "email" | "telegram";
type CardKind = "experience" | "education";
type CardFill = "none" | "gray" | "accent";
type CardStroke = "none" | "gray" | "accent";
type CardHeadingVariant = "page" | "card";
type SkillGroupVariant = "solid" | "outline";

type HeroContact = {
  type: HeroContactType;
  label: string;
  href: string;
};

type CardSubtitleLine = {
  text: string;
  period: string;
};

type CardPresentation = {
  fill: CardFill;
  stroke: CardStroke;
  headingVariant: CardHeadingVariant;
};

type CardBodyContent = {
  title?: string;
  subtitle?: string;
  period?: string;
  meta?: string;
  summary?: string;
  subtitleLines: CardSubtitleLine[];
  bullets: string[];
};

type HeroBlock = CardPresentation &
  Omit<CardBodyContent, "bullets"> & {
    name: string;
    photo?: string;
    contacts: HeroContact[];
  };

type CardBlock = CardPresentation & CardBodyContent & { kind: CardKind };

type SkillGroupBlock = {
  title: string;
  variant: SkillGroupVariant;
  skills: string[];
};

type MarkdownBlock =
  | { type: "hero"; data: HeroBlock }
  | { type: "card"; data: CardBlock }
  | { type: "skill-group"; data: SkillGroupBlock }
  | { type: "post-feed" }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; text: string };

type MarkdownPageProps = {
  page: RoutedMarkdownPage;
};

type BaseCardProps = {
  fill: CardFill;
  stroke: CardStroke;
  headingVariant: CardHeadingVariant;
  heading: ReactNode;
  title?: string;
  subtitle?: string;
  period?: string;
  meta?: string;
  summary?: string;
  subtitleLines: CardSubtitleLine[];
  bullets: string[];
  footer?: ReactNode;
};

const inlineTokenPattern = /(\[[^\]]+\]\([^)]+\)|\*\*.+?\*\*|`[^`]+`|\*[^*]+\*)/g;

export function MarkdownPage({ page }: MarkdownPageProps) {
  const blocks = parseMarkdownBlocks(page.content);
  const hasPageHeader = Boolean(page.meta.eyebrow || page.meta.title || page.meta.description);

  return (
    <div className="page-shell min-h-screen">
      <article className="mx-auto max-w-4xl">
        {hasPageHeader ? (
          <header className="markdown-page-header space-y-4 border-b border-[var(--color-border)] pb-8">
            {page.meta.eyebrow ? <p className="type-eyebrow">{page.meta.eyebrow}</p> : null}
            {page.meta.title ? <h1 className="type-page-title">{page.meta.title}</h1> : null}
            {page.meta.description ? (
              <p className="type-body-lead ui-text-muted max-w-3xl">{page.meta.description}</p>
            ) : null}
          </header>
        ) : null}

        <div className="markdown-content">{blocks.map((block, index) => renderBlock(block, index))}</div>
      </article>
    </div>
  );
}

function parseMarkdownBlocks(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];

  let index = 0;
  let heroCount = 0;

  while (index < lines.length) {
    const trimmedLine = lines[index].trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (isDirectiveStart(trimmedLine)) {
      const directive = parseDirectiveBlock(lines, index);

      if (directive.block.type === "hero") {
        heroCount += 1;

        if (heroCount > 1) {
          throw new Error('Markdown body may not contain more than one "::hero" block.');
        }
      }

      blocks.push(directive.block);
      index = directive.nextIndex;
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

function renderBlock(block: MarkdownBlock, index: number) {
  if (block.type === "hero") {
    return <HeroSection key={`block-${index}`} block={block.data} />;
  }

  if (block.type === "card") {
    return <CardSection key={`block-${index}`} block={block.data} />;
  }

  if (block.type === "skill-group") {
    return <SkillGroupSection key={`block-${index}`} block={block.data} />;
  }

  if (block.type === "post-feed") {
    return <PostFeedSection key={`block-${index}`} />;
  }

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

        {summary ? (
          <p className="type-body card-summary">{renderInline(summary, `${summary}-summary`)}</p>
        ) : null}

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

function PostFeedSection() {
  return (
    <section className="post-feed">
      {posts.map((post) => (
        <PostPreviewCard key={post.slug} post={post} />
      ))}
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
        isDirectiveStart(trimmedLine) ||
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

function isDirectiveStart(line: string) {
  return /^::(?:hero|card|skill-group|post-feed)$/.test(line);
}

function parseDirectiveBlock(lines: string[], startIndex: number) {
  const opener = lines[startIndex].trim();
  const directiveName = opener.slice(2);
  const bodyLines: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    const trimmedLine = lines[index].trim();

    if (trimmedLine === "::") {
      return {
        block: buildDirectiveBlock(directiveName, bodyLines),
        nextIndex: index + 1,
      };
    }

    bodyLines.push(lines[index]);
    index += 1;
  }

  throw new Error(`Markdown directive "${opener}" is not closed.`);
}

function buildDirectiveBlock(name: string, bodyLines: string[]): MarkdownBlock {
  if (name === "hero") {
    return { type: "hero", data: parseHeroDirective(bodyLines) };
  }

  if (name === "card") {
    return { type: "card", data: parseCardDirective(bodyLines) };
  }

  if (name === "skill-group") {
    return { type: "skill-group", data: parseSkillGroupDirective(bodyLines) };
  }

  if (name === "post-feed") {
    return parsePostFeedDirective(bodyLines);
  }

  throw new Error(`Unsupported markdown directive "::${name}".`);
}

function parsePostFeedDirective(lines: string[]): MarkdownBlock {
  for (const rawLine of lines) {
    if (rawLine.trim()) {
      throw new Error('Markdown "::post-feed" does not support any fields.');
    }
  }

  return { type: "post-feed" };
}

function parseHeroDirective(lines: string[]): HeroBlock {
  let name = "";
  let photo = "";
  let title = "";
  let subtitle = "";
  let period = "";
  let meta = "";
  let summary = "";
  let legacyRole = "";
  let legacyExperienceLabel = "";
  let legacyExperience = "";
  let presentation = createDefaultPresentation("hero");
  const contacts: HeroContact[] = [];
  const subtitleLines: CardSubtitleLine[] = [];

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const field = splitDirectiveField(trimmedLine, "hero");

    if (field.key === "name") {
      name = field.value;
      continue;
    }

    if (field.key === "contact") {
      contacts.push(parseHeroContact(field.value));
      continue;
    }

    if (field.key === "photo") {
      const safeHref = sanitizeHref(field.value);

      if (!safeHref) {
        throw new Error(`Markdown "::hero" photo has unsupported href "${field.value}".`);
      }

      photo = safeHref;
      continue;
    }

    if (field.key === "role") {
      legacyRole = field.value;
      continue;
    }

    if (field.key === "experienceLabel") {
      legacyExperienceLabel = field.value;
      continue;
    }

    if (field.key === "experience") {
      legacyExperience = field.value;
      continue;
    }

    if (isCardPresentationField(field.key)) {
      presentation = applyCardPresentationField(presentation, field, "hero");
      continue;
    }

    if (field.key === "title") {
      title = field.value;
      continue;
    }

    if (field.key === "subtitle") {
      subtitle = field.value;
      continue;
    }

    if (field.key === "period") {
      period = field.value;
      continue;
    }

    if (field.key === "meta") {
      meta = field.value;
      continue;
    }

    if (field.key === "summary") {
      summary = field.value;
      continue;
    }

    if (field.key === "subtitleLine") {
      subtitleLines.push(parseCardSubtitleLine(field.value, "hero", "subtitleLine"));
      continue;
    }

    throw new Error(`Markdown "::hero" does not support field "${field.key}".`);
  }

  if (!name) {
    throw new Error('Markdown "::hero" requires "name".');
  }

  if (!title && legacyRole) {
    title = legacyRole;
  }

  if (!meta && legacyExperienceLabel && legacyExperience) {
    meta = `${legacyExperienceLabel}: ${legacyExperience}`;
  }

  if ((!title || !meta) && (legacyRole || legacyExperienceLabel || legacyExperience)) {
    if (!legacyRole || !legacyExperienceLabel || !legacyExperience) {
      throw new Error(
        'Markdown "::hero" legacy fields require "role", "experienceLabel", and "experience" together.',
      );
    }
  }

  return {
    ...presentation,
    name,
    photo: normalizeOptionalField(photo),
    title: normalizeOptionalField(title),
    subtitle: normalizeOptionalField(subtitle),
    period: normalizeOptionalField(period),
    meta: normalizeOptionalField(meta),
    summary: normalizeOptionalField(summary),
    subtitleLines,
    contacts,
  };
}

function parseCardDirective(lines: string[]): CardBlock {
  let kind: CardKind | undefined;
  let title = "";
  let subtitle = "";
  let period = "";
  let meta = "";
  let summary = "";
  let legacyRole = "";
  let presentation = createDefaultPresentation("card");
  let hasExplicitFill = false;
  let hasExplicitStroke = false;
  const bullets: string[] = [];
  const subtitleLines: CardSubtitleLine[] = [];

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const field = splitDirectiveField(trimmedLine, "card");

    if (field.key === "kind") {
      if (!isCardKind(field.value)) {
        throw new Error(`Markdown "::card" uses unsupported kind "${field.value}".`);
      }

      kind = field.value;
      continue;
    }

    if (field.key === "variant") {
      if (field.value !== "outline") {
        throw new Error(`Markdown "::card" uses unsupported variant "${field.value}".`);
      }

      presentation = applyLegacyOutlineVariant(presentation, hasExplicitFill, hasExplicitStroke);
      continue;
    }

    if (isCardPresentationField(field.key)) {
      presentation = applyCardPresentationField(presentation, field, "card");

      if (field.key === "fill") {
        hasExplicitFill = true;
      }

      if (field.key === "stroke") {
        hasExplicitStroke = true;
      }

      continue;
    }

    if (field.key === "title") {
      title = field.value;
      continue;
    }

    if (field.key === "subtitle") {
      subtitle = field.value;
      continue;
    }

    if (field.key === "role") {
      legacyRole = field.value;
      continue;
    }

    if (field.key === "period") {
      period = field.value;
      continue;
    }

    if (field.key === "meta") {
      meta = field.value;
      continue;
    }

    if (field.key === "summary") {
      summary = field.value;
      continue;
    }

    if (field.key === "bullet") {
      bullets.push(field.value);
      continue;
    }

    if (field.key === "subtitleLine") {
      subtitleLines.push(parseCardSubtitleLine(field.value, "card", "subtitleLine"));
      continue;
    }

    if (field.key === "roleLine") {
      subtitleLines.push(parseCardSubtitleLine(field.value, "card", "roleLine"));
      continue;
    }

    throw new Error(`Markdown "::card" does not support field "${field.key}".`);
  }

  if (!kind || !title) {
    throw new Error('Markdown "::card" requires "kind" and "title".');
  }

  if (!subtitle && legacyRole) {
    subtitle = legacyRole;
  }

  return {
    ...presentation,
    kind,
    title,
    subtitle: normalizeOptionalField(subtitle),
    period: normalizeOptionalField(period),
    meta: normalizeOptionalField(meta),
    summary: normalizeOptionalField(summary),
    subtitleLines,
    bullets,
  };
}

function parseSkillGroupDirective(lines: string[]): SkillGroupBlock {
  let title = "";
  let variant: SkillGroupVariant | undefined;
  const skills: string[] = [];

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const field = splitDirectiveField(trimmedLine, "skill-group");

    if (field.key === "title") {
      title = field.value;
      continue;
    }

    if (field.key === "variant") {
      if (!isSkillGroupVariant(field.value)) {
        throw new Error(`Markdown "::skill-group" uses unsupported variant "${field.value}".`);
      }

      variant = field.value;
      continue;
    }

    if (field.key === "skill") {
      skills.push(field.value);
      continue;
    }

    throw new Error(`Markdown "::skill-group" does not support field "${field.key}".`);
  }

  if (!title || !variant) {
    throw new Error('Markdown "::skill-group" requires "title" and "variant".');
  }

  if (!skills.length) {
    throw new Error('Markdown "::skill-group" requires at least one "skill".');
  }

  return {
    title,
    variant,
    skills,
  };
}

function splitDirectiveField(line: string, directiveName: string) {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex === -1) {
    throw new Error(`Markdown "::${directiveName}" has invalid line "${line}".`);
  }

  const key = line.slice(0, separatorIndex).trim();
  const value = line.slice(separatorIndex + 1).trim();

  if (!key) {
    throw new Error(`Markdown "::${directiveName}" has invalid line "${line}".`);
  }

  return { key, value };
}

function parseHeroContact(value: string): HeroContact {
  const [type, label, href, ...rest] = value.split("|").map((part) => part.trim());

  if (!type || !label || !href || rest.length) {
    throw new Error('Markdown "::hero" contact must use "type|label|href".');
  }

  if (!isHeroContactType(type)) {
    throw new Error(`Markdown "::hero" uses unsupported contact type "${type}".`);
  }

  const safeHref = sanitizeHref(href);

  if (!safeHref) {
    throw new Error(`Markdown "::hero" contact has unsupported href "${href}".`);
  }

  return {
    type,
    label,
    href: safeHref,
  };
}

function parseCardSubtitleLine(
  value: string,
  directiveName: "hero" | "card",
  fieldName: "subtitleLine" | "roleLine",
): CardSubtitleLine {
  const [text, period, ...rest] = value.split("|").map((part) => part.trim());

  if (!text || !period || rest.length) {
    throw new Error(`Markdown "::${directiveName}" ${fieldName} must use "text|period".`);
  }

  return { text, period };
}

function createDefaultPresentation(target: "hero" | "card"): CardPresentation {
  if (target === "hero") {
    return {
      fill: "gray",
      stroke: "none",
      headingVariant: "page",
    };
  }

  return {
    fill: "none",
    stroke: "gray",
    headingVariant: "card",
  };
}

function applyLegacyOutlineVariant(
  presentation: CardPresentation,
  hasExplicitFill: boolean,
  hasExplicitStroke: boolean,
): CardPresentation {
  return {
    ...presentation,
    fill: hasExplicitFill ? presentation.fill : "none",
    stroke: hasExplicitStroke ? presentation.stroke : "accent",
  };
}

function isCardPresentationField(key: string) {
  return key === "fill" || key === "stroke" || key === "headingVariant";
}

function applyCardPresentationField(
  presentation: CardPresentation,
  field: { key: string; value: string },
  directiveName: "hero" | "card",
) {
  if (field.key === "fill") {
    if (!isCardFill(field.value)) {
      throw new Error(`Markdown "::${directiveName}" uses unsupported fill "${field.value}".`);
    }

    return {
      ...presentation,
      fill: field.value,
    };
  }

  if (field.key === "stroke") {
    if (!isCardStroke(field.value)) {
      throw new Error(`Markdown "::${directiveName}" uses unsupported stroke "${field.value}".`);
    }

    return {
      ...presentation,
      stroke: field.value,
    };
  }

  if (!isCardHeadingVariant(field.value)) {
    throw new Error(`Markdown "::${directiveName}" uses unsupported headingVariant "${field.value}".`);
  }

  return {
    ...presentation,
    headingVariant: field.value,
  };
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

function isHeroContactType(value: string): value is HeroContactType {
  return value === "phone" || value === "email" || value === "telegram";
}

function isCardKind(value: string): value is CardKind {
  return value === "experience" || value === "education";
}

function isCardFill(value: string): value is CardFill {
  return value === "none" || value === "gray" || value === "accent";
}

function isCardStroke(value: string): value is CardStroke {
  return value === "none" || value === "gray" || value === "accent";
}

function isCardHeadingVariant(value: string): value is CardHeadingVariant {
  return value === "page" || value === "card";
}

function isSkillGroupVariant(value: string): value is SkillGroupVariant {
  return value === "solid" || value === "outline";
}

function normalizeOptionalField(value: string) {
  return value.trim() ? value : undefined;
}
