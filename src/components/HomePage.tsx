import { getPageBySlug, type HeroBlock } from "../content/pages";
import {
  latestPosts,
  projectItems,
  socials,
} from "../content/site";
import { PersonalHome } from "./ui/PersonalHome";
import { useLanguage } from "../i18n";
export function HomePage() {
  const { t } = useLanguage();
  const page = getPageBySlug("home");
  const identity = page?.blocks.find(
    (block): block is HeroBlock => block.type === "hero",
  );
  if (!identity) throw Error("Homepage requires a Markdown identity block.");
  return (
    <div className="site-preview site-preview--home">
      <PersonalHome
        name={t("name")}
        subtitle={t("role")}
        avatarSrc={identity.photo}
        aboutHref="/about"
        projectsHref="/projects"
        blogHref="/blog"
        consultHref="/consult"
        projects={projectItems}
        posts={latestPosts}
        socials={socials}
        animateEntrance={false}
      />
    </div>
  );
}
