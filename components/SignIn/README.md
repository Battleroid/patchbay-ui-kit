The sign-in screens cover password sign-in, two-factor setup and the code prompt.

- Layout: `.pb-auth` centers a `pb-auth__card` on the page (`--auth-h` sets the height). Parts: `pb-auth__brand`, `h1.pb-auth__title`, `pb-auth__sub`, fields, `pb-auth__row` (remember me and forgot password), `pb-btn--block` buttons, `pb-auth__or`, `pb-auth__foot`.
- Errors: a `pb-notice[data-status=down][role=alert]` above the fields that says what failed and what happens next (tries left), and the field marked invalid. Never say which of username or password was wrong.
- Two-factor setup: `ol.pb-auth__steps` with a QR code and the secret in text, a CodeInput, and `ul.pb-recovery` codes with Copy and Download. The finish button stays disabled until a code is entered.
- Use `autocomplete` values (`username`, `current-password`, `one-time-code`) so password managers work.
