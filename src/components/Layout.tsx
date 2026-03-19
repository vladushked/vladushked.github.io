import { Outlet, useLocation, Link } from "react-router";
import { User, FileText, FolderOpen, BookOpen } from "lucide-react";
import { useEffect } from "react";
import { navigationItems } from "../content/documents";
import type { MenuIconKey } from "../content/pages";

const navIcons: Record<MenuIconKey, typeof User> = {
  user: User,
  "file-text": FileText,
  "folder-open": FolderOpen,
  "book-open": BookOpen,
};

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell site-shell flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="site-sidebar flex-col justify-between w-64 border-r border-[var(--color-border)] bg-[var(--color-bg)] p-8">
        <nav className="flex flex-col gap-2">
          {navigationItems.map((item) => {
            const isActive = isNavigationItemActive(item.route, item.page, location.pathname);
            const Icon = item.icon ? navIcons[item.icon] : null;
            
            return (
              <Link
                key={item.route}
                to={item.route}
                className={`flex items-center gap-3 px-4 py-3 border transition-all ${
                  isActive
                    ? "bg-[var(--color-mint)] border-[var(--color-mint)] nav-item-active"
                    : "border-[var(--color-border)] hover:border-[var(--color-text)]"
                }`}
              >
                {Icon ? <Icon size={18} strokeWidth={1.5} /> : null}
                <span className="type-menu-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="type-caption">
          © 2026
        </div>
      </aside>

      {/* Main Content */}
      <main className="site-main flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="site-mobile-nav fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-3 z-50">
        {navigationItems.map((item) => {
          const isActive = isNavigationItemActive(item.route, item.page, location.pathname);
          const Icon = item.icon ? navIcons[item.icon] : null;
          
          return (
            <Link
              key={item.route}
              to={item.route}
              className={`mobile-nav-item flex flex-col items-center justify-center gap-1 rounded-sm border px-2 py-2 transition-colors ${
                isActive
                  ? "bg-[var(--color-mint)] border-[var(--color-mint)] nav-item-active"
                  : "border-[var(--color-border)] text-[var(--color-secondary)]"
              }`}
            >
              {Icon ? <Icon size={20} strokeWidth={1.5} /> : null}
              <span className="type-menu-label text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function isNavigationItemActive(route: string, page: string, pathname: string) {
  if (page === "posts") {
    return pathname === "/" || pathname.startsWith("/blog/");
  }

  return pathname === route || (route !== "/" && pathname.startsWith(route));
}
