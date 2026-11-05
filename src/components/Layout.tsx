import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import {
  useLocation,
  useNavigate,
  useNavigationType,
  useOutlet,
} from "react-router";
import { LivingBackground } from "./ui/LivingBackground";
import { PageTransition } from "./ui/PageTransition";
import { ArchiveProvider, type ArchiveSelections } from "./ArchiveState";

const enterSelector =
  ".ps-home-identity,.ps-home-section h2,.ps-home-section .ps-content-list li,.ps-home-more,.ps-personal-home>.ps-socials,.page-back-links,.ps-article>h1,.ps-article>.document-description,.post-meta,.markdown-content>p,.markdown-content>h2,.markdown-content>h3,.markdown-content>ul>li,.markdown-content>ol>li,.markdown-content>figure,.markdown-content>.card,.markdown-content>.skill-group,.post-feed>.ps-topic-filter,.post-feed>.ps-content-list>li";
export function Layout() {
  const location = useLocation(),
    navigationType = useNavigationType(),
    navigate = useNavigate(),
    outlet = useOutlet();
  const input = useRef<"pointer" | "keyboard">("pointer"),
    mounted = useRef(false),
    snapshots = useRef(new Map<string, typeof outlet>());
  const [selections, setSelections] = useState<ArchiveSelections>({});
  snapshots.current.set(location.pathname, outlet);
  const motion =
    !mounted.current ||
    (navigationType !== "POP" && input.current !== "keyboard");
  useLayoutEffect(() => {
    mounted.current = true;
  }, []);
  function intercept(event: MouseEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a");
    if (!link || link.target === "_blank" || link.hasAttribute("download"))
      return;
    const raw = link.getAttribute("href");
    if (!raw || raw.startsWith("#")) return;
    const url = new URL(link.href, window.location.href);
    if (
      url.origin !== window.location.origin ||
      /\.[a-z0-9]{2,6}$/i.test(url.pathname)
    )
      return;
    if (url.pathname === location.pathname && url.hash) return;
    event.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  }
  function changed() {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }
  return (
    <>
      <LivingBackground />
      <div
        className="site-shell"
        onPointerDownCapture={() => {
          input.current = "pointer";
        }}
        onKeyDownCapture={() => {
          input.current = "keyboard";
        }}
        onClick={intercept}
      >
        <a
          className="skip-link"
          href="#main-content"
          onClick={(event) => {
            event.preventDefault();
            document
              .getElementById("main-content")
              ?.focus({ preventScroll: true });
          }}
        >
          К содержимому
        </a>
        <main id="main-content" tabIndex={-1}>
          <ArchiveProvider
            selections={selections}
            onChange={(feed, value) =>
              setSelections((current) => ({ ...current, [feed]: value }))
            }
          >
            <PageTransition
              routeKey={location.pathname}
              motion={motion}
              enterSelector={enterSelector}
              onPageChange={changed}
              renderPage={(path) => snapshots.current.get(path)}
            />
          </ArchiveProvider>
        </main>
      </div>
    </>
  );
}
