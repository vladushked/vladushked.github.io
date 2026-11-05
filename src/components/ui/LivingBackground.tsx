import { useEffect, useRef } from "react";
import "./LivingBackground.css";

export interface LivingBackgroundProps {
  className?: string;
}

const initialLayers = [
  { x: -50, y: -50, scaleX: 1.04, scaleY: 0.98, rotation: -9, opacity: 0.92 },
  { x: -50, y: -50, scaleX: 1.02, scaleY: 1.06, rotation: 12, opacity: 0.94 },
  { x: -50, y: -50, scaleX: 1.06, scaleY: 0.98, rotation: -4, opacity: 0.88 },
];

type LayerPosition = (typeof initialLayers)[number];
const between = (min: number, max: number) => min + Math.random() * (max - min);
const transformFor = (position: LayerPosition) =>
  `translate3d(${position.x}%, ${position.y}%, 0) rotate(${position.rotation}deg) scale(${position.scaleX}, ${position.scaleY})`;

/** Mount once beside the app shell, inside UIProvider and outside routed content. */
export function LivingBackground({ className = "" }: LivingBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lightsRef = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const easing =
      getComputedStyle(root).getPropertyValue("--ps-ease-in-out").trim() ||
      "cubic-bezier(0.77, 0, 0.175, 1)";
    let disposed = false;
    let reduced = media.matches;
    let visible = typeof IntersectionObserver === "undefined";

    const syncPlayback = () => {
      const playing = !reduced && visible && !document.hidden;
      for (const animation of animations) {
        if (playing) animation.play();
        else animation.pause();
      }
    };

    const moveLayer = (element: HTMLSpanElement, previous: LayerPosition) => {
      if (disposed || typeof element.animate !== "function") return;
      const next: LayerPosition = {
        x: between(-57, -43),
        y: between(-57, -43),
        scaleX: between(0.96, 1.13),
        scaleY: between(0.96, 1.12),
        rotation: between(-14, 14),
        opacity: between(0.76, 1),
      };
      // A new destination and duration on every arrival: three independent trajectories,
      // composited transform/opacity only, with no repeating timeline or frame loop.
      const animation = element.animate(
        [
          { transform: transformFor(previous), opacity: previous.opacity },
          { transform: transformFor(next), opacity: next.opacity },
        ],
        { duration: between(18000, 32000), easing, fill: "forwards" },
      );
      animations.add(animation);
      syncPlayback();
      void animation.finished
        .then(() => {
          if (disposed) return;
          element.style.transform = transformFor(next);
          element.style.opacity = String(next.opacity);
          animations.delete(animation);
          animation.cancel();
          moveLayer(element, next);
        })
        .catch(() => {
          // Component cleanup cancels WAAPI and rejects finished.
        });
    };

    lightsRef.current.forEach((light, index) => {
      if (light) moveLayer(light, initialLayers[index]);
    });

    const onPreference = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      syncPlayback();
    };
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            syncPlayback();
          })
        : null;
    observer?.observe(root);
    media.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      disposed = true;
      observer?.disconnect();
      media.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", syncPlayback);
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`ps-living-background ${className}`}
      aria-hidden="true"
    >
      {initialLayers.map((layer, index) => (
        <span
          key={index}
          ref={(element) => {
            lightsRef.current[index] = element;
          }}
          className={`ps-living-background__light ps-living-background__light--${index + 1}`}
          style={{ transform: transformFor(layer), opacity: layer.opacity }}
        />
      ))}
      <span className="ps-living-background__grain" />
    </div>
  );
}

export default LivingBackground;
