# Creation and Material Design Changes

Read the current [design system](../../../../DESIGN_SYSTEM.md). Use imagegen
for Create and materially new interaction/layout designs. Inspect each draft,
record defects, and regenerate while material teaching, numeric, visual, or
interaction defects remain. Show the strongest self-reviewed mockup and obtain
explicit approval of that version before application implementation. Established
approval in the conversation satisfies this gate; a preview alone does not.

After approval, persist or refresh these files under `src/modules/{slug}/design/`:

- `accepted-mockup.png`;
- `imagegen-prompt.md`;
- `design-manifest.json`, recording lesson-plan step or `null`, title, slug,
  module path, mockup path, prompt path, and retained source generated-image path.

Use repository-relative paths for versioned artifacts. Optional transient source
or preview paths must be `null` when no byte-identical versioned copy is retained.
Keep generator/model facts and content hashes; do not substitute a different image
for a missing original. Keep complete local provenance privately under ignored
`.internal/reference/`, rather than publishing workstation or tool-session paths.

Record approved refinements that differ from the image, such as removing a
redundant launcher. Keep session reports in gitignored `.internal/qa/YYYY-MM-DD-<lesson>.md` and captures in `.internal/evidence/<lesson>/` at the Git root. Verify exclusion before writing; keep approved design inputs needed for maintenance in their existing tracked design directory.

## New Lesson Integration

Reserve the planned slug before metadata writes. After its teaching contract,
correctness oracle, alternative challenge, and approved design are ready:

1. Implement the self-contained module, with pure concept logic in its engine
   and separate scenarios when helpful. Reuse the shared learning-page system.
2. Register the component in `src/lib/playgrounds.ts`; move planned metadata
   into `activePlaygroundMetadata` while preserving the existing position in
   `dashboardLessonPlanOrder`.
3. Verify the home card, route, and removal of the coming-soon state; update
   the published-playground inventory in `README.md`.

Use [verification](verification.md), including the Create clean-pass gate,
before claiming completion of the teaching experience.
