import type { ProjectDefinition } from "./projects";
import { projects } from "./projects";
import type { PageDefinition } from "./pages";
import { getPageBySlug, navigationItems, pages } from "./pages";
import type { PostDefinition } from "./posts";
import { posts } from "./posts";

export type SiteDocument =
  | {
      kind: "page";
      slug: string;
      route: string;
      page: PageDefinition;
    }
  | {
      kind: "post";
      slug: string;
      route: string;
      post: PostDefinition;
    }
  | {
      kind: "project";
      slug: string;
      route: string;
      project: ProjectDefinition;
    };

export { navigationItems, pages, posts, projects };

export const pageDocuments: SiteDocument[] = pages.map((page) => ({
  kind: "page",
  slug: page.slug,
  route: page.route,
  page,
}));

export const postDocuments: SiteDocument[] = posts.map((post) => ({
  kind: "post",
  slug: post.slug,
  route: post.route,
  post,
}));

export const projectDocuments: SiteDocument[] = projects.map((project) => ({
  kind: "project",
  slug: project.slug,
  route: project.route,
  project,
}));

export const notFoundDocument = getPageBySlug("not-found");

if (!notFoundDocument) {
  throw new Error('System page "not-found" is required.');
}
