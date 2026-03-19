import { buildRouteRegistry } from "./contentUtils";
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
    };

export { navigationItems, pages, posts };

export const pageDocuments: SiteDocument[] = pages.map((page) => createSiteDocument("page", page));

export const postDocuments: SiteDocument[] = posts.map((post) => createSiteDocument("post", post));

export const siteDocuments = [...pageDocuments, ...postDocuments];

buildRouteRegistry(siteDocuments, "Site document");

export const notFoundDocument = getPageBySlug("not-found");

if (!notFoundDocument) {
  throw new Error('System page "not-found" is required.');
}

function createSiteDocument(kind: "page", document: PageDefinition): SiteDocument;
function createSiteDocument(kind: "post", document: PostDefinition): SiteDocument;
function createSiteDocument(kind: SiteDocument["kind"], document: PageDefinition | PostDefinition): SiteDocument {
  if (kind === "page") {
    return {
      kind,
      slug: document.slug,
      route: document.route,
      page: document as PageDefinition,
    };
  }

  if (kind === "post") {
    return {
      kind,
      slug: document.slug,
      route: document.route,
      post: document as PostDefinition,
    };
  }

  throw new Error(`Unsupported site document kind "${kind satisfies never}".`);
}
