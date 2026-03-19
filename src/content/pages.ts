import {
  normalizeOptionalField,
  normalizeRequiredField,
  normalizeRoute,
  parseBoolean,
  parseFrontmatter,
  parseInteger,
  parseMarkdownBlocks,
  sanitizeHref,
  splitField,
  type TextBlock,
} from "./sharedMarkdown";

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

export type PageFeedBlock =
  | { type: "post-feed" }
  | { type: "project-feed" };

export type PageBlock = TextBlock | HeroBlock | CardBlock | SkillGroupBlock | PageFeedBlock;

export type PageDefinition = {
  slug: string;
  route: string;
  meta: PageHeaderMeta;
  blocks: PageBlock[];
  navigation?: NavigationItemDefinition;
};

export const pages = Object.entries(pageSources)
  .map(([path, source]) => parsePage(extractSlug(path), source))
  .sort((left, right) => left.route.localeCompare(right.route));

const pageRegistry = buildPageRegistry(pages);
const routeRegistry = buildRouteRegistry(pages);

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

function extractSlug(path: string) {
  const match = path.match(/\/([^/]+)\.md$/);

  if (!match) {
    throw new Error(`Unable to determine markdown page slug for "${path}".`);
  }

  return match[1];
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

function buildPageRegistry(items: PageDefinition[]) {
  const registry: Record<string, PageDefinition> = {};

  for (const page of items) {
    if (registry[page.slug]) {
      throw new Error(`Page slug "${page.slug}" is declared more than once.`);
    }

    registry[page.slug] = page;
  }

  return registry;
}

function buildRouteRegistry(items: PageDefinition[]) {
  const registry: Record<string, PageDefinition> = {};
  let hasRootRoute = false;

  for (const page of items) {
    if (registry[page.route]) {
      throw new Error(`Page route "${page.route}" is declared more than once.`);
    }

    if (page.route === "/") {
      hasRootRoute = true;
    }

    registry[page.route] = page;
  }

  if (!hasRootRoute) {
    throw new Error('Pages require a "/" route.');
  }

  return registry;
}

function parsePageBlocks(slug: string, source: string) {
  const blocks = parseMarkdownBlocks<PageBlock>("Page", slug, source, {
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

      throw new Error(`Page "${context.slug}" directive "${opener}" is not closed.`);
    },
  });

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
    return { type: "post-feed" };
  }

  if (name === "project-feed") {
    return { type: "project-feed" };
  }

  throw new Error(`Page "${slug}" uses unsupported directive "::${name}".`);
}

function parseHeroDirective(lines: string[], slug: string): HeroBlock {
  let name = "";
  let photo = "";
  let fill: CardFill = "none";
  let stroke: CardStroke = "gray";
  let headingVariant: CardHeadingVariant = "page";
  let title = "";
  let subtitle = "";
  let period = "";
  let meta = "";
  let summary = "";
  const subtitleLines: CardSubtitleLine[] = [];
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

    throw new Error(`Page "${slug}" "::hero" does not support field "${field.key}".`);
  }

  if (!name) {
    throw new Error(`Page "${slug}" "::hero" requires "name".`);
  }

  return {
    type: "hero",
    name,
    photo: normalizeOptionalField(photo),
    fill,
    stroke,
    headingVariant,
    title: normalizeOptionalField(title),
    subtitle: normalizeOptionalField(subtitle),
    period: normalizeOptionalField(period),
    meta: normalizeOptionalField(meta),
    summary: normalizeOptionalField(summary),
    subtitleLines,
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

function isMenuIconKey(value: string): value is MenuIconKey {
  return supportedMenuIcons.includes(value as MenuIconKey);
}

function isHeroContactType(value: string): value is HeroContactType {
  return ["phone", "email", "telegram"].includes(value);
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
