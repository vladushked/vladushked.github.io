import { useEffect, useRef, type PointerEvent } from "react";

/** Pointer input stays local. The small spring runs only until the material settles. */
export function useOrganicButton(disabled: boolean) {
  const surfaceRef = useRef<HTMLSpanElement>(null);
  const lightsRef = useRef<HTMLSpanElement>(null);
  const controller = useRef({
    move: (_x: number, _y: number) => {},
    press: (_pressed: boolean) => {},
    rest: () => {},
    stop: () => {},
  });

  useEffect(() => {
    const surface = surfaceRef.current;
    const field = lightsRef.current;
    if (!surface || !field) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let lastTime = 0;
    let x = 0;
    let y = 0;
    let velocityX = 0;
    let velocityY = 0;
    let targetX = 0;
    let targetY = 0;

    const paint = () => {
      // Direct transforms on this isolated layer: no inherited animated variables or renders.
      field.style.transform = `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0) rotate(${(x * 0.35).toFixed(3)}deg) scale(${(1 + Math.abs(y) * 0.007).toFixed(4)}, ${(1 + Math.abs(x) * 0.003).toFixed(4)})`;
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      x = y = velocityX = velocityY = targetX = targetY = 0;
      field.style.transform = "none";
      delete surface.dataset.pressed;
    };
    const tick = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 1 / 30) : 1 / 60;
      lastTime = time;
      // Physical spring from the motion system: mass 1, stiffness 100, damping 10.
      velocityX += ((targetX - x) * 100 - velocityX * 10) * dt;
      velocityY += ((targetY - y) * 100 - velocityY * 10) * dt;
      x += velocityX * dt;
      y += velocityY * dt;
      paint();
      if (
        Math.abs(targetX - x) + Math.abs(targetY - y) < 0.025 &&
        Math.abs(velocityX) + Math.abs(velocityY) < 0.025
      ) {
        x = targetX;
        y = targetY;
        velocityX = velocityY = 0;
        paint();
        frame = 0;
        lastTime = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    controller.current = {
      move: (nextX, nextY) => {
        if (motion.matches || !hover.matches || document.hidden) return;
        targetX = nextX;
        targetY = nextY;
        start();
      },
      press: (pressed) => {
        if (motion.matches || document.hidden) return;
        if (pressed) surface.dataset.pressed = "true";
        else delete surface.dataset.pressed;
      },
      rest: () => {
        delete surface.dataset.pressed;
        targetX = targetY = 0;
        if (motion.matches) stop();
        else if (x || y || velocityX || velocityY) start();
      },
      stop,
    };
    const onPreference = () => stop();
    const onVisibility = () => {
      if (document.hidden) stop();
    };
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) stop();
          })
        : null;
    observer?.observe(surface);
    motion.addEventListener("change", onPreference);
    hover.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      observer?.disconnect();
      motion.removeEventListener("change", onPreference);
      hover.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (disabled) controller.current.stop();
  }, [disabled]);

  function move(event: PointerEvent<HTMLButtonElement>) {
    if (disabled || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const inside =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;
    if (!inside) return controller.current.rest();
    const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const normalizedY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    controller.current.move(-normalizedX * 8, -normalizedY * 4);
  }

  return {
    surfaceRef,
    lightsRef,
    move,
    press: () => {
      if (!disabled) controller.current.press(true);
    },
    release: () => controller.current.press(false),
    rest: () => controller.current.rest(),
    stop: () => controller.current.stop(),
  };
}
