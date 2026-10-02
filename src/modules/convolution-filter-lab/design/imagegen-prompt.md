Use case: ui-mockup
Create a polished high fidelity desktop webpage design mockup for AI Grounds "Convolution Filter Lab". Full single lesson page, 1440px wide screenshot feel, approx 1000px tall. Precise readable typography and understated educational workbench. White continuous workbench approximately 69% width on left, pale lavender #f6f5ff experiment rail 31% on right, fine divider #dfe4f4. Navy #0c1230 text, muted #536487, indigo #5031dc controls. Space Grotesk typography, IBM Plex Mono for matrix values and formula. No shadows, no outer cards, only fine horizontal dividers. No AI Guide in nav.
64px nav: "AI Grounds" | "← All lessons".
Workbench inside 32px padding: eyebrow "GUIDED DISCOVERY", heading 40px "Convolution Filter Lab", subtitle "Slide a small grid of weights. Trace how one patch becomes one output."
Scenario toolbar: three two-line buttons "Ramp" / "Steady change" selected indigo, "Step edge" / "Sudden jump", "Single spot" / "Local contrast"; right small outlined "Reset".
Below toolbar a compact line of controls: "Filter" [Edge selected] [Blur] [Sharpen], "Stride" selector "1", "Zero padding" selector "1". Help line "Stride is the pixel step. Padding adds zero-valued border cells." No extra kernel table above the data.
Main visualization heading "Your image → output", caption "Choose an output cell to inspect its 3 × 3 image window."
Two numeric matrix diagrams beside one another:
LEFT "Image + zero padding · 7 × 7" matrix:
0 0 0 0 0 0 0
0 1 2 3 4 5 0
0 1 2 3 4 5 0
0 1 2 3 4 5 0
0 1 2 3 4 5 0
0 1 2 3 4 5 0
0 0 0 0 0 0 0
Use light gray zero border, indigo rectangle around 3x3 patch at zero-based rows1 through3 columns1 through3: three rows "1 2 3". All values and edges clearly visible.
Thin arrow between matrices indicates the correspondence.
RIGHT "Output · 5 × 5" matrix:
4 4 4 4 -8
6 6 6 6 -12
6 6 6 6 -12
6 6 6 6 -12
4 4 4 4 -8
Selected cell at zero-based row1 col1 =6, indigo outline. All other cells visible as complete computed map, NOT visited or completed states. Caption "Full map; selected cell y[1,1]".
Below these diagrams: "Selected output" [row 1] [column 1] with small arrow movement buttons; helper "Click a cell or use arrow keys to move the window." Row and column fields are exact editors.
Horizontal divider.
Heading "Build one output cell", caption "Multiply matching positions, then add all nine products."
Three small aligned matrices:
"Image patch": 1 2 3 / 1 2 3 / 1 2 3
"×" small between
"Kernel weights": -1 0 1 / -1 0 1 / -1 0 1
"=" small between
"Products": -1 0 3 / -1 0 3 / -1 0 3
Signed values explicit so meaning never requires color alone. Neutral zeroes, dark orange negative products, indigo positive products. This is ELEMENTWISE multiplication not matrix multiplication.
Slim formula under matrices "y[1,1] = (−1 + 0 + 3) × 3 = 6".
Three open summary columns at bottom separated by thin vertical rules:
"Selected sum" value "6", description "Nine products added." small formula "Σ patch × weight"
"Output size" value "5 × 5", description "One cell per sampled window." small formula "floor((5 + 2p − 3) / s) + 1"
"Window step" value "1 px", description "Weights stay fixed as the patch moves."
Small footer text "CNN convention: weights are used as shown, without flipping (cross-correlation). One input channel, no bias."
EXPERIMENT RAIL padding32px top28px sides:
eyebrow "EXPERIMENT 1 OF 5"
heading "One patch, one number"
numbered progress "1 Predict → 2 Try → 3 Explain" with Predict active.
divider
h3 "Make a prediction"
question "Switch to Blur. What will y[1,1] become?"
Three accessible radio choices, none selected: "2", "6", "18".
Small muted "Choose a prediction to begin."
Action instruction lower on rail "Then select Blur and compare the nine products." Don't expose the answer in explanatory copy.
divider below exercise.
"Talk it through"
"Ask the AI Guide about your prediction or what changed."
Outlined button "Ask the AI Guide →".
CONSTRAINTS: only one Guide launcher in rail, no duplicate panels or kernel tables, no rounded large card shells. Show three-row patch exactly and selected output sum6 consistently. All matrix geometry and readable mathematical values intentional; do not add extra rows or cells. Favor an uncluttered visually balanced workbench with generous but efficient spacing.
