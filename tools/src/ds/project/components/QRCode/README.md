QR codes let a phone open a share link or join a network without typing.

- Markup: `figure.pb-qr[data-qr="text"]` with an empty `div.pb-qr__code` and a `figcaption.pb-qr__caption`; `pbQRCode(el)` draws it. `--qr-size` sets the size (default 168px).
- The encoder is built in (`pbQR(text)`, `pbQRSvg(text)`): byte mode, error correction M, up to 213 bytes. No network or library.
- The code is always dark on white with a quiet zone, in both themes, so every camera reads it.
- Always show the link or name next to it and give a copy button. Wi-Fi codes use `WIFI:T:WPA;S:name;P:password;;`.
