import {
  normalizeOptionalField,
  normalizeRequiredField,
  parseFrontmatter,
  parseInteger,
  parseMarkdownBlocks,
  type TextBlock,
} from "./sharedMarkdown";

const projectSources = import.meta.glob("./projects/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export type ProjectMeta = {
  title: string;
  order: number;
  summary?: string;
};

export type ProjectDefinition = {
  slug: string;
  route: string;
  meta: ProjectMeta;
  blocks: TextBlock[];
  previewText?: string;
};

export const projects = Object.entries(projectSources)
  .map(([path, source]) => parseProject(extractSlug(path), source))
  .sort((left, right) => left.meta.order - right.meta.order);

const projectRegistry = buildProjectRegistry(projects);

export function getProjectBySlug(slug: string) {
  return projectRegistry[slug];
}

function extractSlug(path: string) {
  const match = path.match(/\/([^/]+)\.md$/);

  if (!match) {
    throw new Error(`Unable to determine project slug for "${path}".`);
  }

  return match[1];
}

function parseProject(slug: string, source: string): ProjectDefinition {
  const { meta, content } = parseFrontmatter("Project", slug, source);
  const title = normalizeRequiredField(meta.title, "Project", slug, "title");
  const order = parseInteger(meta.order, "Project", slug, "order");
  const summary = normalizeOptionalField(meta.summary);
  const blocks = parseMarkdownBlocks<never>("Project", slug, content);

  return {
    slug,
    route: `/projects/${slug}`,
    meta: {
      title,
      order,
      summary,
    },
    blocks,
    previewText: summary ?? getPreviewText(blocks),
  };
}

function buildProjectRegistry(items: ProjectDefinition[]) {
  const registry: Record<string, ProjectDefinition> = {};
  const routeOwners = new Map<string, string>();

  for (const project of items) {
    if (registry[project.slug]) {
      throw new Error(`Project slug "${project.slug}" is declared more than once.`);
    }

    const routeOwner = routeOwners.get(project.route);

    if (routeOwner) {
      throw new Error(`Project route "${project.route}" is declared by both "${routeOwner}" and "${project.slug}".`);
    }

    registry[project.slug] = project;
    routeOwners.set(project.route, project.slug);
  }

  return registry;
}

function getPreviewText(blocks: TextBlock[]) {
  for (const block of blocks) {
    if (block.type === "paragraph" || block.type === "blockquote") {
      return block.text;
    }

    if (block.type === "unordered-list" || block.type === "ordered-list") {
      return block.items[0];
    }
  }

  return undefined;
}
