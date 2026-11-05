import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import "./PageTransition.css";

export type PageTransitionProps = {
  routeKey: string;
  renderPage: (routeKey: string) => ReactNode;
  motion?: boolean;
  enterSelector?: string;
  onPageChange?: (routeKey: string) => void;
  className?: string;
};

/** Keeps the old page mounted through its exit; the newest requested route always wins. */
export function PageTransition({
  routeKey,
  renderPage,
  motion = true,
  enterSelector = ":scope > *",
  onPageChange,
  className = "",
}: PageTransitionProps) {
  const [displayed, setDisplayed] = useState(routeKey);
  const nodeRef = useRef<HTMLDivElement>(null);
  const requested = useRef(routeKey);
  requested.current = routeKey;
  const shown = useRef(displayed);
  shown.current = displayed;
  const allowMotion = useRef(motion);
  allowMotion.current = motion;
  const callback = useRef(onPageChange);
  callback.current = onPageChange;
  const exitRef = useRef<Animation | null>(null);
  const finishedExit = useRef<Animation | null>(null);
  const entrances = useRef<Animation[]>([]);
  const rows = useRef<HTMLElement[]>([]);
  const instantNext = useRef(false);
  const alive = useRef(true);

  const clearRows = () => {
    rows.current.forEach((row) => {
      row.style.removeProperty("opacity");
      row.style.removeProperty("transform");
    });
  };
  const stopEntry = (preserve = false) => {
    entrances.current.forEach((animation) => {
      if (preserve) {
        try {
          animation.commitStyles();
        } catch {}
      }
      animation.cancel();
    });
    entrances.current = [];
    if (!preserve) clearRows();
  };
  const stopExit = () => {
    exitRef.current?.cancel();
    exitRef.current = null;
    nodeRef.current?.style.removeProperty("opacity");
  };
  const flush = () => {
    stopExit();
    stopEntry();
    instantNext.current = true;
    if (requested.current !== shown.current) setDisplayed(requested.current);
  };

  useLayoutEffect(() => {
    alive.current = true;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const onReduce = () => {
      if (reduce.matches) flush();
    };
    const onVisibility = () => {
      if (document.hidden) flush();
    };
    reduce.addEventListener("change", onReduce);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      alive.current = false;
      stopExit();
      stopEntry();
      finishedExit.current?.cancel();
      reduce.removeEventListener("change", onReduce);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    if (
      !motion ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.hidden ||
      typeof node.animate !== "function"
    ) {
      flush();
      return;
    }
    if (routeKey === shown.current) {
      if (exitRef.current) {
        stopExit();
        stopEntry();
      }
      return;
    }
    if (exitRef.current) return;
    instantNext.current = false;
    stopEntry(true);
    const style = getComputedStyle(node),
      time = style.getPropertyValue("--ps-page-exit").trim();
    const duration = Number.isFinite(parseFloat(time))
      ? parseFloat(time) * (time.endsWith("ms") ? 1 : 1000)
      : 180;
    const animation = node.animate(
      [{ opacity: getComputedStyle(node).opacity }, { opacity: 0 }],
      {
        duration,
        easing:
          style.getPropertyValue("--ps-ease").trim() ||
          "cubic-bezier(.23,1,.32,1)",
        fill: "forwards",
      },
    );
    exitRef.current = animation;
    void animation.finished
      .then(() => {
        if (!alive.current || exitRef.current !== animation) return;
        exitRef.current = null;
        finishedExit.current = animation;
        const next = requested.current;
        if (next === shown.current) {
          animation.cancel();
          finishedExit.current = null;
          clearRows();
          return;
        }
        setDisplayed(next);
      })
      .catch(() => {});
  }, [routeKey, motion]);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    finishedExit.current?.cancel();
    finishedExit.current = null;
    stopEntry();
    node.style.removeProperty("opacity");
    callback.current?.(displayed);
    const instant =
      instantNext.current ||
      !allowMotion.current ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.hidden;
    instantNext.current = false;
    if (instant || typeof node.animate !== "function") return;
    const style = getComputedStyle(node);
    const ms = (property: string, fallback: number) => {
      const value = style.getPropertyValue(property).trim();
      const number = parseFloat(value);
      return Number.isFinite(number)
        ? number * (value.endsWith("ms") ? 1 : 1000)
        : fallback;
    };
    const found = [...node.querySelectorAll<HTMLElement>(enterSelector)];
    rows.current = found.filter(
      (row) => !found.some((parent) => parent !== row && parent.contains(row)),
    );
    const duration = ms("--ps-page-enter", 600),
      stagger = ms("--ps-page-stagger", 50),
      easing =
        style.getPropertyValue("--ps-ease-entry").trim() ||
        "cubic-bezier(.16,1,.3,1)";
    entrances.current = rows.current.map((row, index) =>
      row.animate(
        [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration, delay: (index + 1) * stagger, easing, fill: "backwards" },
      ),
    );
    return () => stopEntry();
  }, [displayed]);

  return (
    <div
      key={displayed}
      ref={nodeRef}
      className={`ps-page-transition ${className}`}
      data-page-key={displayed}
      onKeyDownCapture={() => {
        if (exitRef.current) flush();
        else stopEntry();
      }}
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) stopEntry();
      }}
    >
      {renderPage(displayed)}
    </div>
  );
}
