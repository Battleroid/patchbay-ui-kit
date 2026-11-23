The theme switch picks light, dark or the system setting for the page or one panel.

- Themes: `data-theme="light|dark"` on `<html>` (whole app) or on any container (one panel). Every token has a light and a dark value; components need no changes. `night` and `on-night` are the same in both themes for media stages and ink panels.
- Markup: a `pb-seg pb-seg--sm pb-themeswitch` radiogroup with `data-theme-switch` and three radios valued `light`, `dark`, `system`. `pb-seg--icon` for the compact sun / moon / monitor form; give each radio an `aria-label`.
- Script: `pbThemeSwitch(el)` wires it; scope is the closest `[data-theme-scope]`, else `<html>`. The page-wide choice is kept in `localStorage` (`pb-theme`); `system` follows `prefers-color-scheme` live. `pbTheme('dark', el)` sets it from code.
- To avoid a flash on load, set `data-theme` in a tiny inline script in `<head>` from `localStorage` before the CSS paints.
- Put the page-wide switch in the app header tools or user menu. Default to `system`.
