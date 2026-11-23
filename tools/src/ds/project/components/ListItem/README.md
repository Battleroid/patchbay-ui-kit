List rows show a set of things with a lead, text, meta and actions on one line.

- Markup: `ul.pb-list > li > .pb-item` (`a` when the whole row opens something, `div` when it holds buttons). Parts: `pb-item__lead` (icon, initials or avatar), a span with `pb-item__title` and `pb-item__desc`, then `pb-item__end` with `pb-item__meta`, badges or buttons.
- `aria-current="true"` or `aria-selected="true"` marks the open or selected row. `pb-list--compact` tightens rows; `pb-list--plain` drops the outer border for use inside panes.
- A row is either a link or holds buttons, never both. Put secondary actions in a `more` menu.
- Use a Data table instead when people compare values across rows or sort by columns.
