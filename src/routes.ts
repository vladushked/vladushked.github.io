import { createElement } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { DocumentPage } from "./components/DocumentPage";
import { HomePage } from "./components/HomePage";
import { Layout } from "./components/Layout";
import { notFoundDocument, siteDocuments } from "./content/documents";

function LegacyGenealogyRedirect() {
  const { search, hash } = useLocation();
  return createElement(Navigate, {
    to: { pathname: "/projects/genealogy-graph", search, hash },
    replace: true,
  });
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: createElement(HomePage) },
      { path: "projects/genealogy", Component: LegacyGenealogyRedirect },
      ...siteDocuments
        .filter((document) => document.route !== "/")
        .map((document) => ({
          path: document.route.slice(1),
          element: createElement(DocumentPage, { document }),
        })),
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
