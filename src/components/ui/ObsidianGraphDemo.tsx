import { useEffect, useRef, useState, type MouseEvent } from "react";
import { RotateCcw, Settings } from "lucide-react";
import { nativeDocument } from "./nativeDemoDocument";
import { Button, ButtonLink } from "./primitives";
import { useLanguage } from "../../i18n";
import "./ObsidianGraphDemo.css";

export interface ObsidianGraphDemoProps {
  className?: string;
  poster?: string;
  installHref?: string;
  repositoryHref?: string;
}

const copy = {
  ru: {
    label: "Genealogy Graph: полный интерфейс плагина",
    frame: "Genealogy Graph — исходный интерфейс плагина с вымышленной семьёй",
    open: "открыть демо",
    exit: "выйти из демо",
    settings: "настройки учебного хранилища",
    reset: "сбросить учебные данные",
    loading: "загрузка интерфейса Genealogy Graph…",
    failure: "не удалось открыть демо.",
    retry: "повторить",
    install: "установить плагин",
    links: "Genealogy Graph: установка и исходный код",
  },
  en: {
    label: "Genealogy Graph: full plugin interface",
    frame: "Genealogy Graph — original plugin interface with a fictional family",
    open: "open demo",
    exit: "exit demo",
    settings: "demo vault settings",
    reset: "reset demo data",
    loading: "loading the Genealogy Graph interface…",
    failure: "could not open the demo.",
    retry: "try again",
    install: "install plugin",
    links: "Genealogy Graph: installation and source code",
  },
};

/** The unchanged plugin runs in an isolated workspace only after an explicit invitation. */
export function ObsidianGraphDemo({
  className = "",
  poster,
  installHref,
  repositoryHref,
}: ObsidianGraphDemoProps) {
  const { language } = useLanguage();
  const words = copy[language];
  const locale = useRef(language);
  locale.current = language;
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const exitButton = useRef<HTMLButtonElement>(null);
  const visible = useRef(false);
  const enabled = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [ready, setReady] = useState(false);
  const [failure, setFailure] = useState(false);

  function sendLanguage() {
    frame.current?.contentWindow?.postMessage(
      { type: "genealogy-demo-language", language: locale.current },
      "*",
    );
  }

  function center(behavior: ScrollBehavior) {
    const target = root.current;
    if (!target) return;
    const viewport = window.visualViewport;
    const height = viewport?.height ?? window.innerHeight;
    const offset = viewport?.offsetTop ?? 0;
    const rect = target.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top + rect.height / 2 - offset - height / 2,
      behavior,
    });
  }

  function sendActivity() {
    frame.current?.contentWindow?.postMessage(
      {
        type: "genealogy-demo-active",
        active: enabled.current && visible.current && !document.hidden,
      },
      "*",
    );
  }
  function open(event: MouseEvent<HTMLButtonElement>) {
    enabled.current = true;
    setMounted(true);
    setOpened(true);
    sendActivity();
    // Center the entire embed, including its exit, after the open state renders.
    const behavior =
      event.detail === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth";
    requestAnimationFrame(() => center(behavior));
  }
  function close() {
    enabled.current = false;
    sendActivity();
    setOpened(false);
  }
  function hostCommand(command: "settings" | "reset") {
    if (!enabled.current || !ready) return;
    frame.current?.focus({ preventScroll: true });
    frame.current?.contentWindow?.postMessage(
      { type: "genealogy-demo-command", command },
      "*",
    );
  }
  useEffect(() => {
    const target = root.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        sendActivity();
      },
      { threshold: 0.01 },
    );
    observer.observe(target);
    function onMessage(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === "genealogy-demo-ready") {
        setReady(true);
        sendActivity();
        sendLanguage();
      } else if (event.data?.type === "genealogy-demo-error") {
        setFailure(true);
      }
    }
    window.addEventListener("message", onMessage);
    document.addEventListener("visibilitychange", sendActivity);
    return () => {
      observer.disconnect();
      window.removeEventListener("message", onMessage);
      document.removeEventListener("visibilitychange", sendActivity);
    };
  }, []);
  useEffect(() => {
    function resize() {
      root.current?.style.setProperty(
        "--gg-viewport-height",
        `${window.visualViewport?.height ?? window.innerHeight}px`,
      );
      if (enabled.current) requestAnimationFrame(() => center("instant"));
    }
    resize();
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
    };
  }, []);
  useEffect(sendLanguage, [language, ready]);
  useEffect(() => {
    if (frame.current) frame.current.inert = !opened;
    if (opened) exitButton.current?.focus({ preventScroll: true });
    else if (!opened && mounted)
      openButton.current?.focus({ preventScroll: true });
    sendActivity();
  }, [opened, mounted]);
  return (
    <>
      <section
        ref={root}
        className={`gg-demo gg-native ${!opened ? "is-closed" : ""} ${className}`}
        aria-label={words.label}
      >
        <div className="gg-native-toolbar">
          <Button
            ref={exitButton}
            className="gg-native-exit"
            variant="primary"
            disabled={!opened}
            onClick={close}
          >
            {words.exit}
          </Button>
          <div className="gg-native-actions">
            <button
              type="button"
              disabled={!opened || !ready}
              aria-label={words.settings}
              title={words.settings}
              onClick={() => hostCommand("settings")}
            >
              <Settings size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={!opened || !ready}
              aria-label={words.reset}
              title={words.reset}
              onClick={() => hostCommand("reset")}
            >
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
        {!mounted && poster && (
          <img className="gg-native-poster" src={poster} alt="" loading="lazy" />
        )}
        {mounted && (
          <iframe
            ref={frame}
            title={words.frame}
            srcDoc={nativeDocument}
            className="gg-native-frame"
            tabIndex={opened ? 0 : -1}
            aria-hidden={!opened}
            sandbox="allow-scripts allow-same-origin allow-downloads allow-modals allow-popups allow-popups-to-escape-sandbox"
            onLoad={sendActivity}
          />
        )}
        {opened && !ready && !failure && (
          <div className="gg-native-loading" role="status">
            {words.loading}
          </div>
        )}
        {opened && failure && (
          <div className="gg-native-loading" role="alert">
            {words.failure}{" "}
            <button
              type="button"
              onClick={() => {
                setFailure(false);
                setReady(false);
                if (frame.current) frame.current.srcdoc = nativeDocument;
              }}
            >
              {words.retry}
            </button>
            <button type="button" onClick={close}>
              {words.exit}
            </button>
          </div>
        )}
        {!opened && (
          <div className="gg-native-cover">
            <Button
              ref={openButton}
              className="gg-native-open"
              variant="primary"
              onClick={open}
            >
              {words.open}
            </Button>
          </div>
        )}
      </section>
      {(installHref || repositoryHref) && (
        <nav className="gg-demo-links" aria-label={words.links}>
          {installHref && (
            <ButtonLink
              href={installHref}
              variant="primary"
              target="_blank"
              rel="noreferrer"
            >
              {words.install}
            </ButtonLink>
          )}
          {repositoryHref && (
            <ButtonLink
              href={repositoryHref}
              target="_blank"
              rel="noreferrer"
            >
              github
            </ButtonLink>
          )}
        </nav>
      )}
    </>
  );
}
export default ObsidianGraphDemo;
