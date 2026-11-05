import {
  createContext,
  useContext,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useOrganicButton } from "./useOrganicButton";
import "./OrganicButton.css";

export type Theme = "light" | "dark" | "system";
const ThemeContext = createContext<"light" | "dark">("light");
export function useResolvedTheme() {
  return useContext(ThemeContext);
}
export function UIProvider({
  theme = "system",
  children,
  className = "",
}: {
  theme?: Theme;
  children: ReactNode;
  className?: string;
}) {
  const [system, setSystem] = useState<"light" | "dark">(() =>
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );
  useEffect(() => {
    const q = matchMedia("(prefers-color-scheme: dark)");
    const change = () => setSystem(q.matches ? "dark" : "light");
    change();
    q.addEventListener("change", change);
    return () => q.removeEventListener("change", change);
  }, []);
  const resolved = theme === "system" ? system : theme;
  return (
    <ThemeContext.Provider value={resolved}>
      <div className={`ps-root ${className}`} data-theme={resolved}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
export type TextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  tone?: "default" | "muted" | "accent";
  external?: boolean;
};
export function TextLink({
  tone = "default",
  external = false,
  children,
  className = "",
  ...props
}: TextLinkProps) {
  return (
    <a
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...props}
      className={`ps-link ps-link--${tone} ${className}`}
    >
      {children}
      {external && (
        <span className="ps-external" aria-hidden="true">
          ↗
        </span>
      )}
    </a>
  );
}
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
  busy?: boolean;
};
export function Button({
  variant = "secondary",
  busy = false,
  disabled,
  children,
  className = "",
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  onClick,
  ...props
}: ButtonProps) {
  const blocked = Boolean(disabled || busy),
    material = useOrganicButton(blocked);
  return (
    <button
      type="button"
      {...props}
      disabled={blocked}
      aria-busy={busy || undefined}
      className={`ps-button ps-button--${variant} ${className}`}
      onPointerEnter={(event) => {
        if (blocked) return;
        onPointerEnter?.(event);
        if (!event.defaultPrevented) material.move(event);
      }}
      onPointerMove={(event) => {
        if (blocked) return;
        onPointerMove?.(event);
        if (!event.defaultPrevented) material.move(event);
      }}
      onPointerLeave={(event) => {
        if (!blocked) onPointerLeave?.(event);
        material.rest();
      }}
      onPointerDown={(event) => {
        if (blocked) return;
        onPointerDown?.(event);
        if (!event.defaultPrevented && event.button === 0) material.press();
      }}
      onPointerUp={(event) => {
        if (!blocked) onPointerUp?.(event);
        material.release();
      }}
      onPointerCancel={(event) => {
        if (!blocked) onPointerCancel?.(event);
        material.rest();
      }}
      onKeyDown={(event) => {
        if (blocked) return;
        onKeyDown?.(event);
        if (event.key === "Enter" || event.key === " ") material.stop();
      }}
      onClick={(event) => {
        if (!blocked) onClick?.(event);
      }}
    >
      <span
        ref={material.surfaceRef}
        className="ps-button__material"
        aria-hidden="true"
      >
        <span ref={material.lightsRef} className="ps-button__lights">
          <span className="ps-button__light" />
          <span className="ps-button__light" />
        </span>
        <span className="ps-button__frost" />
        <span className="ps-button__pulse" />
      </span>
      <span className="ps-button__content">
        {busy && <span className="ps-spinner" aria-hidden="true" />}
        {children}
      </span>
    </button>
  );
}
export function Identity({
  name,
  subtitle,
  avatarSrc,
  href,
  onClick,
  compact = false,
  heading,
}: {
  name: string;
  subtitle?: string;
  avatarSrc?: string;
  href: string;
  onClick?: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"];
  compact?: boolean;
  heading?: "h1" | "h2";
}) {
  const Name = heading || "div";
  return (
    <div className={`ps-identity${compact ? " ps-identity--compact" : ""}`}>
      <a
        href={href}
        onClick={onClick}
        className="ps-avatar-link"
        aria-label={`Об авторе: ${name}`}
      >
        <span className="ps-avatar">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" width="56" height="56" />
          ) : (
            <span aria-hidden="true">
              {name
                .split(" ")
                .slice(0, 2)
                .map((p) => p[0])
                .join("")}
            </span>
          )}
        </span>
      </a>
      <div className="ps-identity-copy">
        <Name className="ps-identity-heading">
          <TextLink href={href} onClick={onClick} className="ps-identity-name">
            {name}
          </TextLink>
        </Name>
        {subtitle && <p className="ps-identity-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
export type ListItemIcon =
  | { src: string; emoji?: never }
  | { emoji: string; src?: never };
export type ListItem = {
  id: string;
  title: string;
  href: string;
  description?: string;
  date?: string;
  dateTime?: string;
  meta?: string;
  icon?: ListItemIcon;
  tags?: string[];
};
function ListItemIconView({ icon }: { icon?: ListItemIcon }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  if (!icon) return null;
  if (icon.src)
    return failedSrc === icon.src ? null : (
      <span className="ps-list-icon" aria-hidden="true">
        <img
          src={icon.src}
          alt=""
          width="18"
          height="18"
          onError={() => setFailedSrc(icon.src)}
        />
      </span>
    );
  return icon.emoji ? (
    <span className="ps-list-icon" aria-hidden="true">
      {icon.emoji}
    </span>
  ) : null;
}
export function ContentList({
  items,
  variant = "projects",
  compact = false,
  onNavigate,
  empty = "Здесь пока нет публикаций.",
}: {
  items: ListItem[];
  variant?: "projects" | "posts";
  compact?: boolean;
  onNavigate?: (id: string) => void;
  empty?: ReactNode;
}) {
  return items.length ? (
    <ul
      className={`ps-content-list ps-content-list--${variant}${compact ? " ps-content-list--compact" : ""}`}
    >
      {items.map((item) => (
        <li key={item.id}>
          <div className="ps-content-list-title">
            <TextLink
              href={item.href}
              className="ps-content-list-link"
              tone={compact ? "muted" : "default"}
              onClick={
                onNavigate
                  ? (event) => {
                      if (
                        event.button !== 0 ||
                        event.metaKey ||
                        event.ctrlKey ||
                        event.altKey ||
                        event.shiftKey
                      )
                        return;
                      event.preventDefault();
                      onNavigate(item.id);
                    }
                  : undefined
              }
            >
              <ListItemIconView icon={item.icon} />
              <span className="ps-content-list-label">{item.title}</span>
            </TextLink>
            {!compact && item.date && (
              <time dateTime={item.dateTime}>{item.date}</time>
            )}
          </div>
          {!compact && item.description && <p>{item.description}</p>}
          {!compact && item.meta && (
            <span className="ps-list-meta">{item.meta}</span>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p className="ps-empty">{empty}</p>
  );
}
export function SocialLinks({
  items,
  className = "",
}: {
  items: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <nav className={`ps-socials ${className}`} aria-label="Социальные ссылки">
      {items.map((item) => (
        <TextLink
          key={item.href}
          href={item.href}
          tone="muted"
          external={!item.href.startsWith("mailto:")}
        >
          {item.label}
        </TextLink>
      ))}
    </nav>
  );
}
export function Surface({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`ps-surface ${className}`}>
      {children}
    </div>
  );
}
export function InlineNotice({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "error";
  children: ReactNode;
}) {
  return (
    <p
      className={`ps-notice ps-notice--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
export function CodeBlock({
  code,
  language = "text",
  label = "Пример кода",
}: {
  code: string;
  language?: string;
  label?: string;
}) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Скопировано");
    } catch {
      setStatus("Не удалось скопировать. Выделите код вручную.");
    }
  }
  return (
    <figure className="ps-code">
      <figcaption>
        <span>{language}</span>
        <button onClick={copy} type="button">
          {status === "Скопировано" ? "Скопировано" : "Копировать"}
        </button>
      </figcaption>
      <pre aria-label={label}>
        <code>{code}</code>
      </pre>
      {status && (
        <p className="ps-copy-status" role="status">
          {status}
        </p>
      )}
    </figure>
  );
}
export function Article({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <article {...props} className={`ps-article ${className}`}>
      {children}
    </article>
  );
}
export function MediaFrame({
  children,
  caption,
  aspect = "wide",
  state = "ready",
  onRetry,
}: {
  children?: ReactNode;
  caption?: string;
  aspect?: "wide" | "square";
  state?: "ready" | "loading" | "error";
  onRetry?: () => void;
}) {
  return (
    <figure className={`ps-media ps-media--${aspect}`}>
      <div className="ps-media-body">
        {state === "loading" ? (
          <p className="ps-media-status" role="status">
            Загрузка демонстрации…
          </p>
        ) : state === "error" ? (
          <div className="ps-media-status" role="alert">
            <p>Не удалось загрузить демонстрацию.</p>
            {onRetry && (
              <Button variant="quiet" onClick={onRetry}>
                Попробовать снова
              </Button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
