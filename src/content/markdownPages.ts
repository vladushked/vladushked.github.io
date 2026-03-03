import menuSource from "./menu.md?raw";

const pageSources = import.meta.glob("./pages/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const supportedMenuIcons = ["user", "file-text", "folder-open", "book-open"] as const;

type ParsedMarkdownSource = {
  meta: Record<string, string>;
  content: string;
};

export type MenuIconKey = (typeof supportedMenuIcons)[number];

export type MenuItemDefinition = {
  id: string;
  page: string;
  route: string;
  label: string;
  icon?: MenuIconKey;
};

export type MarkdownPageMeta = {
  title?: string;
  eyebrow?: string;
  description?: string;
};

export type MarkdownPageDefinition = {
  slug: string;
  meta: MarkdownPageMeta;
  content: string;
};

export type RoutedMarkdownPage = MarkdownPageDefinition & {
  route: string;
  menu: MenuItemDefinition;
};

const parsedPages = Object.entries(pageSources)
  .map(([path, source]) => parseMarkdownPage(extractSlug(path), source))
  .sort((left, right) => left.slug.localeCompare(right.slug));

const pageRegistry = buildPageRegistry(parsedPages);
const menuItems = parseMenu(menuSource);
buildMenuRegistry(menuItems);

export const routedPages = buildRoutedPages(menuItems, pageRegistry);

const pageRouteRegistry = buildRouteRegistry(routedPages);

export const navigationItems = routedPages.map((page) => page.menu);

export function getMarkdownPage(route: string) {
  return pageRouteRegistry[route];
}

function extractSlug(path: string) {
  const match = path.match(/\/([^/]+)\.md$/);

  if (!match) {
    throw new Error(`Unable to determine markdown page slug for "${path}".`);
  }

  return match[1];
}

function parseMarkdownPage(slug: string, source: string): MarkdownPageDefinition {
  const { meta, content } = parseFrontmatter(slug, source);

  return {
    slug,
    meta: {
      title: normalizeOptionalField(meta.title),
      eyebrow: normalizeOptionalField(meta.eyebrow),
      description: normalizeOptionalField(meta.description),
    },
    content,
  };
}

function buildPageRegistry(pages: MarkdownPageDefinition[]) {
  const registry: Record<string, MarkdownPageDefinition> = {};

  for (const page of pages) {
    if (registry[page.slug]) {
      throw new Error(`Markdown page slug "${page.slug}" is declared more than once.`);
    }

    registry[page.slug] = page;
  }

  return registry;
}

function parseMenu(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const items: MenuItemDefinition[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmedLine = lines[index].trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine !== "::menu-item") {
      throw new Error(`Unsupported menu entry "${trimmedLine}". Use "::menu-item".`);
    }

    const bodyLines: string[] = [];
    index += 1;

    while (index < lines.length) {
      const menuLine = lines[index].trim();

      if (menuLine === "::") {
        items.push(buildMenuItem(bodyLines));
        index += 1;
        break;
      }

      bodyLines.push(lines[index]);
      index += 1;
    }

    if (index >= lines.length && lines[lines.length - 1]?.trim() !== "::") {
      throw new Error('Menu directive "::menu-item" is not closed.');
    }
  }

  if (!items.length) {
    throw new Error('Content menu is empty. Add at least one "::menu-item" entry.');
  }

  return items;
}

function buildMenuItem(lines: string[]): MenuItemDefinition {
  let id = "";
  let page = "";
  let route = "";
  let label = "";
  let icon: MenuIconKey | undefined;

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const field = splitField(trimmedLine, "menu");

    if (field.key === "id") {
      id = field.value;
      continue;
    }

    if (field.key === "page") {
      page = field.value;
      continue;
    }

    if (field.key === "route") {
      route = normalizeRoute(field.value);
      continue;
    }

    if (field.key === "label") {
      label = field.value;
      continue;
    }

    if (field.key === "icon") {
      if (!isMenuIconKey(field.value)) {
        throw new Error(`Menu uses unsupported icon "${field.value}".`);
      }

      icon = field.value;
      continue;
    }

    throw new Error(`Menu does not support field "${field.key}".`);
  }

  if (!id || !page || !route || !label) {
    throw new Error('Menu entry requires "id", "page", "route", and "label".');
  }

  return {
    id,
    page,
    route,
    label,
    icon,
  };
}

function buildMenuRegistry(items: MenuItemDefinition[]) {
  const registry: Record<string, MenuItemDefinition> = {};
  const routeOwners = new Map<string, string>();
  const pageOwners = new Map<string, string>();

  for (const item of items) {
    if (registry[item.id]) {
      throw new Error(`Menu item "${item.id}" is declared more than once.`);
    }

    const routeOwner = routeOwners.get(item.route);

    if (routeOwner) {
      throw new Error(`Menu route "${item.route}" is declared by both "${routeOwner}" and "${item.id}".`);
    }

    const pageOwner = pageOwners.get(item.page);

    if (pageOwner) {
      throw new Error(`Markdown page "${item.page}" is linked by both "${pageOwner}" and "${item.id}".`);
    }

    registry[item.id] = item;
    routeOwners.set(item.route, item.id);
    pageOwners.set(item.page, item.id);
  }

  return registry;
}

function buildRoutedPages(
  items: MenuItemDefinition[],
  pages: Record<string, MarkdownPageDefinition>,
) {
  return items.map((item) => {
    const page = pages[item.page];

    if (!page) {
      throw new Error(`Menu item "${item.id}" points to missing markdown page "${item.page}".`);
    }

    return {
      ...page,
      route: item.route,
      menu: item,
    };
  });
}

function buildRouteRegistry(pages: RoutedMarkdownPage[]) {
  const registry: Record<string, RoutedMarkdownPage> = {};
  let hasRootRoute = false;

  for (const page of pages) {
    if (page.route === "/") {
      hasRootRoute = true;
    }

    registry[page.route] = page;
  }

  if (!hasRootRoute) {
    throw new Error('Content menu requires a "/" route.');
  }

  return registry;
}

// The site only supports a small, explicit frontmatter schema.
function parseFrontmatter(slug: string, source: string): ParsedMarkdownSource {
  const normalized = source.replace(/\r\n/g, "\n").trim();

  if (!normalized.startsWith("---\n")) {
    throw new Error(`Markdown page "${slug}" is missing frontmatter.`);
  }

  const lines = normalized.split("\n");
  const closingIndex = lines.indexOf("---", 1);

  if (closingIndex === -1) {
    throw new Error(`Markdown page "${slug}" has an unclosed frontmatter block.`);
  }

  const meta: Record<string, string> = {};

  for (const line of lines.slice(1, closingIndex)) {
    if (!line.trim()) {
      continue;
    }

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      throw new Error(`Markdown page "${slug}" has invalid frontmatter line "${line}".`);
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (!key) {
      throw new Error(`Markdown page "${slug}" has a frontmatter entry without a key.`);
    }

    meta[key] = stripMatchingQuotes(rawValue);
  }

  return {
    meta,
    content: lines.slice(closingIndex + 1).join("\n").trim(),
  };
}

function splitField(line: string, scope: string) {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex === -1) {
    throw new Error(`Invalid ${scope} field "${line}".`);
  }

  const key = line.slice(0, separatorIndex).trim();
  const rawValue = line.slice(separatorIndex + 1).trim();

  if (!key) {
    throw new Error(`Invalid ${scope} field "${line}".`);
  }

  return {
    key,
    value: stripMatchingQuotes(rawValue),
  };
}

function normalizeRoute(value: string) {
  const route = value.trim();

  if (!route.startsWith("/")) {
    throw new Error(`Menu route "${value}" must start with "/".`);
  }

  if (route.length > 1 && route.endsWith("/")) {
    return route.slice(0, -1);
  }

  return route;
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

function normalizeOptionalField(value?: string) {
  return value && value.trim() ? value : undefined;
}

function isMenuIconKey(value: string): value is MenuIconKey {
  return supportedMenuIcons.includes(value as MenuIconKey);
}
