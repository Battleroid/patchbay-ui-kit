The image viewer shows a gallery grid and opens any image full screen.

- Markup: `ul.pb-gallery[data-lightbox] > li > a[href=full image] > img[src=thumb][alt]`. Optional `data-name` (file name shown and used for download) and `data-caption` on the link.
- `pbLightbox(el)` adds a `dialog.pb-lightbox` on the `night` ground with a counter, name, zoom, download, close, previous and next, caption and a thumbnail strip.
- Keys: ←/→ move, Z zooms (click the image too), Esc closes. Swipe on touch. Without the script the links still open the full image.
- Thumbnails are cropped square-ish (4:3); the viewer shows the whole image. Always set `alt`.
