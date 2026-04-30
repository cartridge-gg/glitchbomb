import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "default";

const THEME_COLORS: Record<
  Theme,
  { primary: string; secondary: string; tertiary: string }
> = {
  default: {
    primary: "green",
    secondary: "yellow",
    tertiary: "salmon",
  },
};

const LEVELS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function applyTheme(theme: Theme) {
  const colors = THEME_COLORS[theme];
  const root = document.documentElement;
  root.classList.add("theme-transitioning");
  for (const [semantic, base] of Object.entries(colors)) {
    for (const level of LEVELS) {
      root.style.setProperty(
        `--${semantic}-${level}`,
        `var(--${base}-${level})`,
      );
    }
  }
  setTimeout(() => root.classList.remove("theme-transitioning"), 500);
}

const THEME_STORAGE_KEY = "theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "default",
  setTheme: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<Theme | null>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (typeof parsed === "string" && parsed in THEME_COLORS) {
        return parsed as Theme;
      }
    } catch {
      // ignore malformed stored theme
    }
    return null;
  });

  const theme: Theme = useMemo(() => {
    if (preference !== null) return preference;
    return "default";
  }, [preference]);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (preference === null) {
      setPreference("default");
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify("default"));
    }
  }, [preference]);

  const setTheme = useCallback((t: Theme) => {
    setPreference(t);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(t));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
