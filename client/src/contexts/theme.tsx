import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

export type Theme = "default" | "glitch";

export const DEFAULT_THEME: Theme = "default";

const THEME_COLORS: Record<
  Theme,
  { primary: string; secondary: string; tertiary: string }
> = {
  default: {
    primary: "green",
    secondary: "yellow",
    tertiary: "salmon",
  },
  glitch: {
    primary: "red",
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

const THEME_STORAGE_KEY = "gbomb-theme";
/** Bump when DEFAULT_THEME changes so stored prefs reset to the new default. */
const THEME_STORAGE_VERSION = 2;

type StoredTheme = { v: number; theme: Theme };

function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && value in THEME_COLORS;
}

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (!saved) return null;
  try {
    const parsed: unknown = JSON.parse(saved);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "v" in parsed &&
      (parsed as StoredTheme).v === THEME_STORAGE_VERSION &&
      isTheme((parsed as StoredTheme).theme)
    ) {
      return (parsed as StoredTheme).theme;
    }
  } catch {
    // ignore malformed stored theme
  }
  return null;
}

function writeStoredTheme(theme: Theme) {
  localStorage.setItem(
    THEME_STORAGE_KEY,
    JSON.stringify({ v: THEME_STORAGE_VERSION, theme } satisfies StoredTheme),
  );
}

function resolveTheme(): Theme {
  return readStoredTheme() ?? DEFAULT_THEME;
}

// Apply before React paints to avoid a flash of default.css colors.
if (typeof document !== "undefined") {
  applyTheme(resolveTheme());
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

/** Resets to the default palette whenever the user changes route. */
function ThemeRouteSync({ setTheme }: { setTheme: (theme: Theme) => void }) {
  const { pathname } = useLocation();
  const prevPathname = useRef(pathname);

  useLayoutEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    setTheme(DEFAULT_THEME);
  });

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(resolveTheme);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <ThemeRouteSync setTheme={setTheme} />
      {children}
    </ThemeContext.Provider>
  );
}
