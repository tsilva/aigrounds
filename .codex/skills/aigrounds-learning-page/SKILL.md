---
name: aigrounds-learning-page
description: Use when creating or updating one or more AI Grounds learning playgrounds/pages for concepts. The workflow must design the simplest memorable interactive teaching page in the existing AI Grounds design system, show imagegen mockups to the user, iterate until explicit acceptance, then implement and hook the accepted playgrounds into the app. Supports explicit parallel batches such as "parallelize with 3".
---

# AI Grounds Learning Page

Use this skill when the user gives a topic or concept to teach in AI Grounds.

If the user invokes this skill without naming a concept or task, assume the task
is the next planned playground-sized item on the home dashboard. Inspect
`src/lib/playground-metadata.ts`, choose the first slug in
`dashboardLessonPlanOrder` that appears in `upcomingPlaygrounds`, and proceed
without asking for a concept. The same default applies when the user asks for
the "next" page or "next task".

When a task is selected from the dashboard lesson plan, reserve that planned
lesson by noting its slug and title in the work summary before starting concept
design, image generation, or implementation. Do not edit the dashboard metadata
until the accepted design is ready to implement.

If the user asks to parallelize with a number `N`, treat that as explicit
permission to use subagents for this skill. Select the next `N` unchecked
planned playground-sized items from the dashboard lesson plan unless the user
names specific concepts. Reserve those `N` planned lessons before design work
begins.

## Hard Rules

- Do not implement before the user explicitly accepts a visual design.
- Always show the proposed page design using imagegen before editing app code.
- After the user accepts a visual design, persist the accepted mockup and prompt
  in the lesson module's design artifacts before implementing the module.
- Iterate the imagegen design with the user until they clearly accept it.
- Before showing any proposed design to the user, run a rigorous
  evaluate-redesign loop: generate a design, inspect it, name every material
  reference, teaching, numeric, visual, or interaction defect, then regenerate
  when any material defect remains. Continue until the latest design has no
  material issue worth fixing. Do not stop merely because a fixed number of
  passes has been reached.
- A design is not ready to show if any chart, timeline, formula, probability,
  metric, label, control range, or visible state is internally inconsistent or
  likely to teach the wrong idea.
- Keep the page as simple as possible while making the concept interactive and memorable.
- Match the existing AI Grounds design system; the canonical reference screenshot is `assets/cross-entropy-design-reference.png`.
- Before the first imagegen call, open and inspect the canonical reference screenshot. Do not rely on memory or the prose design system alone.
- Do not show a generated mockup if it violates the reference structure. Regenerate it first.
- In a parallel batch, do not dispatch implementation subagents until the user has explicitly accepted the final mockup for every lesson in the batch.

## Workflow

1. Understand the concept.
   - If using a default dashboard item, record the selected lesson number, slug,
     and exact title before any other work on the page begins.
   - Derive the
     implementation slug from that title using the repo's existing slug style
     (lowercase words joined by hyphens, preserving established abbreviations
     such as `iqr` when already used), unless the dashboard already provides a
     slug.
   - Identify the one core intuition the user should remember.
   - Choose the smallest interaction that makes that intuition visible.
   - Prefer direct manipulation: sliders, toggles, segmented controls, selectable examples, step/run controls, draggable values, or live visual state.

2. Design before implementation.
   - Open `assets/cross-entropy-design-reference.png` and extract concrete
     page invariants before writing the imagegen prompt.
   - Required invariants from the current reference:
     - No logo, no top-left brand mark, no global nav, no sidebar.
     - Top area has only a huge black page title at upper left, a short dark-blue subtitle underneath, and one pale outlined help button at upper right.
     - Content is a centered dense lesson page, not a landing page.
     - Lesson sections are numbered compact panels with pale blue borders.
     - Controls and formulas live inside those panels; avoid decorative chrome.
   - Use imagegen to create a high-fidelity mockup of the page.
   - Base the prompt on the design system below and the inspected reference screenshot. Include the required invariants explicitly in the prompt, especially the absence of logo/nav/site chrome.
   - After imagegen returns, visually compare the mockup to the reference before considering it for presentation. Check for:
     - unwanted logo/nav/sidebar/marketing hero elements,
     - missing numbered lesson panels,
     - nested decorative cards or ornamental backgrounds,
     - text that appears too cramped, clipped, or visually dominant,
     - a central interaction that does not visibly teach the chosen intuition.
   - Run an evaluate-redesign loop before showing any mockup to the user.
     Treat every generated mockup as a draft, then inspect it against all of
     these checks:
     - Reference fidelity: no logo/nav/sidebar/marketing hero, numbered compact
       lesson panels, pale borders, no nested decorative cards, no ornamental
       backgrounds.
     - Learning quality: the core intuition is visible in the main interaction
       within a few seconds and every widget has a clear teaching job.
     - Interaction coverage: each control updates at least two teaching
       surfaces, such as a chart plus formula, simulation plus metric, or state
       diagram plus narration.
     - Numeric and model consistency: formulas, parameters, chart labels,
       probabilities, simulated examples, timeline counts, control ranges, and
       takeaway statements agree with each other and with the concept's actual
       assumptions.
     - Visual correctness: no clipped text, malformed labels, duplicated axis
       ticks, overcrowded controls, hidden marks, chart overflow, or misleading
       visual encodings.
     - Simplicity: nothing decorative, redundant, confusing, or likely to
       distract from the concept.
   - During the loop, ask:
     - Would a user learn the topic thoroughly by manipulating this playground, rather than merely seeing a diagram?
     - Is the core intuition visible in the main interaction within a few seconds?
     - Does every widget, metric, control, panel, and visual element have a clear teaching job?
     - Are any important experiences missing, such as comparing cases, seeing failure modes, stepping through a process, changing assumptions, or connecting a formula to behavior?
     - Does each interaction update at least two teaching surfaces, such as a chart plus formula, simulation plus metric, or state diagram plus narration?
     - Is anything decorative, redundant, confusing, or likely to distract from the concept?
   - If the mockup fails any reference, learning, interaction, numeric/model, or
     visual-correctness check, generate another design pass with a stricter
     prompt that names exactly what to add, remove, simplify, or correct.
   - Continue evaluating and redesigning until the latest mockup has no material
     issue worth fixing. If a remaining tradeoff is unavoidable rather than a
     fixable defect, name the tradeoff when asking the user for approval.
   - Show only the best self-reviewed design to the user and ask whether to revise or approve it for implementation. Do not implement until the user explicitly approves.
   - If the user requests changes, generate an updated mockup before coding.

3. Persist the accepted design.
   - Immediately after explicit user approval, copy the accepted generated PNG
     into the module-owned artifact path:
     `src/modules/{slug}/design/accepted-mockup.png`.
   - Also create `src/modules/{slug}/design/imagegen-prompt.md` containing the
     final accepted imagegen prompt or a faithful reconstruction of it if the
     prompt was assembled across revision rounds.
   - Also create `src/modules/{slug}/design/design-manifest.json` with this
     shape, using stable deterministic fields:

     ```json
     {
       "lessonPlanStep": 10,
       "lessonPlanTitle": "Waiting & Arrival Distributions Lab",
       "slug": "waiting-arrival-distributions",
       "modulePath": "src/modules/waiting-arrival-distributions",
       "acceptedMockup": "src/modules/waiting-arrival-distributions/design/accepted-mockup.png",
       "prompt": "src/modules/waiting-arrival-distributions/design/imagegen-prompt.md",
       "sourceGeneratedImage": "/absolute/path/to/generated/image.png"
     }
     ```

   - The deterministic pairing is: dashboard lesson-plan step and title ->
     `design-manifest.json` -> module slug/path -> accepted screenshot and
     implementation. Do not store accepted lesson mockups only in
     `/Users/.../.codex/generated_images`, because that path is session-oriented
     and is not paired with the module.
   - If the lesson is not from the dashboard lesson plan, use `null` for
     `lessonPlanStep` and the chosen concept title for `lessonPlanTitle`, but
     still store the slug, module path, prompt, and accepted mockup in the module
     directory.

4. Implement after acceptance.
   - Add a self-contained module under `src/modules/{slug}/`.
   - Put pure concept logic in `{slug}-engine.ts` when there is meaningful algorithmic state.
   - Put scenario/example data in a separate scenario file when it helps readability.
   - Register the module in `src/lib/playgrounds.ts`.
   - Move the implemented lesson from `upcomingPlaygrounds` to
     `activePlaygroundMetadata`, keep its slug in `dashboardLessonPlanOrder`, and
     link the finished playground through the landing page so users can open it
     from `/`.
   - Use `presentation: "immersive"` when the page should own the full viewport like the cross entropy page.
   - Update `README.md` for significant new playgrounds.

5. Verify.
   - Run `pnpm build`.
   - Start or reuse `pnpm dev`.
   - Use the official Browser Use plugin for browser verification and screenshots.
   - Check the home page has a working link/card for the new playground.
   - Check desktop and mobile widths for text overflow, layout collisions, and broken interactions.
   - Exercise the primary interaction at low, middle, and high settings. Confirm it updates at least two teaching surfaces, such as a chart plus metrics or a formula plus narration.
   - Inspect browser screenshots for SVG/canvas overflow, clipped controls, cramped numeric pills, and visualizations escaping their plot bounds.
   - Check browser console errors before considering verification complete.

## Parallel Batch Workflow

Use this section only when the user explicitly asks to parallelize or gives a
batch size, for example "parallelize with 3".

1. Select the batch.
   - If no concepts are named, inspect `src/lib/playground-metadata.ts` and
     select the next `N` planned playground-sized items from the dashboard
     lesson plan.
   - Reserve all selected dashboard lessons immediately, before design, image
     generation, or implementation work begins.
   - Assign each lesson a stable label such as `Lesson 1: Variance` so the user
     can request targeted revisions.

2. Parallelize design.
   - Spawn exactly `N` design subagents, one per lesson.
   - Each design subagent must inspect `assets/cross-entropy-design-reference.png`,
     identify the core intuition, choose the smallest interaction, generate or
     request an imagegen mockup, self-check it against the reference invariants,
     run the evaluate-redesign loop until no material issue remains, and return
     the strongest design with a concise summary of why every major widget
     belongs.
   - Present all `N` accepted-by-agent mockups to the user together, grouped by
     lesson label.

3. Iterate per lesson.
   - When the user asks to tweak one lesson, route only that lesson back through
     design revision and imagegen.
   - Preserve the other accepted mockups unchanged.
   - Keep showing the current batch state until the user explicitly confirms the
     final design set.

4. Parallelize implementation after final confirmation.
   - Before dispatching implementation workers, persist the accepted design
     artifacts for every lesson using the normal design artifact convention:
     `src/modules/{slug}/design/accepted-mockup.png`,
     `imagegen-prompt.md`, and `design-manifest.json`.
   - Dispatch exactly `N` implementation subagents, one per accepted lesson.
   - Tell each worker it is not alone in the codebase, must not revert edits made
     by others, and must adapt to concurrent changes.
   - Give each worker disjoint ownership of its `src/modules/{slug}/` directory.
     Avoid assigning shared files such as `src/lib/playgrounds.ts`, the home
     page, or `README.md` to multiple workers unless ownership is explicitly
     divided.
   - Prefer having workers implement module files and return the registry/home
     metadata they need. The main agent should integrate shared files after the
     workers finish to avoid merge conflicts.

5. Verify the batch.
   - Run the normal verification workflow for every new playground.
   - Check `/` links to each lesson and each lesson works on desktop and mobile.
   - Exercise the primary interaction for each lesson at low, middle, and high
     settings before handing control back.

## Design System

The cross entropy page is the source of truth:

- Visual tone: bright, technical, playful, dense enough for learning, not a marketing page.
- Background: very light cool gray or white, with soft blue-lavender panel borders.
- Layout: stacked full-width lesson panels with tight vertical rhythm; no decorative nested cards.
- Panel style: white or near-white surfaces, 8-14px radius, 1px pale blue border, subtle cool shadow.
- Typography: oversized black page title, compact blue uppercase section titles, readable explanatory body copy, mono text for formulas, values, and targets.
- Color roles: electric blue/indigo for active controls and headings, red for predicted/error/probability emphasis, green/amber/red for quality or mood feedback, restrained neutral text.
- Controls: segmented cards/buttons for modes, sliders or direct controls for numeric state, small fact pills for current state, compact buttons with clear labels or icons.
- Teaching rhythm: start with a shape/mode choice, reveal the changing formula/model, provide a live simulator, then show a small memorable takeaway.
- Interaction feedback: every user action should visibly update at least two things, such as a chart plus numeric score, formula term plus narration, grid state plus policy.
- Copy: short, concrete, outcome-focused. Avoid generic feature descriptions and visible instructions about how the UI is built.

## Imagegen Prompt Pattern

Ask imagegen for one polished app screenshot, not an illustration:

```text
Design a high-fidelity AI Grounds interactive learning playground page for {concept}. It must match the visual system of the provided cross entropy reference: bright white/cool-gray background, electric indigo section titles and active controls, pale blue borders, compact lesson panels, mono numeric/formula details, dense but readable teaching UI. Create the simplest memorable interaction for the concept: {interaction}. Show a desktop app screenshot with stacked learning panels, live controls, a central visualization, numeric/formula feedback, and a concise takeaway. Avoid marketing hero layout, decorative orbs, nested cards, and long explanatory text.
```

When the concept needs a different interaction, replace `{interaction}` with the smallest concrete teaching mechanism.
