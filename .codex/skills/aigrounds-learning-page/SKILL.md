---
name: aigrounds-learning-page
description: Use when creating or updating an AI Grounds learning playground/page for a concept. The workflow must design the simplest memorable interactive teaching page in the existing AI Grounds design system, show an imagegen mockup to the user, iterate until explicit acceptance, then implement and hook it into the app.
---

# AI Grounds Learning Page

Use this skill when the user gives a topic or concept to teach in AI Grounds.

If the user invokes this skill without naming a concept or task, assume the task
is the next unchecked playground-sized item in `TODO.md`. Inspect `TODO.md`,
choose that item, and proceed without asking for a concept. The same default
applies when the user asks for the "next" page or "next task".

When a task is selected from `TODO.md`, immediately edit `TODO.md` to mark that
task as done before starting concept design, image generation, or implementation.

## Hard Rules

- Do not implement before the user explicitly accepts a visual design.
- Always show the proposed page design using imagegen before editing app code.
- Iterate the imagegen design with the user until they clearly accept it.
- Keep the page as simple as possible while making the concept interactive and memorable.
- Match the existing AI Grounds design system; the canonical reference screenshot is `assets/cross-entropy-design-reference.png`.
- Before the first imagegen call, open and inspect the canonical reference screenshot. Do not rely on memory or the prose design system alone.
- Do not show a generated mockup if it violates the reference structure. Regenerate it first.

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
   - After imagegen returns, visually compare the mockup to the reference before presenting it. Check for:
     - unwanted logo/nav/sidebar/marketing hero elements,
     - missing numbered lesson panels,
     - nested decorative cards or ornamental backgrounds,
     - text that appears too cramped, clipped, or visually dominant,
     - a central interaction that does not visibly teach the chosen intuition.
   - If the mockup fails any of those checks, regenerate with stricter negative instructions before showing it to the user.
   - Show the generated design to the user and ask whether to revise or implement.
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
