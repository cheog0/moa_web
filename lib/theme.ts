export const THEME_STORAGE_KEY = "raple-theme";

export type ThemeName = "light" | "dark";

export function readStoredTheme(): ThemeName {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  switch (theme) {
    case "dark":
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      break;
    default:
      root.classList.remove("dark");
      root.style.colorScheme = "light";
  }
}

export function whenDark(theme: ThemeName, darkClass: string) {
  switch (theme) {
    case "dark":
      return darkClass;
    default:
      return "";
  }
}

export function whenDarkValue<T>(theme: ThemeName, darkValue: T, lightValue: T) {
  switch (theme) {
    case "dark":
      return darkValue;
    default:
      return lightValue;
  }
}
