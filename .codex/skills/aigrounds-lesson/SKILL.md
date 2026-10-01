---
name: aigrounds-lesson
description: Create, audit, fix, optimize, or redesign an individual AI Grounds lesson and its AI Guide. Use for playground URLs, lesson slugs, new concepts, and migrations to the shared design system; use aigrounds-curriculum for cross-lesson sequencing and splits.
---

# AI Grounds Lesson

Treat the playground, engine, scenarios, copy, and AI Guide as one teaching
system for a learner who knows only the declared prerequisites. Follow root
[AGENTS.md](../../../AGENTS.md) for specifications, repository checks, and
browser/server policy.

## Select the Mode and Target

Resolve the lesson from the request, route, or conversation. Retain the target
and findings across follow-ups. Select Audit first when writes are forbidden
or the request is only a review, diagnosis, suggestion, plan, or preview.

| Mode | Trigger | Workflow |
| --- | --- | --- |
| Audit | Evaluate an existing lesson without applying changes | Inspect source and rendered behavior; report reproducible findings. A design preview may generate an image outside the repository, but permits no application edits. |
| Create | Build or add a new/planned lesson | Read [creation and design](references/creation-and-design.md) and [optimization](references/optimization.md); approve the design, implement, and verify. |
| Fix/Optimize | Apply findings, repair, improve, iterate, or optimize | Reproduce defects and repair within the teaching contract. Read [optimization](references/optimization.md) for full teaching optimization. |
| Redesign | Revamp an existing lesson as a complete teaching experience | Read [redesign](references/redesign.md), [correctness](references/correctness.md), and [optimization](references/optimization.md); fix conceptual errors, reformulate the learning journey, and apply the shared design system. |

Without an action, a live URL/slug means Audit; an explicitly invoked planned
slug or novel concept means Create. Ask one mode question for an unresolved
noun phrase. For a bare invocation with no conversational target, select the
first planned slug in `dashboardLessonPlanOrder` and record its position,
slug, and title before Create design work. A request to audit and then apply
findings permits changes; Audit alone never escalates into a write mode.

For production URLs, inspect the exact URL. Before editing, map its slug to
local source and reproduce remote defects locally. Stop dependent work and
report deployment/configuration divergence when mapping or reproduction fails.

Route sequencing, prerequisite-lesson creation, and lesson splits/merges to
[$aigrounds-curriculum](../aigrounds-curriculum/SKILL.md). For an explicitly
requested parallel batch, reserve targets separately, give workers disjoint
module ownership, and integrate shared files in the main agent.

## Preserve the Baseline

Capture Git status, relevant tracked diffs and dirty-file contents, and an
inventory with content hashes of pre-existing non-ignored untracked files.
Merge around separable work; pause on inseparable ownership conflicts. Keep
transient screenshots and run ledgers outside the repository.

Audit must leave tracked and non-ignored untracked status, contents, and hashes
matching the baseline. Ignored generated caches may change during rendering;
never inspect, log, or directly alter ignored user configuration or secrets.

## Establish the Teaching Contract

Record identity, scope, prerequisites, one core intuition, normally 2–5
observable outcomes (at most five), and high-risk misconceptions addressed or
out of scope. Use declared prerequisites first; earlier dashboard position does
not imply a prerequisite. If absent, derive a minimum set from authoritative
sources and mark it provisional. Clarify choices that materially change the
teaching model before dependent work.

Read [correctness](references/correctness.md) before correctness audits, Create,
full Optimize, or Redesign. For a narrow fix, apply it to the affected claims
and state families. Redesign must audit the whole teaching system and fix every
identified conceptual error; it is not merely visual polishing. Retain engines
and experiments only when correct and effective for the revised teaching contract. Reconcile each visible control/surface with its
Guide step, outcome, and expected observation.

Correctness and supported-desktop accessibility are hard gates. Optimize next
for mastery and misconception recovery, then for the shortest uncluttered path.
Every surface must have a unique teaching job, serve the Guide, or be clearly
optional. Explain non-prerequisite jargon on first use, keep actions atomic,
and use exact visible control labels in Guide instructions.

## Review Suggestions and Recommend

After presenting suggestions, reassess them in a fresh comparison and explicitly
tell the user which option you prefer and why, in the same response and before
any approval question. When presenting only one proposal, compare it with the
current lesson. Do not leave the recommendation for the user to request.

Prefer the option that teaches the most with the least learner friction:
stronger understanding, misconception recovery, and transfer with fewer actions,
less clutter, lower prerequisite burden, and a clearer path to insight. Keep
correctness and supported-desktop accessibility as hard gates. Justify added
friction only when it produces a meaningful learning gain; visual polish alone
does not decide the winner. Explain the decisive tradeoff briefly and distinguish
expected teaching benefits from learner-validated results.

## Design and Approval

For Create or material redesign, read [DESIGN_SYSTEM.md](../../../DESIGN_SYSTEM.md)
and the shared implementation it names. This is the visual authority over older
mockups. Keep module styling focused on concept-specific representations and
derive mathematical geometry from the engine.

Read [creation and design](references/creation-and-design.md) for new lessons or
material interaction/layout changes. Reuse established conversation approval;
unchanged shared tokens/components need no repeat approval. Reopen approval for
material divergence from approved prerequisites, outcomes, identity, scope,
curriculum intent, external behavior, or teaching model. Minor copy, behavior,
accessibility, and layout repairs may skip imagegen.

## Execute and Verify

Inspect the module, engine, scenarios, metadata, tutor plan, and relevant shell.
In Audit, play as a prerequisite-bounded learner using only visible instructions
and Guide information; cover guided and unguided paths and replay uncertain
findings once. In write modes, maintain a ranked defect ledger and repair within
the selected scope. Change shared files only when required for the lesson.

Read [verification](references/verification.md) before rendered checks. Create
and full Optimize require two consecutive clean passes; narrow fixes and approved
presentation migrations use the affected-path checks and report `fixed/verified`.
Every Redesign must satisfy full Optimize, including the correctness oracle,
alternative challenges, and two consecutive clean passes.

Report the mode/target, changes or findings, assumptions, actual checks and
viewport coverage, confidence, blockers, and remaining risks. Include challenge
and clean-pass evidence when applicable. Distinguish local verification from
deployment and pre-existing work from task changes. Commit, push, and deployment
require their own authorization.
