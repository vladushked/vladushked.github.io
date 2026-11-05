import { useEffect, useRef, useState } from "react";
import { RotateCcw, Settings } from "lucide-react";
import { nativeDocument } from "./nativeDemoDocument";
import "./ObsidianGraphDemo.css";

export interface ObsidianGraphDemoProps {
  className?: string;
  poster?: string;
}

/** The unchanged plugin runs in an isolated workspace only after an explicit invitation. */
export function ObsidianGraphDemo({
  className = "",
  poster,
}: ObsidianGraphDemoProps) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const visible = useRef(false);
  const enabled = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [ready, setReady] = useState(false);
  const [failure, setFailure] = useState("");

  function sendActivity() {
    frame.current?.contentWindow?.postMessage(
      {
        type: "genealogy-demo-active",
        active: enabled.current && visible.current && !document.hidden,
      },
      "*",
    );
  }
  function open() {
    enabled.current = true;
    setMounted(true);
    setOpened(true);
    sendActivity();
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
      } else if (event.data?.type === "genealogy-demo-error") {
        setFailure(event.data.message || "Демо не удалось загрузить.");
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
    if (frame.current) frame.current.inert = !opened;
    if (opened && ready) frame.current?.focus({ preventScroll: true });
    else if (!opened && mounted)
      openButton.current?.focus({ preventScroll: true });
    sendActivity();
  }, [opened, ready, mounted]);
  return (
    <section
      ref={root}
      className={`gg-demo gg-native ${!opened ? "is-closed" : ""} ${className}`}
      aria-label="Genealogy Graph: полный интерфейс плагина"
    >
      <div className="gg-native-toolbar">
        <button
          className="gg-native-exit"
          type="button"
          disabled={!opened || !ready}
          onClick={close}
        >
          Выйти из демо
        </button>
        <div className="gg-native-actions">
          <button
            type="button"
            disabled={!opened || !ready}
            aria-label="Настройки учебного хранилища"
            title="Настройки Genealogy Graph"
            onClick={() => hostCommand("settings")}
          >
            <Settings size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={!opened || !ready}
            aria-label="Сбросить учебные данные"
            title="Сбросить учебные данные"
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
          title="Genealogy Graph — исходный интерфейс плагина с вымышленной семьёй"
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
          Загрузка интерфейса Genealogy Graph…
        </div>
      )}
      {opened && failure && (
        <div className="gg-native-loading" role="alert">
          Не удалось открыть демо.{" "}
          <button
            type="button"
            onClick={() => {
              setFailure("");
              setReady(false);
              if (frame.current) frame.current.srcdoc = nativeDocument;
            }}
          >
            Повторить
          </button>
          <button type="button" onClick={close}>
            Выйти из демо
          </button>
        </div>
      )}
      {!opened && (
        <div className="gg-native-cover">
          <button
            ref={openButton}
            className="gg-native-open"
            type="button"
            onClick={open}
          >
            Открыть демо
          </button>
        </div>
      )}
    </section>
  );
}
export default ObsidianGraphDemo;
