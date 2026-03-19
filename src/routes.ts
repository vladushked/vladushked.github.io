import { createElement } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { DocumentPage } from "./components/DocumentPage";
import { Layout } from "./components/Layout";
import { navigationItems, notFoundDocument, siteDocuments, type SiteDocument } from "./content/documents";

const rootDocument = siteDocuments.find((document) => document.kind === "page" && document.route === "/");
const fallbackRoute = navigationItems[0]?.route;

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      createRootRoute(),
      ...siteDocuments.filter((document) => document.route !== "/").map(createDocumentRoute),
      {
        path: "*",
        element: createElement(DocumentPage, {
          document: {
            kind: "page",
            slug: notFoundDocument.slug,
            route: notFoundDocument.route,
            page: notFoundDocument,
          },
        }),
      },
    ],
  },
]);

function createRootRoute() {
  if (rootDocument) {
    return {
      index: true,
      element: createElement(DocumentPage, { document: rootDocument }),
    };
  }

  if (fallbackRoute) {
    return {
      index: true,
      element: createElement(Navigate, { to: fallbackRoute, replace: true }),
    };
  }

  return {
    index: true,
    element: createElement(DocumentPage, {
      document: {
        kind: "page",
        slug: notFoundDocument.slug,
        route: notFoundDocument.route,
        page: notFoundDocument,
      },
    }),
  };
}

function createDocumentRoute(document: SiteDocument) {
  return {
    path: document.route.slice(1),
    element: createElement(DocumentPage, { document }),
  };
}
