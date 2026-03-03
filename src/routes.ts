import { createElement } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { MarkdownPage } from "./components/MarkdownPage";
import { routedPages } from "./content/markdownPages";

const childRoutes = routedPages.map((page) =>
  page.route === "/"
    ? {
        index: true,
        element: createElement(MarkdownPage, { page }),
      }
    : {
        path: page.route.slice(1),
        element: createElement(MarkdownPage, { page }),
      },
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: childRoutes,
  },
]);
