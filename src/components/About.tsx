import { getMarkdownPage } from "../content/markdownPages";
import { MarkdownPage } from "./MarkdownPage";

export function About() {
  return <MarkdownPage page={getMarkdownPage("/")} />;
}
