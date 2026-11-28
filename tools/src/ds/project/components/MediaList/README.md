MediaList shows the items in a collection as rows, with a thumbnail on the left and details on the right: videos, photos, files and nested collections.

## Markup
- `ul.pb-medialist` > `li.pb-mitem` with three parts:
  - `a.pb-mitem__thumb` (16:9) holding one of these:
    - **Video:** an `img` plus a few overlays. `.pb-mitem__play` is a play icon shown on hover and focus. `.pb-mitem__dur` is the duration. An optional `.pb-mitem__seen` bar (`aria-hidden`) holds `<span data-vars="--value:62%">` for the share watched. An optional `pb-badge.pb-mitem__state` shows a processing state.
    - **Photo:** the `img` alone, with no play overlay.
    - **File:** `a.pb-mitem__thumb--file` with `data-kind` (`archive`, `text`, `code`, `audio`, or none) holding `.pb-mitem__type`: a file icon and the extension. The kind sets the color of the tile's top edge.
    - **Collection:** `a.pb-mitem__thumb--mosaic` holding up to four `img`, the same mosaic as a CollectionCard cover.
  - `.pb-mitem__body`:
    - `a.pb-mitem__title`. For a file name, add `pb-mitem__name` and split it into `.pb-mitem__stem` and `.pb-mitem__ext`.
    - `.pb-mitem__meta`: up to four spans, joined with dots. For video: resolution and codec, size, date, views. For a photo: type and pixel size, size, date added, downloads. For a file: kind and file count, size, date added, checksum or downloads.
    - Then three optional parts: `p.pb-mitem__desc` (clamped to two lines), `.pb-mitem__tags` of `pb-pill` (a "password" pill for a locked item), and `.pb-mitem__links` (share page, original, list contents, copy checksum).
  - `.pb-mitem__actions`: icon buttons (download or copy link, then more), each with an `aria-label` that names the item.
- No inline `style`: the watched width goes through `data-vars` (custom properties only, set through the CSSOM), or `data-style` plus `pbStyled(container)` for markup you build as a string.

## States
- **Compact:** `pb-medialist--compact` shows one line per item with a smaller thumbnail (128px) and hides the description, tags and links.
  - A long file name keeps its extension and cuts the middle of the stem: `proxmox-backup-vm-101-ubu….zip`. The full name stays in the link text.
  - The file tile drops its icon and shows only the extension.
- **Full rows:** a long file name wraps instead.
- **Narrow containers:**
  - Under 620px the thumbnail shrinks to 148px, the description clamps to one line and the actions move under the text.
  - Under 420px the thumbnail sits on top, except a file's type tile, which stays a 72px square beside the text. Compact keeps a 112px thumbnail beside the text and hides its actions.
- **Processing:** a video still being processed shows a `pb-mitem__state` badge on the thumbnail.

## Keys
- Native links and buttons only: Tab and Enter.
- Give the thumbnail link an `aria-label`, since it holds no text: "Play …" for video, "Open …" for anything else.

## Events
None; the component fires no events of its own.

## Do and don't
- Do: use MediaList for the list view of a shared collection or album, and CollectionCard for its grid of collections. Use the same title and counts in both.
- Do: use FileBrowser for a folder tree you manage (rename, move, sort by column), and Media for a single shared item.
- Do: start file meta with the kind ("zip archive · 214 files"), not the bare word "other".
- Don't: put a play overlay on anything that doesn't play.
- Don't: write the watched width as `style="..."`.
