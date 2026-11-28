CollectionCard is a tile for an album, project or board: a cover, the name, a short snippet and a line of meta.

## Markup
- `ul.pb-collgrid` holds the cards; it fills the row with columns at least 248px wide.
- Each `li.pb-coll` has three parts:
  - `.pb-coll__cover` (16:10). Its plain form holds one `img`.
    - `--mosaic` takes up to four `img`. Wrap the last one in `.pb-coll__more` with a `<span>+20</span>` when there are more.
    - `--board` holds six empty `<span>` notes: a stand-in for a board with no rendered preview. Use a plain cover with an `img` once you have a real one.
    - `--empty` holds a folder icon and "No items yet".
  - An optional `.pb-coll__badges` row of `pb-badge`, laid over the cover (public, private, shared).
  - `.pb-coll__body`:
    - `h3.pb-coll__title` > `a.pb-coll__link`. The link covers the whole card, so the card opens from anywhere.
    - `p.pb-coll__snippet`, clamped to two lines.
    - `.pb-coll__foot`, which holds three things:
      - `.pb-coll__meta`: spans joined with dots (count, size, age), on one line.
      - An optional `.pb-avatars.pb-coll__people` with an `aria-label` naming who it's shared with.
      - `button.pb-coll__menu`.
- Covers are decoration. Give their images `alt=""`; the title link names the card.
- The last tile can be `li.pb-coll.pb-coll--new` holding `button.pb-coll__new` to make a new one.

## States
- **Current:** `aria-current="page"` on the title link outlines the card in accent. Use it for the open project in a picker.
- **Hover:** the border darkens, the shadow lifts and the title turns accent. A single cover image zooms slightly; reduced motion turns that off.
- **Long titles and snippets:** each clamps to two lines. Cards in a row line up because the foot sits at the bottom.
- **No description:** `pb-coll__snippet--empty` shows "No description" in italics, so the cards keep the same shape.
- **Hard edges:** square corners and offset shadows, and the board's notes stop tilting and get an ink outline.

## Keys
- Tab reaches the title link, then the menu button, card by card. Enter opens the card.
- The people stack isn't focusable; put the full list in the card's page or its menu.

## Events
None; the component fires no events of its own. Wire the menu button to a Menu or ContextMenu.

## Do and don't
- Do: keep meta short, with the count first and then size or age (`24 items · 1.4 GB · 2h ago`). It cuts off with an ellipsis instead of wrapping, so the cards in a row stay the same height.
- Do: use the same title, count and meta in MediaList rows, so a grid/list switch shows the same facts.
- Don't: wrap the whole card in an `<a>`. The menu button would sit inside a link, which screen readers can't handle.
- Don't: use it for single files; those are Media tiles or MediaList rows.
