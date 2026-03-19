import { createElement } from "react";
import { createBrowserRouter } from "react-router";
import { DocumentPage } from "./components/DocumentPage";
import { Layout } from "./components/Layout";
import { notFoundDocument, pageDocuments, postDocuments, projectDocuments } from "./content/documents";

const childRoutes = pageDocuments.map((document) =>
  document.route === "/"
    ? {
        index: true,
        element: createElement(DocumentPage, { document }),
      }
    : {
        path: document.route.slice(1),
        element: createElement(DocumentPage, { document }),
      },
);

const postRoutes = postDocuments.map((document) => ({
  path: document.route.slice(1),
  element: createElement(DocumentPage, { document }),
}));

const projectRoutes = projectDocuments.map((document) => ({
  path: document.route.slice(1),
  element: createElement(DocumentPage, { document }),
}));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      ...childRoutes,
      ...postRoutes,
      ...projectRoutes,
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
