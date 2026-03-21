import {
  normalizeOptionalField,
  normalizeRequiredField,
  normalizeRoute,
  parseBoolean,
  parseFrontmatter,
  parseInteger,
  sanitizeHref,
  splitField,
  type TextBlock,
} from "./sharedMarkdown";
import { buildRouteRegistry, buildSlugRegistry, extractMarkdownSlug, parseDirectiveBlocks } from "./contentUtils";

const pageSources = import.meta.glob("./pages/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const supportedMenuIcons = ["user", "file-text", "folder-open", "book-open"] as const;

type HeroContactType = "phone" | "email" | "telegram";
type CardKind = "experience" | "education";
type CardFill = "none" | "gray" | "accent";
type CardStroke = "none" | "gray" | "accent";
type CardHeadingVariant = "page" | "card";
type SkillGroupVariant = "solid" | "outline";
type HeroImageSize = "small" | "medium" | "large";
type HeroPhotoLayout = "side" | "banner";

export type MenuIconKey = (typeof supportedMenuIcons)[number];

export type NavigationItemDefinition = {
  id: string;
  page: string;
  route: string;
  label: string;
  icon: MenuIconKey;
  order: number;
};

export type PageHeaderMeta = {
  title?: string;
  eyebrow?: string;
  description?: string;
};

type HeroContact = {
  type: HeroContactType;
  label: string;
  href: string;
};

type HeroActionVariant = "primary" | "secondary";

type HeroAction = {
  label: string;
  href: string;
  variant: HeroActionVariant;
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

export type HeroBlock = CardPresentation &
  Omit<CardBodyContent, "bullets"> & {
    type: "hero";
    name: string;
    photo?: string;
    imageSize: HeroImageSize;
    photoLayout: HeroPhotoLayout;
    actions: HeroAction[];
    contacts: HeroContact[];
  };

export type CardBlock = CardPresentation &
  CardBodyContent & {
    type: "card";
    kind: CardKind;
  };

export type SkillGroupBlock = {
  type: "skill-group";
  title: string;
  variant: SkillGroupVariant;
  skills: string[];
};

export type PageFeedBlock = {
  type: "post-feed";
  feed: string;
};

export type PageBlock = TextBlock | HeroBlock | CardBlock | SkillGroupBlock | PageFeedBlock;

export type PageDefinition = {
  slug: string;
  route: string;
  meta: PageHeaderMeta;
  blocks: PageBlock[];
  navigation?: NavigationItemDefinition;
};

export const pages = Object.entries(pageSources)
  .map(([path, source]) => parsePage(extractMarkdownSlug(path, "Page"), source))
  .sort((left, right) => left.route.localeCompare(right.route));

const pageRegistry = buildSlugRegistry(pages, "Page");
const routeRegistry = buildRouteRegistry(pages, "Page");

export const navigationItems = pages
  .filter((page): page is PageDefinition & { navigation: NavigationItemDefinition } => Boolean(page.navigation))
  .map((page) => page.navigation)
  .sort((left, right) => left.order - right.order);

export function getPageBySlug(slug: string) {
  return pageRegistry[slug];
}

export function getPageByRoute(route: string) {
  return routeRegistry[route];
}

function parsePage(slug: string, source: string): PageDefinition {
  const { meta, content } = parseFrontmatter("Page", slug, source);
  const route = normalizeRoute(
    normalizeRequiredField(meta.route, "Page", slug, "route"),
    "Page",
    slug,
  );
  const blocks = parsePageBlocks(slug, content);
  const showInNav = parseBoolean(meta.showInNav) ?? false;

  return {
    slug,
    route,
    meta: {
      title: normalizeOptionalField(meta.title),
      eyebrow: normalizeOptionalField(meta.eyebrow),
      description: normalizeOptionalField(meta.description),
    },
    blocks,
    navigation: showInNav ? parseNavigationMeta(slug, route, meta) : undefined,
  };
}

function parseNavigationMeta(slug: string, route: string, meta: Record<string, string>) {
  const label = normalizeRequiredField(meta.navLabel, "Page", slug, "navLabel");
  const icon = normalizeRequiredField(meta.navIcon, "Page", slug, "navIcon");
  const order = parseInteger(meta.order, "Page", slug, "order");

  if (!isMenuIconKey(icon)) {
    throw new Error(`Page "${slug}" uses unsupported navIcon "${icon}".`);
  }

  return {
    id: slug,
    page: slug,
    route,
    label,
    icon,
    order,
  };
}

function parsePageBlocks(slug: string, source: string) {
  const blocks = parseDirectiveBlocks("Page", slug, source, buildDirectiveBlock);

  const heroCount = blocks.filter((block) => block.type === "hero").length;

  if (heroCount > 1) {
    throw new Error(`Page "${slug}" may not contain more than one "::hero" block.`);
  }

  return blocks;
}

function buildDirectiveBlock(name: string, bodyLines: string[], slug: string): PageBlock {
  if (name === "hero") {
    return parseHeroDirective(bodyLines, slug);
  }

  if (name === "card") {
    return parseCardDirective(bodyLines, slug);
  }

  if (name === "skill-group") {
    return parseSkillGroupDirective(bodyLines, slug);
  }

  if (name === "post-feed") {
    return parsePostFeedDirective(bodyLines, slug);
  }

  throw new Error(`Page "${slug}" uses unsupported directive "::${name}".`);
}

function parsePostFeedDirective(lines: string[], slug: string): PageFeedBlock {
  let feed = "";

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const field = splitField(trimmedLine, "Page", slug, "post-feed");

    if (field.key !== "feed") {
      throw new Error(`Page "${slug}" "::post-feed" does not support field "${field.key}".`);
    }

    feed = normalizeRequiredField(field.value, "Page", slug, "feed");
  }

  return {
    type: "post-feed",
    feed: normalizeRequiredField(feed, "Page", slug, "feed"),
  };
}

function parseHeroDirective(lines: string[], slug: string): HeroBlock {
  let name = "";
  let photo = "";
  let imageSize: HeroImageSize = "medium";
  let photoLayout: HeroPhotoLayout = "side";
  let fill: CardFill = "none";
  let stroke: CardStroke = "gray";
  let headingVariant: CardHeadingVariant = "page";
  let title = "";
  let subtitle = "";
  let period = "";
  let meta = "";
  let summary = "";
  const subtitleLines: CardSubtitleLine[] = [];
  const actions: HeroAction[] = [];
  const contacts: HeroContact[] = [];

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const field = splitField(trimmedLine, "Page", slug, "hero");

    if (field.key === "name") {
      name = field.value;
      continue;
    }

    if (field.key === "photo") {
      const safeHref = sanitizeHref(field.value);

      if (!safeHref) {
        throw new Error(`Page "${slug}" hero has unsupported photo "${field.value}".`);
      }

      photo = safeHref;
      continue;
    }

    if (field.key === "imageSize") {
      if (!isHeroImageSize(field.value)) {
        throw new Error(`Page "${slug}" hero has unsupported imageSize "${field.value}".`);
      }

      imageSize = field.value;
      continue;
    }

    if (field.key === "photoLayout") {
      if (!isHeroPhotoLayout(field.value)) {
        throw new Error(`Page "${slug}" hero has unsupported photoLayout "${field.value}".`);
      }

      photoLayout = field.value;
      continue;
    }

    if (field.key === "fill" && isCardFill(field.value)) {
      fill = field.value;
      continue;
    }

    if (field.key === "stroke" && isCardStroke(field.value)) {
      stroke = field.value;
      continue;
    }

    if (field.key === "headingVariant" && isCardHeadingVariant(field.value)) {
      headingVariant = field.value;
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
      subtitleLines.push(parseSubtitleLine(field.value, slug, "hero"));
      continue;
    }

    if (field.key === "contact") {
      contacts.push(parseHeroContact(field.value, slug));
      continue;
    }

    if (field.key === "action") {
      actions.push(parseHeroAction(field.value, slug));
      continue;
    }

    throw new Error(`Page "${slug}" "::hero" does not support field "${field.key}".`);
  }

  if (!name) {
    throw new Error(`Page "${slug}" "::hero" requires "name".`);
  }

  return {
    type: "hero",
    name,
    photo: normalizeOptionalField(photo),
    imageSize,
    photoLayout,
    fill,
    stroke,
    headingVariant,
    title: normalizeOptionalField(title),
    subtitle: normalizeOptionalField(subtitle),
    period: normalizeOptionalField(period),
    meta: normalizeOptionalField(meta),
    summary: normalizeOptionalField(summary),
    subtitleLines,
    actions,
    contacts,
  };
}

function parseCardDirective(lines: string[], slug: string): CardBlock {
  let kind = "";
  let title = "";
  let subtitle = "";
  let period = "";
  let meta = "";
  let summary = "";
  let fill: CardFill = "none";
  let stroke: CardStroke = "gray";
  let headingVariant: CardHeadingVariant = "card";
  const subtitleLines: CardSubtitleLine[] = [];
  const bullets: string[] = [];

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const field = splitField(trimmedLine, "Page", slug, "card");

    if (field.key === "kind") {
      kind = field.value;
      continue;
    }

    if (field.key === "title") {
      title = field.value;
      continue;
    }

    if (field.key === "subtitle" || field.key === "role") {
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

    if (field.key === "variant" && field.value === "outline") {
      fill = "none";
      continue;
    }

    if (field.key === "fill" && isCardFill(field.value)) {
      fill = field.value;
      continue;
    }

    if (field.key === "stroke" && isCardStroke(field.value)) {
      stroke = field.value;
      continue;
    }

    if (field.key === "headingVariant" && isCardHeadingVariant(field.value)) {
      headingVariant = field.value;
      continue;
    }

    if (field.key === "subtitleLine" || field.key === "roleLine") {
      subtitleLines.push(parseSubtitleLine(field.value, slug, "card"));
      continue;
    }

    if (field.key === "bullet") {
      bullets.push(field.value);
      continue;
    }

    throw new Error(`Page "${slug}" "::card" does not support field "${field.key}".`);
  }

  if (!isCardKind(kind) || !title) {
    throw new Error(`Page "${slug}" "::card" requires valid "kind" and "title".`);
  }

  return {
    type: "card",
    kind,
    title: normalizeOptionalField(title),
    subtitle: normalizeOptionalField(subtitle),
    period: normalizeOptionalField(period),
    meta: normalizeOptionalField(meta),
    summary: normalizeOptionalField(summary),
    fill,
    stroke,
    headingVariant,
    subtitleLines,
    bullets,
  };
}

function parseSkillGroupDirective(lines: string[], slug: string): SkillGroupBlock {
  let title = "";
  let variant: SkillGroupVariant | "" = "";
  const skills: string[] = [];

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const field = splitField(trimmedLine, "Page", slug, "skill-group");

    if (field.key === "title") {
      title = field.value;
      continue;
    }

    if (field.key === "variant" && isSkillGroupVariant(field.value)) {
      variant = field.value;
      continue;
    }

    if (field.key === "skill") {
      skills.push(field.value);
      continue;
    }

    throw new Error(`Page "${slug}" "::skill-group" does not support field "${field.key}".`);
  }

  if (!title || !variant || !skills.length) {
    throw new Error(`Page "${slug}" "::skill-group" requires "title", "variant", and at least one "skill".`);
  }

  return {
    type: "skill-group",
    title,
    variant,
    skills,
  };
}

function parseSubtitleLine(value: string, slug: string, directiveName: string): CardSubtitleLine {
  const [text, period, ...rest] = value.split("|").map((part) => part.trim());

  if (!text || !period || rest.length) {
    throw new Error(`Page "${slug}" "::${directiveName}" has invalid subtitle line "${value}".`);
  }

  return { text, period };
}

function parseHeroContact(value: string, slug: string): HeroContact {
  const [type, label, href, ...rest] = value.split("|").map((part) => part.trim());

  if (!isHeroContactType(type) || !label || !href || rest.length) {
    throw new Error(`Page "${slug}" hero has invalid contact "${value}".`);
  }

  const safeHref = sanitizeHref(href);

  if (!safeHref) {
    throw new Error(`Page "${slug}" hero has unsupported contact href "${href}".`);
  }

  return { type, label, href: safeHref };
}

function parseHeroAction(value: string, slug: string): HeroAction {
  const [label, href, variant = "primary", ...rest] = value.split("|").map((part) => part.trim());

  if (!label || !href || !isHeroActionVariant(variant) || rest.length) {
    throw new Error(`Page "${slug}" hero has invalid action "${value}".`);
  }

  const safeHref = sanitizeHref(href);

  if (!safeHref) {
    throw new Error(`Page "${slug}" hero has unsupported action href "${href}".`);
  }

  return {
    label,
    href: safeHref,
    variant,
  };
}

function isMenuIconKey(value: string): value is MenuIconKey {
  return supportedMenuIcons.includes(value as MenuIconKey);
}

function isHeroContactType(value: string): value is HeroContactType {
  return ["phone", "email", "telegram"].includes(value);
}

function isHeroActionVariant(value: string): value is HeroActionVariant {
  return ["primary", "secondary"].includes(value);
}

function isCardKind(value: string): value is CardKind {
  return ["experience", "education"].includes(value);
}

function isCardFill(value: string): value is CardFill {
  return ["none", "gray", "accent"].includes(value);
}

function isCardStroke(value: string): value is CardStroke {
  return ["none", "gray", "accent"].includes(value);
}

function isCardHeadingVariant(value: string): value is CardHeadingVariant {
  return ["page", "card"].includes(value);
}

function isSkillGroupVariant(value: string): value is SkillGroupVariant {
  return ["solid", "outline"].includes(value);
}

function isHeroImageSize(value: string): value is HeroImageSize {
  return ["small", "medium", "large"].includes(value);
}

function isHeroPhotoLayout(value: string): value is HeroPhotoLayout {
  return ["side", "banner"].includes(value);
}
