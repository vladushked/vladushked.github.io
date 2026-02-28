import { ReactNode, useEffect } from 'react';

function applyTheme(matchesDark: boolean) {
  document.documentElement.setAttribute('data-theme', matchesDark ? 'dark' : 'light');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return <>{children}</>;
}
