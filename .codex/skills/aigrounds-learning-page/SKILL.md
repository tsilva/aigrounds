---
name: aigrounds-learning-page
description: Use when creating or updating one or more AI Grounds learning playgrounds/pages for concepts. The workflow must design the simplest memorable interactive teaching page in the existing AI Grounds design system, show imagegen mockups to the user, iterate until explicit acceptance, then implement and hook the accepted playgrounds into the app. Supports explicit parallel batches such as "parallelize with 3".
---

# AI Grounds Learning Page

Use this skill when the user gives a topic or concept to teach in AI Grounds.

If the user invokes this skill without naming a concept or task, assume the task
is the next unchecked playground-sized item in `TODO.md`. Inspect `TODO.md`,
choose that item, and proceed without asking for a concept. The same default
applies when the user asks for the "next" page or "next task".

When a task is selected from `TODO.md`, immediately edit `TODO.md` to mark that
task as done before starting concept design, image generation, or implementation.

If the user asks to parallelize with a number `N`, treat that as explicit
permission to use subagents for this skill. Select the next `N` unchecked
playground-sized items in `TODO.md` unless the user names specific concepts.
Immediately mark those `N` TODO items done before design work begins.

## Hard Rules

- Do not implement before the user explicitly accepts a visual design.
- Always show the proposed page design using imagegen before editing app code.
- Iterate the imagegen design with the user until they clearly accept it.
- Before showing the first proposed design to the user, run a learning-quality
  self-review loop: generate an initial design, assess whether it is the best
  practical design for thoroughly teaching the topic through interaction, and
  revise it when important experiences are missing or any widget lacks a clear
  teaching purpose. Do at most three design passes before user approval.
- Keep the page as simple as possible while making the concept interactive and memorable.
- Match the existing AI Grounds design system; the canonical reference screenshot is `assets/cross-entropy-design-reference.png`.
- Before the first imagegen call, open and inspect the canonical reference screenshot. Do not rely on memory or the prose design system alone.
- Do not show a generated mockup if it violates the reference structure. Regenerate it first.
- In a parallel batch, do not dispatch implementation subagents until the user has explicitly accepted the final mockup for every lesson in the batch.

## Workflow

1. Understand the concept.
   - If using a default item from `TODO.md`, mark that item done before any
     other work on the page begins.
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
   - Run a learning-quality self-review before showing the mockup to the user.
     Treat the initial mockup as draft 1, then ask:
     - Would a user learn the topic thoroughly by manipulating this playground, rather than merely seeing a diagram?
     - Is the core intuition visible in the main interaction within a few seconds?
     - Does every widget, metric, control, panel, and visual element have a clear teaching job?
     - Are any important experiences missing, such as comparing cases, seeing failure modes, stepping through a process, changing assumptions, or connecting a formula to behavior?
     - Does each interaction update at least two teaching surfaces, such as a chart plus formula, simulation plus metric, or state diagram plus narration?
     - Is anything decorative, redundant, confusing, or likely to distract from the concept?
   - If the mockup fails the reference/style checks or the learning-quality review finds a meaningful gap, generate another design pass with a stricter prompt that names exactly what to add, remove, or simplify.
   - Repeat the self-review loop up to three total design passes. Stop early when the design is reference-compliant and no meaningful teaching gap remains. If three passes still leave tradeoffs, choose the strongest design and briefly note the unresolved tradeoff when asking for approval.
   - Show only the best self-reviewed design to the user and ask whether to revise or approve it for implementation. Do not implement until the user explicitly approves.
   - If the user requests changes, generate an updated mockup before coding.

3. Implement after acceptance.
   - Add a self-contained module under `src/modules/{slug}/`.
   - Put pure concept logic in `{slug}-engine.ts` when there is meaningful algorithmic state.
   - Put scenario/example data in a separate scenario file when it helps readability.
   - Register the module in `src/lib/playgrounds.ts`.
   - Link the finished playground into the landing page gallery/home page ordering so users can open it from `/`.
   - Use `presentation: "immersive"` when the page should own the full viewport like the cross entropy page.
   - Update `README.md` for significant new playgrounds.

4. Verify.
   - Run `npm run build`.
   - Start or reuse `npm run dev`.
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
   - If no concepts are named, inspect `TODO.md` and select the next `N`
     unchecked playground-sized items.
   - Mark all selected TODO items done immediately, before design, image
     generation, or implementation work begins.
   - Assign each lesson a stable label such as `Lesson 1: Variance` so the user
     can request targeted revisions.

2. Parallelize design.
   - Spawn exactly `N` design subagents, one per lesson.
   - Each design subagent must inspect `assets/cross-entropy-design-reference.png`,
     identify the core intuition, choose the smallest interaction, generate or
     request an imagegen mockup, self-check it against the reference invariants,
     run the learning-quality self-review loop for up to three design passes,
     and return the strongest design with a concise summary of why every major
     widget belongs.
   - Present all `N` accepted-by-agent mockups to the user together, grouped by
     lesson label.

3. Iterate per lesson.
   - When the user asks to tweak one lesson, route only that lesson back through
     design revision and imagegen.
   - Preserve the other accepted mockups unchanged.
   - Keep showing the current batch state until the user explicitly confirms the
     final design set.

4. Parallelize implementation after final confirmation.
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
