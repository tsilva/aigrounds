# Lesson Verification

Follow root [AGENTS.md](../../../../AGENTS.md) for browser/server policy and
repository checks. Measure actual CSS viewport dimensions per tested tab;
the in-app browser viewport override may affect only the selected tab.

## Affected Paths and Accessibility

For a fix, verify the reproduction, affected state families, and dependent
controls. For a presentation migration, cover the preserved scenarios, reset,
exact-value editing, pointer/keyboard operation, feedback, incorrect-explanation
recovery, completion, and Guide opening/closing. After shared runtime/UI changes,
smoke-test at least one unaffected published lesson.

At supported widths, check accessible names/roles/values/states, logical visible
focus with no traps, keyboard-equivalent operation, live/status updates, data
equivalents for instructional charts, color-independent meaning, readable
contrast/text spacing, distinguishable focus/state, and reduced-motion behavior.
Check 200% zoom/reflow from a physical viewport retaining at least 768 effective
CSS pixels. Report any unverified part of this matrix.

Verify lesson operation at 768, 1024, and 1440 CSS pixels and reflow when the
assistant reduces available width. Check overflow, overlapping handles, duplicate
navigation, and redundant Guide launchers against the shared design system.
At 767 CSS pixels, only the desktop notice may be visible, accessible, and
keyboard-reachable. Hidden lesson markup must be inert, absent from the
accessibility tree, and unfocusable. The full lesson must operate at exactly 768.

Preflight the real rendered AI Guide. When replies fail or external configuration
is missing, report that verification as blocked, use static tutor-plan checks
only as partial evidence, and do not count a clean pass. Do not add product-code
workarounds or read, request, or log secret values.

## Clean-Pass Gate: Create, Redesign, and Full Optimize

Require two consecutive passes with unchanged code. Any repair resets the count.
Use different exploration or answer paths in the two passes:

1. Follow the canonical Guide journey as a prerequisite-bounded learner using
   only visible page and Guide information.
2. From a fresh/reset state without Guide help, identify the question, first
   action, prediction, and changed evidence without guessing. Cover all primary
   controls, alternate scenarios, boundaries, and an alternate action order or
   Guide-answer branch.
3. Gather prediction/action/explanation evidence for each outcome and a
   near-transfer case. Submit a vague/incorrect response; verify completion is
   blocked and recovery succeeds.
4. Reject stale state, dead controls, console errors, answer leakage, mismatched
   labels, redundant surfaces, ambiguous affordances, uncovered misconceptions,
   and unresolved material friction.

Store compact records outside the repository: URL/build identity, CSS viewport
and zoom, reset marker, exact paths/answers, oracle expected-versus-observed
results, console/accessibility-tree results, and selective screenshots.

## Confidence

- `fixed/verified`: an approved presentation migration or narrow deterministic
  repair, with affected-path evidence.
- `expert-verified / novice-simulated candidate`: full agent verification,
  including the clean-pass gate.
- `learner-observed`: limited, non-preregistered learner evidence.
- `learner-validated winner`: a preregistered comparative protocol with
  prerequisite-qualified learners measuring prediction, explanation, near
  transfer, incorrect-answer recovery, adverse misconceptions, completion
  friction, and time to insight.

After application changes, run the repository gates in AGENTS.md. Audit runs
finish by checking the unchanged baseline. Report actual coverage and calibrated
confidence. Never infer universal learning optimality from an agent pass or a
design-system migration, full WCAG conformance from this matrix, or guided
completion when the Guide preflight is blocked.
