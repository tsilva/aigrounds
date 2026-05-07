---
name: aigrounds-lesson-plan-review
description: Use when reviewing, optimizing, or reconciling the AI Grounds lesson roadmap in TODO.md, including checking implemented-vs-done status, adding implemented lessons missing from the roadmap, reordering lessons into the smoothest learning sequence, adding missing prerequisite lessons, breaking oversized lessons into smaller playground-sized steps, and aligning the home dashboard order with TODO.md.
---

# AI Grounds Lesson Plan Review

Use this skill to make `TODO.md` the canonical learning roadmap and keep the
home dashboard in the same lesson order.

## Source Files

- Roadmap: `TODO.md`
- Implemented lesson metadata: `src/lib/playground-metadata.ts`
- Implemented lesson registry: `src/lib/playgrounds.ts`
- Home ordering surface: `src/app/page.tsx`
- Home card renderer: `src/app/home-page.tsx`
- Lesson modules: `src/modules/*`
- Tutor plans, when present: `src/lib/tutor-plans.ts`

Treat `TODO.md` as the planning source of truth, but verify it against the app
before trusting checkbox state.

## Workflow

1. Inventory the app.
   - Read `TODO.md`, `src/lib/playground-metadata.ts`,
     `src/lib/playgrounds.ts`, and `src/app/page.tsx`.
   - Enumerate implemented lessons from `activePlaygroundMetadata`,
     `playgroundComponents`, and `src/modules/*/*Playground.tsx`.
   - A lesson counts as implemented only when it has reachable metadata, a
     registered component, and a module component. If one of those is missing,
     treat it as incomplete and do not check it off.
   - Use metadata titles as the canonical titles for implemented lessons.

2. Reconcile checkbox state.
   - If a `TODO.md` item is checked but the lesson is not implemented and
     reachable, uncheck it.
   - If a `TODO.md` item is unchecked but the lesson is implemented and
     reachable, check it.
   - If an implemented lesson is missing from `TODO.md`, add it as `[x]` in the
     best learning position with a short playground-sized description.
   - Preserve user roadmap intent when merging duplicates. Prefer one canonical
     item over repeated entries in separate sections.

3. Optimize the learning sequence.
   - Sort for prerequisite flow, not implementation chronology.
   - Prefer this broad progression unless repo context clearly argues otherwise:
     descriptive statistics, probability counting, conditional probability and
     Bayes, discrete distributions, continuous distributions, sampling,
     statistical inference, relationships and regression, evaluation and
     generalization, feature scaling and distance, vector geometry and
     retrieval, loss functions, optimization, regularization, unsupervised
     learning, neural networks, attention and transformers.
   - Keep adjacent lessons connected by one clear dependency. Avoid introducing
     terms such as likelihood, calibration, residuals, gradients, embeddings, or
     attention before a prior lesson gives the needed intuition.
   - Interleave already implemented advanced lessons into their correct learning
     location; do not leave them in a separate "ideas" section if the roadmap is
     meant to be a single learner sequence.

4. Fill learning gaps.
   - Scan each transition and ask: "What would a learner need to know before
     this lesson makes sense?"
   - Add missing prerequisite lessons when a concept appears without support.
   - Split any lesson that tries to teach multiple primary intuitions or would
     need multiple unrelated interactions. Each item should remain one
     playground-sized chunk: one core intuition, one primary visual interaction,
     and a focused set of concepts.
   - Keep new items concise and actionable: title, unchecked checkbox, and one
     short description of what the playground teaches and how it teaches it.

5. Update the dashboard order.
   - Ensure the home dashboard appears in the same top-to-bottom order as the
     canonical `TODO.md` roadmap.
   - Reorder `activePlaygroundMetadata` to match the order of checked,
     implemented lessons in `TODO.md`.
   - Reorder or populate `upcomingPlaygrounds` for unchecked lessons that should
     appear as coming soon cards.
   - If `TODO.md` intentionally interleaves live and coming-soon lessons, update
     `src/app/page.tsx` or the metadata model so the dashboard can render that
     unified order instead of forcing all live cards before all upcoming cards.
   - Keep `src/app/home-page.tsx` unchanged unless the rendering component itself
     must change; the ordering should usually come from metadata and page
     assembly.

6. Verify.
   - Run `pnpm lint` and `pnpm build` after code changes.
   - Start or reuse `pnpm dev` if dashboard code changed.
   - Use the official OpenAI Browser Use plugin to inspect `/` and confirm the
     visible card order matches `TODO.md`.
   - Report any skipped verification command and why it was skipped.

## Ordering Heuristics

- Earlier lessons should reduce cognitive load for later lessons.
- Do not mark a lesson done because related concepts appear inside another
  lesson. Mark it done only if the promised standalone playground exists.
- Avoid broad catch-all lessons. For example, split a lesson if it combines
  distribution mechanics, sampling behavior, and inference decisions.
- Add bridge lessons when a later module depends on vocabulary that is not yet
  taught directly.
- Keep titles stable when they match implemented metadata; changing a title
  should be intentional and reflected in metadata, TODO, and dashboard cards.

## Final Response

Summarize:

- checkbox corrections,
- lessons added or split,
- ordering changes,
- dashboard files changed,
- verification performed.

If the review finds a significant lesson-plan judgment call, state the chosen
assumption briefly instead of leaving the roadmap ambiguous.
