Compact forms for dense places, replacing consumer type-size overrides.

- `.pb-result--compact` on a Result inside a card or auth card: centred, 21 px title, no page padding. Use `pb-result__icon` with a `pb-icon pb-result__glyph` instead of the big code; `data-status` colours it.
- `.pb-media--compact` on a media tile for grids: 4:3 frame (`pb-media__frame--icon` centres a file icon), a body with `pb-media__head` (`a.pb-media__name` ellipsised), `pb-media__sub` in mono and an optional `pb-media__badges` row. Combine with MediaState for tiles still processing.
