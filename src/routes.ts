import { createElement } from "react";
import { createBrowserRouter } from "react-router";
import { DocumentPage } from "./components/DocumentPage";
import { HomePage } from "./components/HomePage";
import { Layout } from "./components/Layout";
import { notFoundDocument, siteDocuments } from "./content/documents";
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: createElement(HomePage) },
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
