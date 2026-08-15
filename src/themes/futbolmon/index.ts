import { ThemePackSchema, type ThemePack } from "../../core/types";

export async function loadFutbolMonTheme(): Promise<ThemePack> {
  const res = await fetch("/themes/futbolmon/theme.json");
  const themeData = await res.json();
  return ThemePackSchema.parse(themeData);
}
