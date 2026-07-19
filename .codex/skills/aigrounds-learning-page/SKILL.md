---
name: aigrounds-learning-page
description: Create, optimize, fix, or audit an individual AI Grounds learning playground and its AI Guide. Use for new or planned concepts, live playground URLs or slugs, beginner-learning audits, deterministic lesson fixes, and full teaching-experience optimization. Keep cross-lesson ordering, prerequisite-lesson creation, and curriculum splits or merges in the separate lesson-plan review skill.
---

# AI Grounds Learning Page

Build or evaluate one coherent teaching system: the rendered playground, concept
engine, scenarios, visible copy, and AI Guide. Optimize for a learner who knows
the declared prerequisites and nothing more.

Read root `SPECS.md` before acting. AI Grounds supports lesson interaction only
at viewport widths of 768 CSS pixels or wider; below that boundary, verify only
the desktop/laptop notice rather than designing a mobile lesson.

## Resolve the Mode and Target

Resolve intent semantically, in this order:

1. Select **Audit** when the user explicitly forbids writes or asks only to
   audit, review, diagnose, report, suggest, or plan. Mentioning possible fixes
   inside a report request does not authorize edits.
2. Select **Create** for an imperative to create, build, or add a lesson/page.
3. Select **Optimize** for an imperative to fix, apply, implement, update,
   improve, iterate on, or optimize a selected lesson/page. A request to audit
   and then apply or fix findings is Optimize.
4. Without a verb, resolve the target:
   - reachable live URL or live slug -> Audit;
   - planned slug or clearly novel concept supplied through an explicit skill
     invocation -> Create;
   - unresolved ordinary-language noun phrase -> ask one mode question.
5. For a bare explicit invocation, select the first slug in
   `dashboardLessonPlanOrder` that is still in `upcomingPlaygrounds` and use
   Create. Record its lesson-plan position, slug, and title before design work.

Retain conversational context: after auditing a target, a follow-up such as
"fix all" switches that same target and defect ledger to Optimize. Audit never
self-escalates into a write mode.

For a production URL:

- Audit the exact rendered URL.
- In Optimize, capture the remote baseline, map its slug to local metadata and
  source, and reproduce every remote defect locally before editing.
- If the slug is unmapped or behavior cannot be reproduced because remote and
  local semantics differ, stop and report deployment/configuration divergence.
- Certify the local rendered route after changes and report it as locally
  verified, not deployed, unless deployment was separately authorized.

If the user explicitly requests a batch or parallel count, resolve and reserve
each target independently. Use subagents only with that explicit permission,
give workers disjoint module ownership, and integrate shared files in the main
agent.

## Protect Existing Work

Before any mode, capture `git status --short`. Before Create or Optimize, also
capture relevant tracked diffs, dirty-file contents, and an inventory plus
content hashes for pre-existing untracked files.

- Never revert, overwrite, or reformat user-owned work.
- Merge around separable overlap; pause before touching a file when ownership
  cannot be distinguished safely.
- Keep final reporting clear about pre-existing versus skill-made changes.
- Store screenshots, run ledgers, and other transient verification evidence
  outside the repository unless they are accepted design artifacts.

Audit must create no repository-visible product delta. At the end, require the
tracked and non-ignored untracked status, contents, and hashes to match the
baseline. Known ignored generated caches such as `.next` may change during
rendering; never read, log, or directly alter ignored user configuration or
secrets.

## Establish the Teaching Contract

Before design, repair, or certification, record:

- lesson identity and scope;
- explicit prerequisites;
- one core intuition;
- the smallest sufficient set of observable outcomes, normally 2-5 and never
  more than 5;
- high-risk misconceptions and whether each is addressed or out of scope.

Use user- or lesson-plan-declared prerequisites first. Never infer that every
earlier dashboard lesson is required. When prerequisites are absent, derive and
state a minimum set from authoritative concept sources. Pause only if the
choice materially changes the teaching model; otherwise mark it provisional.
Route sequencing disputes, new prerequisite lessons, lesson reordering, and
splits or merges to `$aigrounds-lesson-plan-review`.

### Build a Claim/State Oracle

Inventory every teachable claim and state family across visible UI, Guide
steps, engine output, scenarios, control ranges, formulas, units, labels,
takeaways, visualization mappings, causal claims, assumptions, examples, and
boundary behavior.

Validate the inventory with the best applicable authority, preferring:

1. a standard or specification;
2. a canonical textbook;
3. official technical documentation;
4. a peer-reviewed survey;
5. a seminal paper.

Record sources, domain, assumptions, conventions, and reconciled conflicts in
the run ledger. Exhaust every discrete branch and state. For continuous or
high-cardinality families, verify governing formulas and invariants,
equivalence classes, extrema, boundaries, and representative values. Recompute
representative and boundary values independently without reusing production
logic. Claim coverage of this defined state model, never empirical proof of
every possible continuous value.

## Optimize the Teaching Model

Use this priority order:

1. correctness and supported-desktop accessibility as hard gates;
2. prerequisite-qualified mastery and misconception-recovery proxies;
3. among similarly effective designs, the least cluttered, shortest, most
   direct learner path.

Allow a small increase in friction only for a material mastery or recovery gain
and record the tradeoff. Require every control, surface, formula, metric, and
text block to have a unique teaching job, be used by the Guide, or be clearly
optional. Prefer one causal interaction with only the feedback necessary to
observe the target idea. Explain non-prerequisite jargon on first use, use exact
visible control labels in Guide instructions, and keep learner actions atomic.
One exercise may evidence several outcomes.

Treat `assets/cross-entropy-design-reference.png` as a visual-language reference
only. Inspect it before Create or a material redesign. Do not force its exact
panel rhythm, number of surfaces, or interaction structure onto another
concept.

### Challenge Full Optimizations

Before choosing a Create design and before certifying a full Optimize run,
maintain a novelty ledger and run two independent challenges:

1. a pedagogy/mechanism challenge;
2. a deletion-first/accessibility challenge.

A candidate counts only when it materially changes at least one instructional
axis: causal interaction or representation, scaffold sequence, feedback or
mastery probe, or deletion-first simplification. Cosmetic variants do not
count. Compare viable candidates on correctness, accessibility, mastery
proxies, prerequisite burden, misconception recovery, actions/controls, and
time to insight. Record why an axis has no viable alternative when applicable.

Any viable new family or adopted candidate resets challenge saturation and
clean-pass counting. If a practical exploration cap is reached, report
`incomplete saturation`; do not call the result optimized.

A narrowly scoped, deterministic correctness, label, or behavior repair may
skip this challenge and finish only as `fixed/verified`. Requests to optimize,
iterate, or fix all to completion must challenge the stable teaching model
before using an optimization confidence label.

## Run the Selected Lifecycle

### Create

1. Reserve the planned slug without editing metadata.
2. Establish the contract, oracle, and alternative challenge.
3. Inspect the visual reference and use imagegen to create a high-fidelity
   mockup. Treat every generated image as a draft: inspect it, write a defect
   ledger, and regenerate while material teaching, numeric, visual, or
   interaction defects remain.
4. Show only the strongest self-reviewed mockup. Obtain explicit approval of
   the latest version before editing application code.
5. Persist the approved design artifacts, then implement and verify.

### Optimize

1. Capture remote/local baselines when applicable and reproduce findings.
2. Play through the rendered lesson, create a ranked defect ledger, and apply
   the smallest autonomous repairs inside the existing lesson identity and
   prerequisite contract.
3. Reopen approval only for material divergence from explicit user-approved
   prerequisites, outcomes, identity, scope, curriculum intent, external
   behavior, or for a materially different teaching model or interaction/layout
   redesign.
4. Use imagegen and refresh design approval for such a redesign. Minor copy,
   behavior, accessibility, and layout repairs may skip imagegen.
5. Run the full challenge when optimization certification is requested, then
   repair and verify until convergence.

### Audit

1. Inspect the target module, metadata, engine, scenarios, tutor plan, and
   assistant shell without changing them.
2. Play the rendered target as a learner limited to the declared prerequisites.
   Read visible instructions literally and never bridge gaps with code or oracle
   knowledge.
3. Cover the Guide journey and unguided interaction surface, recording concrete
   reproduction evidence.
4. Replay uncertain findings once, report all material defects and limits, and
   stop without fixes or repository-visible artifacts.

## Persist Approved Design and Integrate Create

After Create approval, and after every approved material Optimize redesign,
refresh:

- `src/modules/{slug}/design/accepted-mockup.png`;
- `src/modules/{slug}/design/imagegen-prompt.md`;
- `src/modules/{slug}/design/design-manifest.json`.

The manifest must record the lesson-plan step or `null`, title, slug, module
path, accepted mockup path, prompt path, and source generated-image path.

For Create:

- implement a self-contained module under `src/modules/{slug}/`;
- keep meaningful concept logic pure in `{slug}-engine.ts` and separate scenario
  data when helpful;
- reconcile `visible control/surface -> Guide step -> outcome -> expected
  observation` before verification;
- register the component in `src/lib/playgrounds.ts`;
- move its metadata from `upcomingPlaygrounds` to
  `activePlaygroundMetadata`, preserving its existing position in
  `dashboardLessonPlanOrder`;
- verify its home card, route, and removal of the `coming-soon` state;
- update the published-playground inventory in `README.md`.

Define ownership behaviorally rather than by path. Change shared tutor,
assistant-shell, registry, or metadata files only when required for the selected
lesson. After shared runtime/UI changes, smoke-test at least one unaffected
published playground.

## Verify and Converge

Use an existing development server when available. Otherwise run
`pnpm dev --port auto`, report its printed URL, and never kill or restart an
existing server. If automatic port selection or startup fails, stop and warn;
do not switch to a fixed port.

For rendered testing, load the bundled Browser skill/runtime, initialize
`browser-client`, select `agent.browsers.get("iab")`, and use its documented
Playwright/CUA APIs. Follow Browser recovery guidance and never silently fall
back to another browser surface.

Preflight the real rendered AI Guide. If it is unavailable, failed, or blocked
by missing external configuration:

- do not count a clean pass;
- do not add a product-code workaround;
- do not read, request, or log secret values;
- run static tutor-plan checks only as partial evidence;
- report external/environment verification as blocked.

### Clean-Pass Gate

Require two consecutive clean passes with unchanged code for Create and full
Optimize only. Any repair resets the count. In each pass:

1. Run a canonical Guide journey as the prerequisite-bounded learner, using
   only visible page and Guide information.
2. From a fresh/reset state with the Guide unavailable, identify the lesson
   question, intended first action, prediction, and changed evidence without
   guessing. Then cover every primary control, alternate scenarios, boundaries,
   and at least one alternate action order or Guide-answer branch.
3. Gather prediction, action, and explanation evidence for every outcome plus a
   near-transfer case. Deliberately submit a vague or incorrect response,
   confirm it cannot complete the lesson, and verify recovery.
4. Reject stale state, dead controls, console errors, answer leakage, mismatched
   labels, redundant surfaces, ambiguous affordances, uncovered misconceptions,
   or unresolved material friction.

Store a compact pass record outside the repository: URL/build identity, CSS
viewport and zoom, reset marker, exact guided and unguided paths and answers,
oracle expected-to-observed results, console result, accessibility-tree result,
and selective screenshots. Consecutive passes must use different exploration
or answer paths.

### Supported-Desktop Accessibility

Use a desktop accessibility matrix derived from WCAG 2.2 AA, but do not claim
full AA conformance because the product intentionally removes lesson content
below 768 CSS pixels. At supported widths verify:

- correct accessible names, roles, values, and states;
- logical visible focus, no traps, and keyboard-equivalent operation for every
  control;
- live/status exposure for instructional updates;
- text or data equivalents for every instructional chart, canvas, SVG, or
  dynamic visualization;
- color-independent meaning, text spacing, readable contrast, distinguishable
  focus and state, and reduced-motion behavior that preserves instruction;
- 200% zoom/reflow from a physical viewport wide enough to retain at least 768
  effective CSS pixels.

At 767 CSS pixels, require only the desktop notice to be visible, accessible,
and keyboard-reachable. Lesson markup may remain in the DOM only when hidden,
inert, absent from the accessibility tree, and unfocusable. At exactly 768 CSS
pixels require the full lesson to be visible and operable. Also exercise the
lesson at 1024 and 1440 CSS pixels.

After the final write, run:

```text
pnpm lint
pnpm check:cycles
pnpm build
```

## Report Confidence and Results

Use only these calibrated labels:

- `fixed/verified` for a narrow deterministic repair;
- `expert-verified / novice-simulated candidate` after full agent verification;
- `learner-observed` for limited, non-preregistered learner evidence;
- `learner-validated winner` only after a preregistered comparative protocol
  with prerequisite-qualified learners measuring prediction, explanation,
  near transfer, incorrect-answer recovery, adverse misconceptions, completion
  friction, and time to insight.

Report the selected mode and target, prerequisite and source assumptions,
changes or audit findings, challenge families, clean-pass evidence, commands,
accessibility and viewport coverage, confidence label, blockers, remaining
risk, and whether results are local-only. Never claim universal learning
optimality or full WCAG conformance without matching evidence.
