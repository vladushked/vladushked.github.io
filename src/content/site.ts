import { pages } from "./pages";
import { posts, type PostDefinition } from "./posts";
import type { ListItem, ListItemIcon } from "../components/ui/primitives";
import type { Language } from "../i18n";
export const socials = [
  { label: "GitHub", href: "https://github.com/vladushked" },
  { label: "Telegram", href: "https://t.me/vladislavplotnikov" },
  { label: "email", href: "mailto:vladislav.a.plotnikov@yandex.ru" },
];
function projectIcon(value?: string): ListItemIcon | undefined {
  if (!value) return undefined;
  return value.startsWith("/") ? { src: value } : { emoji: value };
}
export const projectItems: ListItem[] = pages
  .filter((page) => page.route.startsWith("/projects/"))
  .map((page) => ({
    id: page.slug,
    title: page.meta.title || page.slug,
    href: page.route,
    description: page.meta.description,
    tags: page.meta.projectTags,
    icon: projectIcon(page.meta.projectIcon),
  }));
export function postListItem(
  post: PostDefinition,
  compact = false,
  language: Language = "ru",
): ListItem {
  return {
    id: post.slug,
    title: compact
      ? post.meta.title.replace(/\s*\(контакты и материалы\)$/, "")
      : post.meta.title,
    href: post.route,
    tags: post.meta.tags,
    dateTime: post.meta.date,
    date: new Intl.DateTimeFormat(language === "en" ? "en-GB" : "ru-RU").format(
      new Date(post.meta.date + "T00:00:00Z"),
    ),
    icon: {
      emoji: post.meta.tags.includes("ROS Meetup")
        ? "🎙️"
        : post.meta.tags.includes("Datafest")
          ? "📊"
          : "🤿",
    },
  };
}
export const latestPosts = posts
  .filter((post) => post.meta.feed === "blog")
  .map((post) => postListItem(post, true));
export const topicOptions = (items: ListItem[]) =>
  [
    ...new Set(
      items
        .flatMap((item) => item.tags ?? [])
        .filter((tag) => !/^\d{4}$/.test(tag)),
    ),
  ].sort((a, b) => a.localeCompare(b, "ru"));
export const matchesTopics = (item: ListItem, selected: string[]) =>
  !selected.length || selected.some((topic) => item.tags?.includes(topic));
