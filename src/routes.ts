import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { About } from "./components/About";
import { Resume } from "./components/Resume";
import { Projects } from "./components/Projects";
import { Posts } from "./components/Posts";
import { PostDetail } from "./components/PostDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: About },
      { path: "resume", Component: Resume },
      { path: "projects", Component: Projects },
      { path: "posts", Component: Posts },
      { path: "posts/:id", Component: PostDetail },
    ],
  },
]);