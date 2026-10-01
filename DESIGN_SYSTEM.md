# Learning-page design system

This is the canonical visual and layout scheme for new playgrounds and material playground redesigns. The approved paired reference is in `src/modules/mean-median-mode/design/accepted-mockup.png` and `src/modules/range-quartiles-iqr/design/accepted-mockup.png`. It establishes the visual language; mathematical geometry must always come from the engine, not the raster reference.

## Shared implementation

Use `LearningPage`, `ExperimentProgress`, `LessonSummaries`, and `GuideInvitation` from `src/components/learning-page/learning-page.tsx`. Use `learning-page.module.css` for shared surfaces and controls. Mark the lesson's metadata `layout: "guided-discovery"` so the assistant shell leaves Guide access to the rail CTA. Module CSS should contain only concept-specific representations and arrangements. Change shared styling centrally instead of copying or overriding it in each lesson.

## Page anatomy

1. A 64px navigation bar contains AI Grounds and “← All lessons”.
2. A continuous white workbench occupies approximately 69% of the desktop page. A pale lavender experiment rail occupies the remainder, separated by a fine vertical rule.
3. The workbench begins with “Guided discovery”, the lesson title, and one short action-oriented subtitle. Keep the header inside the workbench.
4. Separate two-line scenario buttons share one style and size. The active scenario is indigo. Reset is a small outlined action at the right of the toolbar.
5. “Your dataset” introduces the primary manipulation surface. Place its exact-value editor and keyboard instructions directly below it, inside the workbench.
6. Supporting construction evidence follows the editor, separated by horizontal rules. Summary values follow in open columns with subtle vertical dividers, not nested cards.
7. The rail contains an experiment count, a compact title, numbered “Predict → Try → Explain” progress, prediction/action/explanation controls, feedback, and the “Talk it through” Guide CTA below the exercise.

The Guide CTA opens the existing assistant. Do not add a second Guide launcher in the top navigation. Existing pages without an experiment rail retain the assistant shell's bottom-right launcher until redesigned.

## Visual tokens and hierarchy

- White canvas; lavender rail `#f6f5ff`; navy text `#0c1230`; muted text `#536487`; divider `#dfe4f4`; indigo interaction `#5031dc`.
- Use the existing Space Grotesk typeface, with IBM Plex Mono for formulas. Desktop titles are 40px, experiment titles 28px, summary values 40px, body/instructional text 14–17px, and secondary guidance 12–13px.
- Workbench padding is 32px; rail padding is 32px vertically and 28px horizontally. Use 7px control corners, modest gaps, and thin rules. Shadows and large rounded card containers are unnecessary.
- Semantic chart colors can vary with the concept. Always accompany color with labels, shape, position, or textual data; retain the indigo interaction/focus language.

## Adaptation and verification

- Reuse the same anatomy while allowing the mathematical visualization and supporting construction to differ. Do not invent identical controls or delete essential teaching evidence just to achieve visual symmetry.
- At available container widths of 1099px or less, place the rail beneath the workbench. The same rule applies when opening the assistant reduces lesson width. Keep controls readable and keyboard-operable.
- Below 768 viewport pixels, show only the existing desktop/laptop notice. Verify full lessons at 768, 1024, and 1440 CSS pixels.
- Preserve exact numeric mapping, non-overlapping point handles, accessible data equivalents, live feedback, selected states, visible focus, and reduced-motion behavior.
- Verify scenario switching, reset, value editing, keyboard manipulation, incorrect-explanation recovery, completion, Guide opening/closing, and one unaffected lesson after shared changes.
- Store and refresh approved mockups, prompts, and manifests for material redesigns. Record explicit refinements such as removed redundant controls; generated chart marks are illustrative, not a numeric oracle.
