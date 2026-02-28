import aboutSource from "./pages/about.md?raw";
import postsSource from "./pages/posts.md?raw";
import projectsSource from "./pages/projects.md?raw";
import resumeSource from "./pages/resume.md?raw";

export type MarkdownPageRoute = "/" | "/resume" | "/projects" | "/posts";

type MarkdownPageMetaField = "route" | "title" | "navLabel";

type ParsedFrontmatter = {
  route: MarkdownPageRoute;
  title: string;
  navLabel: string;
  eyebrow?: string;
  description?: string;
};

type ParsedMarkdownSource = {
  meta: ParsedFrontmatter;
  content: string;
};

export type MarkdownPageMeta = {
  route: MarkdownPageRoute;
  title: string;
  navLabel: string;
  eyebrow?: string;
  description?: string;
};

export type MarkdownPageDefinition = {
  slug: string;
  meta: MarkdownPageMeta;
  content: string;
};

const routeOrder: MarkdownPageRoute[] = ["/", "/resume", "/projects", "/posts"];

const parsedPages = [
  parseMarkdownPage("about", aboutSource),
  parseMarkdownPage("resume", resumeSource),
  parseMarkdownPage("projects", projectsSource),
  parseMarkdownPage("posts", postsSource),
];

const pageRegistry = buildPageRegistry(parsedPages);

export const navigationPages = routeOrder.map((route) => pageRegistry[route]);

export function getMarkdownPage(route: MarkdownPageRoute) {
  return pageRegistry[route];
}

function parseMarkdownPage(slug: string, source: string): MarkdownPageDefinition {
  const { meta, content } = parseFrontmatter(slug, source);

  return {
    slug,
    meta,
    content,
  };
}

function buildPageRegistry(pages: MarkdownPageDefinition[]) {
  const registry: Partial<Record<MarkdownPageRoute, MarkdownPageDefinition>> = {};
  const routeOwners = new Map<MarkdownPageRoute, string>();

  for (const page of pages) {
    const existingOwner = routeOwners.get(page.meta.route);

    if (existingOwner) {
      throw new Error(
        `Markdown route "${page.meta.route}" is declared by both "${existingOwner}" and "${page.slug}".`,
      );
    }

    routeOwners.set(page.meta.route, page.slug);
    registry[page.meta.route] = page;
  }

  for (const route of routeOrder) {
    if (!registry[route]) {
      throw new Error(`Missing markdown page for required route "${route}".`);
    }
  }

  return registry as Record<MarkdownPageRoute, MarkdownPageDefinition>;
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

  for (const field of ["route", "title", "navLabel"] as MarkdownPageMetaField[]) {
    if (!meta[field]) {
      throw new Error(`Markdown page "${slug}" is missing required frontmatter field "${field}".`);
    }
  }

  if (!isMarkdownPageRoute(meta.route)) {
    throw new Error(`Markdown page "${slug}" uses unsupported route "${meta.route}".`);
  }

  return {
    meta: {
      route: meta.route,
      title: meta.title,
      navLabel: meta.navLabel,
      eyebrow: normalizeOptionalField(meta.eyebrow),
      description: normalizeOptionalField(meta.description),
    },
    content: lines.slice(closingIndex + 1).join("\n").trim(),
  };
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

function isMarkdownPageRoute(route: string): route is MarkdownPageRoute {
  return routeOrder.includes(route as MarkdownPageRoute);
}
