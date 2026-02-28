import { Outlet, useLocation, Link } from "react-router";
import { User, FileText, FolderOpen, BookOpen } from "lucide-react";
import { useEffect } from "react";
import { navigationPages } from "../content/markdownPages";
import type { MarkdownPageRoute } from "../content/markdownPages";

const navIcons: Record<MarkdownPageRoute, typeof User> = {
  "/": User,
  "/resume": FileText,
  "/projects": FolderOpen,
  "/posts": BookOpen,
};

const navItems = navigationPages.map((page) => ({
  path: page.meta.route,
  label: page.meta.navLabel,
  icon: navIcons[page.meta.route],
}));

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-[var(--color-border)] bg-[var(--color-bg)] p-8">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 border transition-all ${
                  isActive
                    ? "bg-[var(--color-mint)] border-[var(--color-mint)] text-[var(--color-text)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-text)]"
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-3 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item flex flex-col items-center justify-center gap-1 rounded-sm border px-2 py-2 transition-colors ${
                isActive
                  ? "bg-[var(--color-mint)] border-[var(--color-mint)] text-[var(--color-text)]"
                  : "border-[var(--color-border)] text-[var(--color-secondary)]"
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
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
