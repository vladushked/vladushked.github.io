import { useEffect, type ReactNode } from "react";
import { UIProvider } from "./ui/primitives";
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.setAttribute(
        "data-theme",
        query.matches ? "dark" : "light",
      );
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return <UIProvider theme="system">{children}</UIProvider>;
}
