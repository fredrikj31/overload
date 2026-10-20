import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

const THEMES: readonly Theme[] = ["dark", "light", "system"];

// Must match --background in src/index.css (oklch(1 0 0) / oklch(0.145 0 0)) and the inline
// first-paint script in index.html. The theme-color meta drives the Android gesture bar and
// the iOS status bar in standalone mode.
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: "#ffffff",
  dark: "#171717",
};

const DARK_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: string | null): value is Theme =>
  THEMES.includes(value as Theme);

const resolveTheme = (theme: Theme): ResolvedTheme =>
  theme === "system"
    ? window.matchMedia(DARK_QUERY).matches
      ? "dark"
      : "light"
    : theme;

const applyTheme = (resolved: ResolvedTheme) => {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[resolved]);
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme: Theme;
  storageKey: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme,
  storageKey,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey);
    return isTheme(stored) ? stored : defaultTheme;
  });

  useEffect(() => {
    applyTheme(resolveTheme(theme));

    if (theme !== "system") return;

    // Follow live OS theme changes while the user has picked "system"
    const query = window.matchMedia(DARK_QUERY);
    const onChange = () => applyTheme(resolveTheme(theme));
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives next to its provider; editing this file triggers a full reload instead of HMR
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
