# Mean, Median & Mode redesign QA

Source visual truth: `src/modules/mean-median-mode/design/accepted-mockup.png` — displayed option 2, approved with predict → try → explain, duplicate removal, separated markers, and implementation in the existing repository.

Implementation: http://localhost:57866/playgrounds/mean-median-mode

Implementation screenshot: `/Users/tsilva/.codex/visualizations/2026/10/01/01a0f6c9-7475-75c1-8ba2-d578a735bce0/implementation-final.jpg`

Viewport: 1440 × 1024 CSS pixels; screenshot density 1. Reference: 1487 × 1058 pixels, proportionally normalized into 1440 × 1024 with minimal letterboxing. Implementation: 1440 × 1024 pixels.

State: Add Outlier, original dataset 18, 20, 22, 24, 24, 24, 26, 28, 92; no prediction selected.

## Findings

No remaining actionable P0/P1/P2 visual or deterministic-interaction findings.

- Intentional refinements: one sorted dataset replaces duplicate lists; three aligned marker lanes replace coincident labels; a prediction/reflection exercise replaces duplicated numbers and early explanation text. Existing fonts, numeric engine, scenario identity, and AI chat integration are retained.
- P3: the existing Space Grotesk family and library icons differ slightly from ImageGen's invented font/icon rendering. These are consistent with the existing app and do not impair the learning interaction.

## Comparison history

Evidence directory: `/Users/tsilva/.codex/visualizations/2026/10/01/01a0f6c9-7475-75c1-8ba2-d578a735bce0/`.

1. `comparison-before.jpg`, combined reference and `qa-before.jpg`: [P2] summaries fell below the first viewport; [P2] the rail was too narrow and readout text too small.
2. `comparison-after.jpg`, combined reference and `qa-after.jpg`: reduced chart/lane/editor spacing, widened the rail to approximately 31%, and increased instructional typography. Core readouts returned to the first viewport; heading/readout hierarchy received a final adjustment.
3. `comparison-final.jpg`, combined reference and `implementation-final.jpg`: restored rail heading hierarchy, enlarged summary values, increased chart contrast, and separated close tied-mode markers. Summary region ends at 1008 CSS pixels; all three values and formulas are visible at 1440 × 1024.
4. `summaries-comparison-final.jpg`: readable combined crops of reference and implementation values, definitions, and calculations. Numeric content matches the engine/oracle; formula simplification and removal of duplicate color-dot labels are accepted readability choices.

## Required fidelity surfaces

- Fonts/typography: geometric Space Grotesk, bold display hierarchy, readable instructional copy, prominent numeric readouts; intentional use of the app's existing font rather than an uncertain generated face.
- Spacing/layout: white workspace and pale lavender rail with matching major proportions. Core readouts fit the reference viewport; narrower available containers stack the rail, including when chat is open.
- Colors/tokens: indigo selection, blue mean, purple median, and darker amber mode. Chart outlines/axes are strengthened for contrast; labels and numeric equivalents carry meaning independently of color.
- Image quality/assets: approved image persisted as design evidence. Heroicons supply interface icons. There are no decorative raster assets in this design; instructional graphs are genuine interactive controls, not screenshots or fake art.
- Copy/content: original scenarios retained; prediction/action/reflection text matches the intended numeric experiment; AI Guide plan names visible controls and uses the same questions.

## Interaction and responsive verification

- All three preset changes, reset, next-dataset control, mouse drag, arrow keys, Shift+arrow, Home/End, and exact numeric input passed.
- Balanced: I 66 → 90 gives mean 44.7, median 42, no mode.
- Repeated Peak: A 18 → 24 gives mean 29.1, median/mode 24, four occurrences.
- Add Outlier: I 92 → 28 gives mean 23.8, median/mode 24, three occurrences.
- Wrong prediction plus wrong explanation: a targeted hint appears; the wrong explanation cannot complete the exercise; a corrected explanation can. Changing data invalidates completion. Re-entering an unchanged value preserves completion.
- Changing an unrelated point prevents falsely accepting the target experiment. Fresh/reset paths reveal no explanation before the intended change.
- Near transfer: moving Balanced E 42 → 80 moves the median to 48, demonstrating that median is resistant rather than immutable.
- No-repeat, two tied modes, closely spaced tied modes, all-equal, and min/max cases passed. Nine identical points have no overlapping hit targets.
- 767 CSS pixels: only desktop notice remains in the accessibility tree; lesson controls are hidden and unfocusable.
- 768 CSS pixels: full lesson visible and prediction/action/reflection operable. Also checked 1024 and 1440 CSS pixels, and the narrower workspace with chat open.
- Accessibility tree exposes point names/current values, scenario pressed state, radios, sorted middle, numeric equivalent, and status updates. Keyboard focus is a visible 3px outline. Reduced-motion CSS has no instructional animation dependency.
- Native browser zoom keyboard shortcuts did not change zoom in this in-app browser. Effective 768px reflow was verified; native 200% zoom and full WCAG conformance remain unverified.
- Fresh final browser tab: no console errors. Earlier transient HMR errors during file creation are resolved and absent from the fresh session.
- Another published lesson, Range/Quartiles/IQR: scenario switching and original AI Guide shell passed after shared integration changes.
- Repository gates: `pnpm lint`, `pnpm check:cycles`, `pnpm build`, and standalone typecheck passed. External independent oracle passed 25 cases plus clamping and empty-data boundaries.

## Limits

Real AI Guide replies are blocked by missing OpenRouter configuration in this local environment. Its launch, static plan, and opening copy are verified; full tutoring behavior, incorrect free-text recovery, and the two guided clean-pass gate are not certified. This is a locally verified implementation, not a deployed or learner-validated result.

## Implementation checklist

- Complete: accepted artifact persistence, implemented layout, deterministic exercises, responsive checks, final visual comparison, build gates.
- Pending external configuration: real AI Guide response validation.

final result: passed
