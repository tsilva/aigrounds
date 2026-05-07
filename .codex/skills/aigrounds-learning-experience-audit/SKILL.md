---
name: aigrounds-learning-experience-audit
description: Use when reviewing and improving an existing AI Grounds learning playground from a beginner learner perspective, especially when the user asks to play through a playground, use the AI Guide, find learning or UX flaws, implement improvements, and loop until the learning experience is excellent. Applies to AI Grounds playground UI, tutor plans, assistant behavior, responsive layout, copy, interactions, and validation.
---

# AI Grounds Learning Experience Audit

Use this skill to behave like a first-time learner, not a code reviewer first.
The goal is to improve the actual learning loop: guide prompt -> learner action
-> visible playground feedback -> explanation -> next experiment.

## Inputs

- Target route or concept, such as `/playgrounds/mean-median-mode`.
- If the route is unclear, identify the closest playground from
  `src/lib/playground-metadata.ts` and `src/lib/playgrounds.ts`.

## Hard Rules

- Use the official Browser Use plugin for browser testing.
- Start or reuse `pnpm dev` and test the real rendered app.
- Do not stop after one fix. Repeat playtest -> flaw list -> improvement list
  -> implementation -> verification until no material beginner-learning flaw
  remains.
- Treat AI Guide and playground UI as one teaching system. A good page can still
  fail if the guide asks for actions that do not match the visible state.
- Preserve unrelated user changes. Inspect `git status --short` before edits.

## Beginner Persona

Play as someone with no topic knowledge:

- Read visible text literally.
- Follow only instructions the guide or page gives.
- Prefer obvious controls over inferred implementation details.
- If a term appears before it is explained, count that as friction.
- If the UI says to watch a surface, verify that surface is visible, readable,
  and changes after the action.

## Review Loop

1. Prepare.
   - Inspect the target module, scenario, engine, metadata, tutor plan, and
     assistant shell when relevant.
   - Start or reuse `pnpm dev`.
   - Open the target route in Browser Use.
   - Record the initial visible state, console warnings/errors, and viewport.

2. Play through as a beginner.
   - Open the AI Guide.
   - Answer predictions with plausible novice language.
   - Perform the exact controls the guide requests.
   - After each action, inspect DOM and screenshot evidence.
   - Continue through the full guided path, including final mastery or summary.
   - Also test direct UI interaction without the guide when that exposes the
     same concept.

3. Identify flaws.
   - List concrete flaws, not vague preferences.
   - Include reproduction evidence: visible text, state mismatch, broken action,
     confusing copy, hidden surface, stale screenshot, layout blockage, clipped
     text, or missing feedback.
   - Prioritize flaws that can cause wrong learning, failed action, or learner
     uncertainty.

4. Suggest improvements.
   - For each flaw, propose the smallest app change that removes it.
   - Prefer aligning existing copy, state, tutor plan, layout, and controls over
     redesigning the page.
   - Do not introduce a new abstraction unless multiple playgrounds need the
     same fix.

5. Implement.
   - Patch only the files needed for the identified flaws.
   - Common files:
     - Module UI: `src/modules/{slug}/*Playground.tsx`
     - Module logic: `src/modules/{slug}/*-engine.ts`
     - Scenarios: `src/modules/{slug}/scenario.ts`
     - Tutor flow: `src/lib/tutor-plans.ts`
     - Assistant behavior: `src/app/api/chat/route.ts`
     - Assistant shell/layout: `src/components/playground-assistant-shell.tsx`
   - Keep copy short, concrete, and beginner-readable.

6. Verify.
   - Run `pnpm lint`, `pnpm check:cycles`, and `pnpm build`.
   - If `pnpm build` fails only because Next.js cannot fetch Google fonts in the
     sandbox, rerun with approved network access.
   - Reload the target route in Browser Use.
   - Retest the exact failed actions and at least one full representative guide
     path.
   - Check console errors/warnings.
   - Test the current in-app browser width plus a narrow/mobile layout when the
     assistant or controls can affect layout.

7. Loop.
   - Start another browser pass after verification.
   - Ask: "If I knew nothing, what still blocks or misleads me?"
   - Continue only while there is a material flaw with a practical fix.
   - Stop when the guide, visible state, controls, feedback, and summary form a
     coherent beginner learning path.

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

- loops completed,
- flaws found and fixed,
- files changed,
- commands run,
- browser verification evidence,
- any remaining risk or reason for stopping.

Keep the final concise, but include enough detail for a reviewer to understand
why the learning path is now clean.
