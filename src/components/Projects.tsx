import { getMarkdownPage } from "../content/markdownPages";
import { MarkdownPage } from "./MarkdownPage";

export function Projects() {
  return <MarkdownPage page={getMarkdownPage("/projects")} />;
}
