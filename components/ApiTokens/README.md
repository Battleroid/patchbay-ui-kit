The API tokens page lists tokens, creates them with scopes and shows each one once.

- List: a Data table with name and the last four characters, scope pills (`pb-pill--red` for admin), last used as relative time, and expiry (a warn badge inside 7 days, a down badge when expired). Each row has Revoke.
- Create: a Dialog with name, scope checkboxes with hints, and expiry (no "never" by default). After creating, show the token in an ok Notice with a CopyField: "Copy your new token now. You won't be able to see it again."
- Revoke: a danger confirm, then a toast. Revoking is immediate.
- Store only a hash; show `pb_…9f3c` afterwards.
