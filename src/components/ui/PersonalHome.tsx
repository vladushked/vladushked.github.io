import { useEffect, useRef, type MouseEvent } from "react";
import {
  ContentList,
  Identity,
  SocialLinks,
  TextLink,
  type ListItem,
} from "./primitives";
import "./PersonalHome.css";
import { useLanguage } from "../../i18n";
import { LanguageSwitch } from "./LanguageSwitch";
export type PersonalHomeProps = {
  name: string;
  subtitle?: string;
  avatarSrc?: string;
  aboutHref: string;
  projectsHref: string;
  blogHref: string;
  consultHref: string;
  projects: ListItem[];
  posts: ListItem[];
  projectLimit?: number;
  postLimit?: number;
  socials: { label: string; href: string }[];
  onNavigate?: (route: string) => void;
  animateEntrance?: boolean;
};
export function PersonalHome({
  name,
  subtitle,
  avatarSrc,
  aboutHref,
  projectsHref,
  blogHref,
  consultHref,
  projects,
  posts,
  projectLimit = 2,
  postLimit = 3,
  socials,
  onNavigate,
  animateEntrance = true,
}: PersonalHomeProps) {
  const { t } = useLanguage();
  const homeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const home = homeRef.current;
    if (!home || !animateEntrance || typeof home.animate !== "function") return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const rows = home.querySelectorAll<HTMLElement>(
      ".ps-home-identity,.ps-home-section h2,.ps-content-list li,.ps-home-more,.ps-home-footer",
    );
    const tokens = getComputedStyle(home);
    const milliseconds = (name: string, fallback: number) => {
      const value = tokens.getPropertyValue(name).trim();
      const number = parseFloat(value);
      return Number.isFinite(number)
        ? number * (value.endsWith("ms") ? 1 : 1000)
        : fallback;
    };
    const easing =
      tokens.getPropertyValue("--ps-ease-entry").trim() ||
      "cubic-bezier(.16,1,.3,1)";
    const duration = milliseconds("--ps-home-enter", 600);
    const stagger = milliseconds("--ps-home-stagger", 50);
    const animations = [...rows].map((row, index) =>
      row.animate(
        [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0px)" },
        ],
        { duration, delay: (index + 1) * stagger, easing, fill: "backwards" },
      ),
    );
    const finish = () => animations.forEach((animation) => animation.cancel());
    const onFocus = (event: FocusEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.matches(":focus-visible")
      )
        finish();
    };
    home.addEventListener("focusin", onFocus);
    media.addEventListener("change", finish);
    return () => {
      finish();
      home.removeEventListener("focusin", onFocus);
      media.removeEventListener("change", finish);
    };
  }, [animateEntrance]);
  const visit = (route: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      !onNavigate ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey
    )
      return;
    event.preventDefault();
    onNavigate(route);
  };
  return (
    <div className="ps-personal-home" ref={homeRef}>
      <div className="ps-home-identity">
        <Identity
          name={name}
          subtitle={subtitle}
          avatarSrc={avatarSrc}
          href={aboutHref}
          onClick={visit("about")}
          heading="h1"
        />
      </div>
      <section className="ps-home-section" aria-label={t("projects")}>
        <h2>
          <TextLink href={projectsHref} onClick={visit("projects")}>
            {t("projects")}
          </TextLink>
        </h2>
        <div className="ps-home-subitems">
          <ContentList
            items={projects.slice(0, projectLimit)}
            compact
            onNavigate={onNavigate}
          />
          {projects.length > projectLimit && (
            <TextLink
              href={projectsHref}
              tone="muted"
              onClick={visit("projects")}
              className="ps-home-more"
            >
              {t("more")}
            </TextLink>
          )}
        </div>
      </section>
      <section className="ps-home-section" aria-label={t("blog")}>
        <h2>
          <TextLink href={blogHref} onClick={visit("blog")}>
            {t("blog")}
          </TextLink>
        </h2>
        <div className="ps-home-subitems">
          <ContentList
            items={posts.slice(0, postLimit)}
            variant="posts"
            compact
            onNavigate={onNavigate}
          />
          {posts.length > postLimit && (
            <TextLink
              href={blogHref}
              tone="muted"
              onClick={visit("blog")}
              className="ps-home-more"
            >
              {t("more")}
            </TextLink>
          )}
        </div>
      </section>
      <section className="ps-home-section" aria-label={t("consult")}>
        <h2>
          <TextLink href={consultHref} onClick={visit("consult")}>
            {t("consult")}
          </TextLink>
        </h2>
      </section>
      <div className="ps-home-footer">
        <SocialLinks items={socials} />
        <LanguageSwitch />
      </div>
    </div>
  );
}
