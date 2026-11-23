# Changelog

## 2026-11-24
- Strict CSP: the kit runs under `default-src 'none'; script-src 'self'; style-src 'self'` (plus `media-src` for media). Script-built markup carries `data-style`, applied by `pbStyled()`; markup sets custom properties with `data-vars` and attribute forms (`data-span`, `data-n`, `data-size`, `pb-auth--inline`, `.pb-progress[data-value]`). No `eval`, `new Function`, inline handlers or style attributes.
- `patchbay.mjs` (ES module with named exports and `pbInit` as the default) beside `patchbay.js`; `pb-theme-boot.js` replaces the inline no-flash theme snippet.
- `pbInit(root, {only, skip})` is idempotent: hooks are registered with `pbHook(name, selector, fn)`, each element binds once, `data-pb-skip` opts out, one failing element no longer stops the rest. `patchbay.js` runs it on DOMContentLoaded only with `data-pb-auto`.
- Form sections track real dirty state against a snapshot, show busy while saving, and settle on `pb:saved` / `pb:error`; Discard restores the snapshot and no longer disables reveal buttons.
- `pbToast` and `pbConfirm` escape `body`; `bodyHTML` is the opt-in for markup, and a Node can be passed. Confirm dialogs are labelled and described. `pbInbox(el, {unread, lazy, onOpen, onRead, onReadAll})`.
- Tabs fire `pb:tabchange` and leave link tabs alone; steppers fire `input`; copy buttons take `data-copy-value` and `data-copy-target`; tables skip `[data-dt]` and `[data-bulk]`; menus take `data-align="end"` on the trigger; new `progress`, `vars`, `codearea` and `indeterminate` hooks.
- Popovers, date and time pickers, colour fields, the inbox, context menus, the shell and the site header share one capturing document listener per event type (`pbOnDoc`) and one placement function (`pbPlace`).
- One `pbEsc` escapes `& < > " '` everywhere. Component scripts are generated from the shared sources (`tools/src/gen/scripts.json`), so the copies in examples cannot drift.
- Breaking: raw HTML passed as `body` to `pbToast` or `pbConfirm` is now shown as text; pass it as `bodyHTML`. `pbInbox`, `pbPopovers` and `pbRelTime` bind through `pbInit`, so calling them twice no longer doubles listeners.

## 2026-11-23
- Time range and auto-refresh pickers; zoomable time-series chart with crosshair and legend toggles.
- Share dialog, file preview pane, table tools (columns, resize, density, expandable rows, inline edit, CSV, sticky column).
- Event calendar, markdown editor, comment thread, notification settings grid, phone tab bar and action sheet, session timeout warning.
- Site header variants (links, dropdown menus, utility bar, sub-nav, sticky, phone menu).
- Compact density, Windows high-contrast support, app icons and web manifest, alert email template.
- Sign-in logo variants; two-factor setup shows recovery codes only after the code is verified.
- Log explorer (Loki-style labels and LogQL), joined storage bar, refined API token scopes, roomier chart tooltips.
- Build tools in `tools/`, MIT license, font licenses, CI checks.

## 2026-11-22
- Homelab views: log viewer, terminal output, diff viewer, file browser, cron builder, storage bar, rack.
- Charts: bar, histogram, gauges and donuts, calendar heatmap, JSON/YAML viewer.
- Bulk actions, query filter, sortable lists, shortcut sheet, upload queue, virtual list.
- Page templates: dashboard, settings, sign-in, API tokens, print report. Themed scrollbars.
- Dark theme; app shell and site-wide patterns (breadcrumbs, loading, empty states, tree view, command palette, popovers, and more).
- First release: tokens, soft and hard edge variants, forms, overlays, media player, charts, status page.
