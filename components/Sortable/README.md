Sortable lists let people reorder items: boot order, dashboard tiles, priorities.

- Markup: `ol.pb-sortable[data-sortable]` (or `pb-sortable--grid` for tiles) of `li.pb-sort__item[data-id]` with a `button.pb-sort__handle` (grip icon), optional `pb-sort__num`, an element marked `data-sort-label` and `pb-sort__meta`.
- `pbSortable(list)` supports dragging by the handle (mouse, pen, touch) with a placeholder, and the keyboard: focus the handle, Space to pick up, arrows to move, Space to drop, Esc to cancel. Each move is announced. It fires `reorder` with the ids.
- Only the handle starts a drag, so text stays selectable. Save the order right away or with the section's Save.
