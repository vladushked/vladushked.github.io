import { createElement } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { MarkdownPage } from "./components/MarkdownPage";
import { PostPage } from "./components/PostPage";
import { ProjectPage } from "./components/ProjectPage";
import { routedPages } from "./content/markdownPages";
import { posts } from "./content/posts";
import { projects } from "./content/projects";

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

const postRoutes = posts.map((post) => ({
  path: post.route.slice(1),
  element: createElement(PostPage, { post }),
}));

const projectRoutes = projects.map((project) => ({
  path: project.route.slice(1),
  element: createElement(ProjectPage, { project }),
}));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [...childRoutes, ...postRoutes, ...projectRoutes],
  },
]);
