import { Outlet, useLocation, Link } from "react-router";
import { User, FileText, FolderOpen, BookOpen, Sun, Moon } from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { path: "/", label: "ABOUT ME", icon: User },
  { path: "/resume", label: "RESUME", icon: FileText },
  { path: "/projects", label: "PROJECTS", icon: FolderOpen },
  { path: "/posts", label: "POSTS", icon: BookOpen },
];

export function Layout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
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
                <span className="text-sm mono tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="space-y-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--color-border)] hover:border-[var(--color-text)] transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon size={18} strokeWidth={1.5} />
            ) : (
              <Sun size={18} strokeWidth={1.5} />
            )}
            <span className="text-sm mono tracking-wide">
              {theme === 'light' ? 'DARK' : 'LIGHT'}
            </span>
          </button>
          
          <div className="text-xs mono text-[var(--color-secondary)] tracking-wide">
            © 2026
          </div>
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
              className={`flex flex-col items-center gap-1 px-2 py-2 transition-colors ${
                isActive ? "text-[var(--color-mint)]" : "text-[var(--color-secondary)]"
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[9px] mono tracking-wider leading-tight text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
        
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-1 px-2 py-2 text-[var(--color-secondary)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon size={20} strokeWidth={1.5} />
          ) : (
            <Sun size={20} strokeWidth={1.5} />
          )}
          <span className="text-[9px] mono tracking-wider">
            {theme === 'light' ? 'DARK' : 'LIGHT'}
          </span>
        </button>
      </nav>
    </div>
  );
}
