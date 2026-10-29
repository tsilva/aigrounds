# First lesson and quiz presentation QA

final result: passed

## Target and scope

Approved presentation migration for `mean-median-mode` and the reusable lesson-test UI. The selected playground is the **first number-line mockup**, not the later vertical-drag tile proposal. Existing lesson logic, question content, grading, rotation and progress keys remain authoritative.

- Playground source: `src/modules/mean-median-mode/design/accepted-mockup.png`.
- Quiz source: `src/modules/mean-median-mode/design/accepted-quiz-mockup.png`.
- Implementation: `http://127.0.0.1:51403/playgrounds/mean-median-mode`; the optimized production build was also exercised locally.
- Evidence directory: `/Users/tsilva/.codex/visualizations/2026/10/28/01a18396-5855-75a0-b3d5-7b104b9b3b24/implementation/`.
- Final playground screenshot: `ground-final-clean-1440.jpg`; quiz dataset/selection/feedback screenshot: `quiz-data-choice-1440.jpg`.

## Comparison evidence

The primary CSS viewport is 1440 × 1024. The generated references are 1488 × 1058; the browser screenshot service returned 1425 × 1013 JPEGs. Native display density was not overridden. Both artifacts were normalized to 720 × 512 for full-view comparisons, preserving their essentially identical aspect ratios within pixel rounding. This is a visual comparison, not a pixel-difference threshold or a claim of identical antialiasing.

Opened and inspected combined source/implementation images:

- `ground-final-comparison.jpg`: initial Balanced/Predict state, no submitted test or selected prediction.
- `quiz-data-comparison.jpg`: submitted correct answers, selected rows, authored dataset tiles and explanatory feedback. The source's illustrative outlier item is compared with an actual reservoir item; question text, item count and progress intentionally vary.
- `ground-controls-comparison.jpg`: focused prediction controls, question typography and helper spacing.
- `quiz-feedback-comparison.jpg`: focused correct-feedback strip and Continue action.

## Required fidelity surfaces

| Surface | Finding |
| --- | --- |
| Fonts and typography | Existing Space Grotesk and IBM Plex Mono retained; larger headings, live summaries and choice rows preserve the approved hierarchy. Real question text wraps without clipping. Generated font shapes and raster antialiasing are not treated as exact font specifications. |
| Spacing and layout | White workbench, approximately 66/34 lavender rail, right-aligned navigation, two-line scenario controls, sorted evidence and open summaries match the selected direction. Quiz uses a centered 920px workspace, inline progress, numbered answer rows and a feedback/Continue region. Narrow desktop feedback wraps its action below the explanation. |
| Colors and tokens | Navy text, indigo interactions, lavender surfaces, green correct feedback and amber correction feedback remain distinct. Selection and correctness also have text, native input state and check/retry icons. |
| Image and icon fidelity | No decorative raster assets are needed in the actual UI. Existing Heroicons supply real interface icons. Number-line marks are mathematical data geometry, not approximations of generated artwork. Mockups are retained as design references only. |
| Copy and content | Existing authored questions and first-answer rules preserved. Data tiles reproduce all context values, repeats and order; automated checks compare each structured dataset with its authored context. Learning-path context and continuation remain available below the primary workspace/exercise. |

## Comparison history

1. Initial full-view and focused comparison found a P2 rail-spacing mismatch: the larger question-paragraph rule also enlarged helper text, pushing secondary actions downward.
2. Changed the shared playful selector to `.exercise > p:not(.small)`, restoring the compact helper hierarchy without removing its dataset-reset warning.
3. Captured `ground-final-clean-1440.jpg` and opened `ground-final-comparison.jpg` after the change. No actionable P0/P1/P2 mismatch remains. Native font rendering and minor illustration-to-CSS differences are P3 only.

## Behavioral and regression evidence

- All three guided experiments: prediction, exact-value changes, explanation, blocked incorrect explanation, correction, completion and scenario switching.
- Balanced baseline: mean/median 42, sum 378, no mode. Moving I to 90 yields mean 44.7, median 42, sum 402. Repeated Peak after A joins 24 yields sum 262 and mode 24 occurring four times. Outlier after I moves to 28 yields sum 214, mean 23.8, median/mode 24.
- Pointer drag I from 66 to 90; keyboard Home to 0, End to 100, Shift+ArrowLeft to 90; Reset and exact-value editing.
- Quiz UI: radio, select-all, numeric, text and keyboard-operated slider widgets; disabled/locked submitted answers; immediate correct and incorrect feedback; mistake practice; 6/6 perfect result; corrected 5/6 still reports 83%; a later unsuccessful attempt preserves an earlier pass.
- Real AI Guide opens/closes with the existing introduction. Opening it reduces available lesson width and stacks the rail without overflow. No live Guide message was sent in this presentation test.
- 1440, 1024 and 768 CSS-pixel layouts exercised; exactly 768 remains operable. At 767, the production accessibility tree contains only the desktop notice, with no lesson/test controls.
- Unaffected Range, Quartiles & IQR smoke check: moving I from 58 to 92 changes range 40 → 74 while IQR stays 20; its default presentation is retained.
- No browser console errors in the checked lesson, quiz or neighboring lesson.
- `pnpm typecheck`, `pnpm lint`, `pnpm check:cycles`, `node scripts/check-learning-design.mjs`, and `pnpm build` passed. The build includes 22,971 lesson-test checks and 1,600 balanced question draws.

## Remaining verification limits

Reduced-motion overrides are present in the rendered stylesheets; an OS/browser reduced-motion preference was not emulated. The browser controls did not confirm a true 200% zoom, so that specific zoom check remains unverified; 768px reflow was checked directly. Live AI Guide response quality is outside this presentation migration. No learner-effectiveness or full WCAG-conformance claim is made.

## Implementation checklist

- [x] Implement selected number-line playground and matching quiz presentation.
- [x] Preserve mathematical logic, authored question reservoir and progress semantics.
- [x] Verify affected controls, responsive boundaries and an unaffected lesson.
- [x] Inspect full-view and focused comparisons after the spacing repair.
- [x] Update authoritative design/lesson documentation and retain approved references.
- [x] Pass repository gates; leave a clean local preview open.

Stakeholder intent check: `SPECS.md` is unchanged; this implements the approved presentation within its existing constraints. An unrelated concurrent `AGENTS.md` edit was preserved.


## Shared rollout — 2026-10-29

This run supersedes the earlier first-lesson-only scope and the earlier statement that Range retains its default presentation.

**final result: passed** for the approved presentation migration. No new question banks were created, as requested. This is a visual/interaction migration, not an audit of every lesson's pedagogy or mathematical engine.

### Visual comparison

Compared `/tmp/aigrounds-global-reference-1440.jpg` and `/tmp/aigrounds-global-first-final.jpg` together at 1440 × 1024 in the same initial lesson state. The original approved hierarchy, palette, workspace/rail proportions, controls, number-line geometry and quiz invitation remain consistent. Reviewed the migrated Range and Transformer screenshots against that shared language. No actionable P0/P1/P2 difference remained; the development-server badge is outside the product UI.

| Surface | Evidence |
| --- | --- |
| Shared shell | All 90 registered lessons use the same 72px navigation, larger title hierarchy, lavender rail and single Guide invitation. Path context follows the workspace. |
| Control hierarchy | Raised scenario, reset, toggle and exercise actions; 44px exact-value fields; rounded prediction choices. Native semantics and focus styles remain. |
| Mathematical evidence | All five shared number-line users retain numeric horizontal positions; larger handles use 46px packing and 50px vertical lanes. The collapsed Contrastive scenario keeps three 46px-high handles 50px apart. |
| Quiz | Existing shared canvas, progress, datasets, feedback and first-answer scoring preserved. Invitations default to the outlined secondary action. |

### Browser and behavior evidence

- Brave Stable: all 90 routes checked at both 1440 × 1024 and 768 × 1024, plus eight representative dense/control-heavy lessons at 1024 × 1024. All 188 route/viewport checks found no page overflow, no overlapping slider buttons, a 72px navigation and one Guide invitation. Measurements: `/tmp/aigrounds-all-lessons-layout-report.json`.
- Range: prediction → I=92 via exact editor yields range 74 and IQR 20. Incorrect explanation blocks completion; the correct explanation completes the experiment. Reset returns I=58, range 40 and IQR 20. Keyboard End then Shift+ArrowLeft yields 90. Pointer drag to 92 yields exactly 92.
- Guide: opens with its existing introduction and closes; at a 384px available lesson width, the shell reflows without page overflow. No live AI message was sent.
- At 767px, the accessibility tree exposes only the desktop notice (plus development tooling), with no lesson controls.
- Contrastive: selecting Collapsed retains coincident values of 40 in separate rows; margin editing to 50 commits on Enter. At 768px the handles remain 50px apart without page overflow.
- Quiz: x=12 for values 2, 4, x and mean 6 shows Correct feedback and locks the response. The dialog fits at 768px without overflow. Closing and reopening shows Start test.
- No browser console errors observed. Full 200% zoom and reduced-motion emulation were not exercised; the existing reduced-motion override remains intact.

### Checks

`pnpm typecheck`, `pnpm lint`, `pnpm check:cycles`, `pnpm build` and `node scripts/check-learning-design.mjs` passed. The build includes 22,989 quiz checks, independent numeric oracles and 1,600 balanced selections. No dependencies or algorithm engines changed. Verification is local; this rollout has not been deployed.
