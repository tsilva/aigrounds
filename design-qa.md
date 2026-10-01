# Shared learning-page layout QA

The user approved the paired Mean, Median & Mode / Range, Quartiles & IQR preview and requested removal of the redundant top AI Guide button. `DESIGN_SYSTEM.md` is now the canonical design reference, backed by shared components and styles in `src/components/learning-page/`. Both lesson design manifests record the approved refinements. Generated chart positions are illustrative; application positions still use the existing engines.

## Locally verified implementation

- Local URL: http://localhost:57457.
- Evidence: `/Users/tsilva/.codex/visualizations/2026/10/01/01a0f75d-5c6f-7631-a7b0-9ea821a1e141/mean-shared-layout.png` and `range-shared-layout.png`.
- Both screenshots use 1440 × 1024 CSS pixels. Shared navigation, workbench/rail proportions, title hierarchy, scenario controls, editor placement, summaries, numbered progress, and Guide CTA match the approved scheme. Range retains its construction evidence and before/now calculations.
- The top Guide launcher is absent on both lessons; the contextual CTA below the exercise opens the existing assistant. Pages awaiting redesign retain a bottom-right launcher.
- Future metadata with `layout: "guided-discovery"` also suppresses the old floating home button and global Guide launcher, avoiding duplicate navigation and assistance controls.

## Interaction evidence

- Mean: Balanced I 66 → 90 yields mean 44.7, median 42, no mode. Repeated Peak A 18 → 24 yields mean 29.1, median/mode 24, mode frequency 4. Add Outlier I 92 → 28 yields mean 23.8, median/mode 24, mode frequency 3. All three explanation/completion paths and next-dataset transitions passed.
- Mean: an incorrect prediction is acknowledged; an incorrect explanation shows a retry hint and cannot unlock the next dataset. A correct explanation unlocks it. Preset switching, Reset, numeric input, Home/End, and Shift+arrow passed.
- Range: I 58 → 92 yields range 74 and IQR 20. H 48 → 68 yields range 74 and IQR 30. In new data I 88 → 30 yields range 34 and IQR 16. All three experiments completed; incorrect explanations show feedback and cannot advance.
- Range: Wide Middle produces range 76 and IQR 52; Outlier, Return to experiment, Reset, numeric input, keyboard controls, and pointer drag passed. Dragging I to 92 reached the expected target.
- At 768 CSS pixels, both lessons' numeric-editor interactions passed. Nine Range points at 100 occupy separate lanes with no overlapping handle rectangles or horizontal overflow.
- At 767 CSS pixels, both lessons expose only the desktop notice in the accessibility tree; their sliders are hidden. At 768, 1024, and 1440 pixels, all nine sliders and the single contextual Guide CTA are visible with no horizontal document overflow.
- Guide opening/closing and narrower lesson reflow passed for both lessons, including Mean at 768 pixels. Accessible names, slider values, radio states, status updates, and visible keyboard focus are retained. Native 200% zoom and full WCAG conformance were not certified.
- Unaffected Variance & Standard Deviation lesson: switching to Wide and opening/closing its bottom-right Guide launcher passed. The launcher sits 16px above the viewport bottom.
- No console errors in the final browser regression check.

## Verification limits

Real AI Guide replies remain blocked locally: the rendered assistant reports that OpenRouter is not configured. Guide launch, opening content, static instructions, and deterministic exercises are verified. No full guided clean-pass or learner-validation claim is made. This was implementation of an approved layout, not a new teaching-model optimization.

Checks: `pnpm typecheck`, `pnpm lint`, `pnpm check:cycles`, `pnpm build`, and `git diff --check` passed. No dependency changes, commits, pushes, or deployment were performed.

Confidence: fixed/verified for the approved layout and deterministic behavior, local only.
