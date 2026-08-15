import { ThemePackSchema, type ThemePack } from "../../core/types";
import themeData from "./theme.json";

export function loadGoTTheme(): ThemePack {
  return ThemePackSchema.parse(themeData);
}
