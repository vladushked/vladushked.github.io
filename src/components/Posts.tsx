import { getMarkdownPage } from "../content/markdownPages";
import { MarkdownPage } from "./MarkdownPage";

export function Posts() {
  return <MarkdownPage page={getMarkdownPage("/posts")} />;
}
