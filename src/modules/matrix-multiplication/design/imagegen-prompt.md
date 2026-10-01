# Matrix Multiplication Lab approved redesign

Approved by the user on 2026-10-01 in the redesign conversation. The preview was rendered as HTML in the native Codex in-app Browser after built-in image generation failed with a network error. No generated image was substituted for mathematical geometry.

## Visual brief

Apply DESIGN_SYSTEM.md: a 64px AI Grounds / All lessons navigation, a continuous white workbench, a pale lavender experiment rail, navy text, indigo controls, fine separators, matching two-line scenario buttons and Reset. Retain all three fixed matrix presets. Display A, B and selectable C once, with labeled row/column highlights. Follow with stepwise dot-product terms, running sums, the full selected equation, open summaries, all selectable output formulas, the incompatible-shape example and dimension/summation rules. Put the single AI Guide invitation below the rail exercise.

## Approved interaction changes

Bring the existing three teaching experiments into the rail: Check the shapes, Build one cell, Repeat across C. Collect a prediction before the relevant actions and require a correct explanation before progression. Incorrect predictions permit recovery through evidence; incorrect explanations cannot complete an experiment. Preserve free exploration and optional transfer practice with the existing 3x2 x 2x1 preset. Keep the original engine and matrix datasets.

## Implementation refinements

- Start Check the shapes on the original three-term preset, so choosing 2x2 x 2x3 after predicting produces an observable shape change. The other experiments restore that guided preset.
- Display the complete selected result alongside the partial running sum, as the original lesson did; output values remain visible.
- Retain every full-product formula without repeating A/B/C matrices.
- Use the shared component APIs, typography and responsive placement rather than reproducing the preview's standalone CSS.
- Stack matrix representations when space is limited; keep the 767px desktop-only notice.
- Use disabled Check explanation until an explanation is selected; invalidate completion after changing the evidence.
