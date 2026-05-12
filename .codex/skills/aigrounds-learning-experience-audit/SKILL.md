---
name: aigrounds-learning-experience-audit
description: Use when auditing an existing AI Grounds lesson from a beginner learner perspective, especially when the user asks to play through a playground, use the AI Guide, follow its instructions, and enumerate learning or UX problems without fixing them. Applies to AI Grounds playground UI, tutor plans, assistant behavior, responsive layout, copy, interactions, and validation.
---

# AI Grounds Learning Experience Audit

Use this skill to behave like a first-time learner, not a code reviewer first.
The goal is to verify whether a learner who knows nothing about the topic can
learn it by following the AI Guide, interacting with the playground exactly as
instructed, and observing the resulting feedback.

## Inputs

- Target route or concept, such as `/playgrounds/mean-median-mode`.
- If the route is unclear, identify the closest playground from
  `src/lib/playground-metadata.ts` and `src/lib/playgrounds.ts`.

## Hard Rules

- Use the official Browser Use plugin for browser testing.
- Start or reuse `pnpm dev` and test the real rendered app.
- Do not fix issues during an audit. The deliverable is a complete,
  evidence-backed problem list.
- Treat AI Guide and playground UI as one teaching system. A good page can still
  fail if the guide asks for actions that do not match the visible state.
- Preserve unrelated user changes. Inspect `git status --short` before browser
  or code inspection so local context is understood.
- Do not judge from code alone. Use the rendered app and the AI Guide flow.

## Beginner Persona

Play as someone with no topic knowledge:

- Read visible text literally.
- Follow only instructions the guide or page gives.
- Prefer obvious controls over inferred implementation details.
- If a term appears before it is explained, count that as friction.
- If the UI says to watch a surface, verify that surface is visible, readable,
  and changes after the action.
- Do not use code knowledge to infer what the learner "should" understand.

## Audit Workflow

1. Prepare.
   - Inspect the target module, scenario, engine, metadata, tutor plan, and
     assistant shell when relevant.
   - Start or reuse `pnpm dev`.
   - Open the target route in Browser Use.
   - Record the initial visible state, console warnings/errors, and viewport.

2. Play through with the AI Guide.
   - Open the AI Guide.
   - Answer predictions with plausible novice language.
   - Perform the exact controls the guide requests.
   - After each action, inspect DOM and screenshot evidence.
   - Continue until the guide reaches a final mastery check, summary, or stops
     providing useful next steps.
   - Track whether each guide instruction can be completed using visible UI
     labels and current page state.
   - Note whether the learner could explain the topic at the end using only
     what the guide and playground taught.

3. Identify flaws.
   - List concrete flaws, not vague preferences.
   - Include reproduction evidence: visible text, state mismatch, broken action,
     confusing copy, hidden surface, stale screenshot, layout blockage, clipped
     text, or missing feedback.
   - Prioritize flaws that can cause wrong learning, failed action, or learner
     uncertainty.
   - If useful, mention the smallest likely area to investigate, but do not
     patch files or run implementation verification.

4. Sanity-check the audit.
   - Replay any uncertain guide step before reporting it as a flaw.
   - Check console errors/warnings.
   - Test a narrow/mobile layout when the assistant or controls can affect
     whether the learner can follow the guide.
   - Stop after the audit has enough evidence to enumerate all material
     beginner-learning problems found in the pass.

## Flaw Checklist

- Initial state matches the first guide question.
- Guide instructions name controls that are visible and uniquely identifiable.
- Page helper text changes with the selected experiment.
- Every learner action visibly updates at least two teaching surfaces.
- Numeric formulas, markers, pills, and narration agree.
- The guide does not use stale screenshots before the learner performs a new
  action.
- The assistant panel does not block the controls it asks learners to use.
- Sorted values, formulas, and long labels wrap or fit at tested widths.
- Direct manipulation does not move values unexpectedly on click.
- Final summary checks mastery instead of ending after vague answers.

## Final Response

Report:

- route or lesson audited,
- browser and viewport coverage,
- AI Guide path coverage,
- enumerated problems found, ordered by severity,
- reproduction evidence for each problem,
- commands run,
- any audit limits or remaining risk.

Do not claim the lesson is fixed. Keep the final concise, but include enough
detail for a reviewer to understand exactly where the beginner learning path
breaks down.
