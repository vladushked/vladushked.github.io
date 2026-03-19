import { createElement } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { DocumentPage } from "./components/DocumentPage";
import { Layout } from "./components/Layout";
import { notFoundDocument, siteDocuments, type SiteDocument } from "./content/documents";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "blog",
        element: createElement(Navigate, { to: "/", replace: true }),
      },
      ...siteDocuments.map(createDocumentRoute),
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

function createDocumentRoute(document: SiteDocument) {
  if (document.route === "/") {
    return {
      index: true,
      element: createElement(DocumentPage, { document }),
    };
  }

  return {
    path: document.route.slice(1),
    element: createElement(DocumentPage, { document }),
  };
}
