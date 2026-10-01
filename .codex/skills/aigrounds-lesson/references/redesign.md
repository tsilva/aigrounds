# Existing Lesson Redesign

Redesign revamps the entire teaching experience, not merely its presentation.
Audit the engine, scenarios, representations, terminology, instructions, feedback,
mastery checks, and AI Guide against [correctness](correctness.md). Fix every
identified conceptual error, including misleading simplifications and incorrect
visual mappings. Preserve the lesson identity and scope; preserving obsolete
behavior must never prevent a correctness repair or a better learning journey.

Record the rendered baseline and a revised teaching contract. Reformulate the
lesson so a learner with only its prerequisites can discover the concepts with
the fewest clear actions and least unnecessary friction. Reorder, replace, or
remove existing controls, experiments, copy, and representations when they impede
understanding. Retain useful evidence and misconception recovery; do not retain
surface complexity solely because it already exists.

Read [optimization](optimization.md), run its pedagogy/mechanism and
deletion-first/accessibility challenges, and prefer the strongest causal learning
journey over cosmetic variations. Correctness and accessibility are hard gates;
agent reviews establish a candidate, not universally optimal teaching.

Read [DESIGN_SYSTEM.md](../../../../DESIGN_SYSTEM.md) and
[the shared components](../../../../src/components/learning-page/).

1. Reuse the shared frame, progress, summaries, controls, and Guide invitation.
   Keep concept-specific evidence in module CSS; change shared tokens centrally.
2. Adapt the anatomy to the revised concept journey. Explain unfamiliar terms
   on first use, keep actions atomic, and derive mathematical geometry from the
   engine. Keep every surface tied to an outcome or clearly optional.
3. Set `layout: "guided-discovery"` in lesson metadata. Keep one contextual
   Guide CTA below the exercise using the existing assistant integration.
4. Reconcile metadata and Guide copy with the revised outcomes, exact visible
   labels, actions, and evidence. Distinguish computational stages from optimizer
   actions when the distinction matters to conceptual correctness.

For material interaction/layout changes, use
[creation and design](creation-and-design.md). Reuse prior approval of the shared
scheme and explicit refinements; follow the applicable design approval gate.
Refresh design artifacts after approval and update README coverage when warranted.

Use the full [verification](verification.md) protocol, including two consecutive
clean passes, mastery and transfer evidence, incorrect-answer recovery, Guide
preflight, reset, keyboard operation, and supported-width reflow. A blocked Guide
preflight blocks clean-pass certification; report partial verification candidly.
