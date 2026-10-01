---
name: aigrounds-redesign-lesson
description: Redesign an existing AI Grounds lesson to match the approved shared learning-page design system. Use for older playgrounds, layout migrations, and requests to match the Mean and Range lessons; use the learning-page skill directly for new lessons or unrelated fixes.
---

# AI Grounds Lesson Redesign

Bring the selected existing lesson into the approved shared scheme while
preserving its identity, prerequisites, outcomes, and mathematical behavior.
The task is a lesson redesign, not a curriculum rewrite or permission to deploy.

## Resolve the Target and Workflow

Resolve the existing slug from the request, route, or conversation. If no lesson
can be identified, ask for the target before editing. A review or preview request
remains read-only; a request to implement a redesign permits the selected
lesson's migration.

Read the root `SPECS.md`, [DESIGN_SYSTEM.md](../../../DESIGN_SYSTEM.md), and
[the learning-page skill](../aigrounds-learning-page/SKILL.md). Follow that
skill's applicable Audit/Optimize lifecycle, preservation, design-approval,
artifact, and verification rules. Use this skill for the design-system migration
instructions; do not duplicate those broader workflows. The shared design
system takes precedence over older lesson mockups and older visual references.

Reuse established approval from the conversation. Do not ask the user to approve
unchanged shared colors, typography, or components again. For a materially new
layout or teaching interaction, use the learning-page skill's imagegen and
approval workflow before implementation. A preview alone never authorizes code
changes.

## Establish What the Lesson Must Retain

Inspect the rendered lesson and its module, engine, scenarios, metadata, and
Guide plan. Record its essential controls, observable outcomes, feedback,
completion rules, and supporting evidence before rearranging the page.

Separate obsolete presentation from instructional needs. Keep the original
engine and experiments when they satisfy the task; adapt their presentation
without silently dropping states, representations, or misconception recovery.
Route lesson splits, merges, and sequencing changes to the lesson-plan-review
skill instead of expanding this migration.

## Apply the Shared Scheme

Read the current implementation in
[src/components/learning-page/](../../../src/components/learning-page/), then
reuse `LearningPage`, `ExperimentProgress`, `LessonSummaries`, and
`GuideInvitation` where their roles apply. Use the shared CSS for shell,
typography, controls, and feedback. Leave only concept-specific visualization
and evidence arrangement in module CSS; avoid copying shared styles into the
module or introducing competing layout tokens.

- Keep the title inside the continuous white workbench and the exercise inside
  the lavender rail. Use the shared navigation, scenario buttons, Reset,
  numbered progress, summary columns, and spacing.
- Place the primary interaction's exact-value editor and keyboard help with
  its visualization. Adapt this role to the concept; do not invent data points
  or numeric editors for lessons whose interaction does not need them.
- Keep evidence that learners need to explain the result. Different concepts
  may use different graphs, controls, or construction views within the shared
  frame. Visual consistency does not require identical teaching content.
- Use `GuideInvitation` below the exercise as the Guide CTA. Remove redundant
  top Guide launchers. Preserve the existing assistant integration.
- Set `layout: "guided-discovery"` on the lesson definition in
  `src/lib/playground-metadata.ts`. Both the route and assistant shell consume
  this flag to avoid duplicate floating navigation or Guide controls. Do not
  add another slug-specific exception.
- Reconcile Guide instructions with the final visible control names, placement,
  and evidence. Compute graph geometry from the engine; never copy approximate
  positions from an imagegen mockup.

If a necessary control does not fit an existing shared primitive, extend the
shared system only as needed for this lesson. Preserve other users of that
primitive and smoke-test an unaffected lesson after shared changes.

## Verify and Deliver

Follow the learning-page skill's browser and repository checks. For this
migration, specifically verify the old lesson's scenarios, reset, input and
keyboard paths, feedback and completion rules, plus Guide opening/closing and
reflow. Check actual CSS viewport dimensions per tested tab; the in-app browser
viewport override may affect only the selected tab.

Compare the final rendered page with the current shared scheme at supported
widths. Confirm a single contextual Guide CTA, no duplicate navigation, no
horizontal overflow, and accessible equivalents for instructional charts.
Retain the below-768 desktop notice. Do not treat missing Guide backend
configuration as a layout defect or claim full guided verification when replies
are blocked.

Refresh the selected lesson's approved mockup, prompt, and manifest, recording
any approved refinements that differ from the raster reference. Keep transient
screenshots and run evidence outside the repository. Update README coverage when
the change warrants it.

Report what changed, the local route, checks, and any remaining verification
limits. Applying this design system alone does not establish a new optimum for
learning or authorize a commit, push, or deployment.
