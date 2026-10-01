---
name: aigrounds-curriculum
description: Review or update the AI Grounds curriculum, including dashboard lesson order, live/planned status, missing prerequisites, and lesson splits or merges. Use aigrounds-lesson for work inside one playground and its AI Guide.
---

# AI Grounds Curriculum

Maintain the home dashboard as the canonical sequence of published and planned
lessons. Follow root [AGENTS.md](../../../AGENTS.md) for specifications,
repository checks and browser/server policy.

## Resolve Scope

A review, audit, plan, suggestion, or bare invocation is read-only. Report
findings and proposed changes without editing the repository. A request to
apply, reconcile, reorder, fill gaps, or implement permits the specified changes;
an audit-and-apply request is a write workflow. Preserve conversational approval.

Keep existing stakeholder curriculum intent authoritative. State assumptions
behind significant sequencing judgments; clarify conflicts with approved intent
before dependent changes. Route lesson implementation to
[$aigrounds-lesson](../aigrounds-lesson/SKILL.md) only when authorized. Adding a
planned prerequisite card does not itself authorize building a live playground.

## Inventory and Reconcile

Capture Git status, relevant dirty-file contents/diffs, and an inventory with
hashes of pre-existing non-ignored untracked files. Preserve user-owned work;
merge separable changes and pause on inseparable ownership conflicts. Read:

- `src/lib/playground-metadata.ts`: `activePlaygroundMetadata`,
  `upcomingPlaygrounds`, and `dashboardLessonPlanOrder`;
- `src/lib/playgrounds.ts`: component registry;
- `src/app/page.tsx` and `src/app/home-page.tsx`: dashboard assembly/rendering;
- `src/modules/*` and relevant `src/lib/tutor-plans.ts` entries.

Verify metadata against the rendered app. A lesson is implemented only when it
has reachable metadata, a registered component, and a module component. Related
content in another lesson does not fulfill a promised standalone playground.
Use implemented metadata titles as canonical; rename intentionally and update
both metadata and cards.

For each discrepancy, propose or apply the authorized correction: move incomplete
entries to planned state or complete authorized wiring; promote reachable planned
lessons to active state; add missing order entries; and merge duplicate cards
while retaining stakeholder intent. Every displayed slug must appear once in the
unified order, with correct active/planned membership.

## Sequence and Fill Gaps

Order for prerequisite flow. Each transition should introduce vocabulary and
intuition needed by the next lesson. Interleave advanced implemented lessons in
their learning position rather than grouping them by implementation chronology.

Use this progression as a heuristic, subject to stakeholder intent and actual
dependencies: descriptive statistics; counting/probability; conditional
probability/Bayes; discrete and continuous distributions; sampling/inference;
relationships/regression; evaluation/generalization; scaling/distance;
vectors/retrieval; losses/optimization/regularization; unsupervised learning;
neural networks; attention/transformers.

Add bridge lessons when prerequisite intuition or vocabulary is missing. Split
lessons with multiple unrelated primary interactions or intuitions into focused
playground-sized steps. For planned additions, record slug, title, tag, concepts,
and a short summary of what the interaction teaches. Preserve approved lesson
identity and scope during splits/merges.

Make ordering changes in metadata and page assembly. Change the card renderer
only when rendering behavior needs to change.

## Verify and Report

For an audit, verify that tracked and non-ignored untracked contents/status
still match the baseline; keep transient evidence outside the repository.
After changes, run repository gates and inspect the rendered dashboard with the
configured browser. Confirm visible order matches `dashboardLessonPlanOrder`,
published/planned states are distinguishable, and every published card opens
its route. Report skipped or blocked checks with their reasons.

Summarize status corrections, additions/splits/merges, sequencing assumptions,
changed files, and verification. Distinguish proposals from applied changes and
local verification from deployment. Commit, push, and deployment need separate
authorization.
