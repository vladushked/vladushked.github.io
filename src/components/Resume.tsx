import { getMarkdownPage } from "../content/markdownPages";
import { MarkdownPage } from "./MarkdownPage";

export function Resume() {
  return <MarkdownPage page={getMarkdownPage("/resume")} />;
}
