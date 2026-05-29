# Accepted Imagegen Prompt

Final refinement pass for an approval-ready AI Grounds desktop app mockup: "Tensor Shape & Broadcasting Lab". Keep the prior layout, but remove remaining instruction-like copy and tighten the teaching surfaces.

Reference fidelity: match the AI Grounds cross entropy page structure. No logo, no brand mark, no nav, no sidebar, no marketing hero, no decorative background. Huge black title top-left, short dark-blue subtitle "Pick two tensor shapes and see axes stretch or fail.", pale outlined help button top-right. Centered dense lesson page. Numbered compact panels with pale blue borders, subtle cool shadows, 8-14px radius, electric indigo headings and active controls, mono formulas and values.

Do not include visible UI text that tells the learner how to operate controls, such as "use buttons", "try it", or "vary B". Use state labels instead.

Consistent state:
A shape = [2, 3, 1]
B shape = [1, 3, 4]
Output shape = [2, 3, 4]
Total output elements = 24
Selected output index C[1,2,3]
Formula: C[1,2,3] = A[1,2,0] + B[0,2,3] = 6 + 23 = 29

Visible structure:
1. "Pick shapes" panel. A and B rows with editable axis chips, A [2,3,1], B [1,3,4]. Chips may have compact +/- affordances. Presets: stretches, same axes, fails. Verdict card: Broadcasts, output shape [2,3,4], 24 elements.
2. "Zip axes from the right" main panel. Three large columns: axis -3 leftmost, axis -2, axis -1 rightmost. Each column shows A axis size, B axis size, rule badge, output axis. axis -3: A=2, B=1, badge "B stretches 1 -> 2", output 2. axis -2: A=3, B=3, badge "same", output 3. axis -1: A=1, B=4, badge "A stretches 1 -> 4", output 4. Keep one compact rule strip: "same size OR one is 1; output = max(A, B)". Use a small legend only if it fits without crowding.
3. "Axis -3 outcomes" panel. This is a compact direct contrast, not an instruction panel. Show four state cards under fixed A axis -3 = 2: B=1 stretch ok output 2; B=2 same ok output 2; B=3 fail no output; B=4 fail no output. Add a small current-focus card: A=2, B=1, output=2. Do not include the phrase "vary" or operational guidance.
4. "Inspect one value" panel. Output index chips i=1, j=2, k=3. Formula card: C[1,2,3] = A[1,2,0] + B[0,2,3] = 6 + 23 = 29. Reused 0 indices blue, final 29 green. Add a tiny unobtrusive note only if needed: "blue 0 = reused size-1 axis".
5. "Takeaway" panel. Text: "Broadcasting reuses values along size-1 axes; it does not copy data first." Include a simple one-to-four stretch visual.

Quality constraints: fewer words than prior draft, no ambiguous tensor grids, no clipped text, no nested decorative cards, no inconsistent arithmetic, no fake formulas, no misleading shapes. Blue/indigo for active/stretch, green for same/pass/output, red for fail, neutral gray for inactive values. Crisp web app screenshot, not an illustration.
