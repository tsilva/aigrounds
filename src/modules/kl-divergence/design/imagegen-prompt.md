Use case: ui-mockup
Asset type: AI Grounds lesson design refinement for a project-bound interactive playground

Primary request: Create a refined high-fidelity desktop app screenshot for an AI Grounds interactive learning playground page titled "KL Divergence Intuition Lab". Fix the previous draft issues: no typos, every lesson section is numbered, and the KL arithmetic uses precise rounded values.

Style reference requirements: match the existing AI Grounds cross-entropy reference. No logo, no brand mark, no global nav, no sidebar. Huge black page title at upper left. Short dark-blue subtitle underneath. One pale outlined help button at upper right reading "What is KL Divergence?". Bright white/cool-gray background. Centered dense lesson page, not a landing page. Stacked compact numbered lesson panels with pale blue borders, white/near-white surfaces, 8-14px radius, subtle cool shadows, electric indigo section titles and active controls, mono numeric/formula details. Avoid marketing hero layout, decorative orbs, decorative backgrounds, nested cards, and long explanatory text.

Concept: KL divergence D_KL(P || Q) measures the directional mismatch when a model distribution Q approximates a reference distribution P. The intuition: errors on buckets where P is large are expensive. Direction matters: D_KL(P || Q) is not D_KL(Q || P). KL is not a symmetric distance.

Smallest memorable interaction: learner chooses a reference distribution P scenario, then adjusts four sliders for approximation Q. The page shows paired P and Q bars for categories A-D, per-bucket contribution bars P_i log(P_i / Q_i), a live formula row, a total KL score, and a direction toggle comparing D_KL(P || Q) vs D_KL(Q || P).

Visible layout:
Top header: title "KL Divergence Intuition Lab"; subtitle "Compare a reference distribution with an approximation and see why direction matters."; help button at top right.
Panel 1 numbered "1. PICK THE REFERENCE SHAPE": three compact selectable tiles: Balanced P = [0.25, 0.25, 0.25, 0.25], Peaked P = [0.70, 0.15, 0.10, 0.05] selected, Rare event P = [0.88, 0.04, 0.04, 0.04]. A small current-shape summary grid with P values.
Panel 2 numbered "2. WATCH THE FORMULA SPLIT INTO BUCKETS": show formula D_KL(P || Q) = sum_i P_i log(P_i / Q_i). Show a compact table with columns bucket, P_i, Q_i, ratio, contribution, highlighting bucket A because P_A is large.
Panel 3 wide numbered "3. SEE THE WEIGHTED MISMATCH": central paired bar chart for A-D, blue bars for P and red/orange bars for Q. Beside it show contribution bars, with the largest positive contribution where Q undershoots high-probability bucket A. Include a concise takeaway strip: "Missing mass where P is high drives the score." Include a tiny note near negative contribution bars: "Offsets can be negative; total KL stays nonnegative."
Bottom row with three compact panels:
Panel 4 numbered "4. SET THE APPROXIMATION Q": sliders for Q_A, Q_B, Q_C, Q_D with values that sum to 1. Use Q = [0.45, 0.25, 0.20, 0.10]. Show total = 1.00 with a green check.
Panel 5 numbered "5. FLIP THE DIRECTION": segmented control with D_KL(P || Q) selected and D_KL(Q || P) available. Show two small numeric pills: D_KL(P || Q) = 0.1289 and D_KL(Q || P) = 0.1368 for the displayed distributions, and a short note "same bars, different weighting."
Panel 6 numbered "6. READ THE MISMATCH": large KL score 0.1289 nats, a low-to-high horizontal scale, and a calculation box: 0.70 log(0.70/0.45) + 0.15 log(0.15/0.25) + 0.10 log(0.10/0.20) + 0.05 log(0.05/0.10) = 0.1289.

Accuracy constraints: all visible numbers must be internally consistent for P = [0.70,0.15,0.10,0.05] and Q = [0.45,0.25,0.20,0.10]. Use natural log and units "nats". Per-bucket natural-log contributions should be approximately: A = 0.3095, B = -0.0766, C = -0.0693, D = -0.0347, total = 0.1289. Reverse direction D_KL(Q || P) should be approximately 0.1368. Do not show 0.160 or 0.1285. Ensure KL is directional and never described as distance.

Visual constraints: text must not overlap, no clipped labels, no malformed formulas, no duplicated axis ticks, no chart overflow. Keep dense and readable like a polished app screenshot.
