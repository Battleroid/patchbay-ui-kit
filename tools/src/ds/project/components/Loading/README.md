Loading indicators show that something is on its way.

- Spinner: `span.pb-spinner` (`--sm`, `--lg`) with `role="status"` and an `aria-label`. In the hard cut it is a turning square.
- Inline: `.pb-loading` pairs a small spinner with italic text that says what is happening ("Checking 12 services…").
- Skeletons: `pb-skel` blocks (`--text`, `--title`, `--circle`, `--block`) shaped like the content they replace. Put `aria-busy="true"` and an `aria-label` on the container. The shimmer stops under reduced motion.
- Show nothing for waits under 300 ms, skeletons for first loads, a spinner for actions. Buttons use their own busy state.
