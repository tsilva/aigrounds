# Matrix Multiplication Lab Accepted Mockup Prompt

Refined high-fidelity AI Grounds lesson page mockup for an interactive playground titled "Matrix Multiplication Lab". Match AI Grounds reference style exactly: no logo, no top-left brand mark, no global nav, no sidebar, no marketing hero. White/light gray background. Top area only: huge black page title upper left, short dark-blue subtitle underneath, one pale outlined help button at upper right labeled "What is Matmul?". Centered dense lesson page. Numbered compact panels with pale blue borders and subtle radius. No decorative chrome, no nested decorative cards, no ornamental backgrounds.

Improve these details compared with the prior draft: make the active k step visually unmistakable, make the selected C cell explicitly say "row 1 dot column 2", keep invalid shape as a compact secondary warning instead of a dominant red block, and make the dimension rule teach that the shared inner dimension is the number of multiply-add terms.

Concept: matrix multiplication. Core intuition: every output cell C[i,j] is the dot product of row i from A and column j from B; dimensions must match: A is m x n, B is n x p, C is m x p.

Desktop layout, dense and professional:

Panel 1: "1. SET THE SHAPES". Left: segmented controls "2x3 x 3x2" selected, "2x2 x 2x3", "3x2 x 2x1". Middle: shape strip with A shape "2 x 3", B shape "3 x 2", shared inner dimension "3 = 3", output C shape "2 x 2". Use a subtle green check saying "compatible: three multiply-adds per output cell". Right: small secondary invalid example chip "2x3 x 2x2" with restrained red outline and text "blocked: inner sizes 3 and 2 differ".

Panel 2: "2. PICK ONE OUTPUT CELL". Main visual with three matrices A, B, C in a single row. A is 2x3 with values [[2, -1, 3], [0, 4, 1]]. B is 3x2 with values [[1, 5], [2, -2], [0, 3]]. C is 2x2 with correct values [[0, 21], [8, -5]]. Selected output cell C[1,2] highlighted green and labeled "C[1,2]". Highlight row 1 of A horizontally in blue and column 2 of B vertically in amber. Show precise thin guide lines from row 1 and column 2 to selected C cell. Add a concise caption in the panel footer: "C[1,2] = row 1 of A dot column 2 of B".

Panel 3: "3. WATCH THE DOT PRODUCT". Stepper for k=1, k=2, k=3 with k=2 active in this snapshot. Show active term emphasized: "-1 x -2 = 2". Other terms visible but quieter: "2 x 5 = 10" and "3 x 3 = 9". Running sum timeline: "10 -> 12 -> 21" with current sum 12 highlighted and final 21 visible. Formula line: "C[1,2] = 2x5 + (-1)x(-2) + 3x3 = 21". Small annotation: "k walks across the row and down the column together."

Panel 4: "4. SEE THE FULL PRODUCT". Output matrix C as a compact 2x2 heatmap: C[1,1]=0 neutral, C[1,2]=21 green, C[2,1]=8 green, C[2,2]=-5 red. Beside it, four compact formula chips, all correct: "C[1,1]: 2x1 + (-1)x2 + 3x0 = 0", "C[1,2]: 2x5 + (-1)x(-2) + 3x3 = 21", "C[2,1]: 0x1 + 4x2 + 1x0 = 8", "C[2,2]: 0x5 + 4x(-2) + 1x3 = -5". Add statement: "Four output cells means four row-column dot products."

Panel 5: "5. THE RULE". Formula block: "(AB)_{ij} = sum_{k=1}^{n} A_{ik} B_{kj}". Dimension rule strip: "(m x n) x (n x p) -> (m x p)" with the two n values visually linked and labeled "shared n: number of terms". Green takeaway: "Rows choose i. Columns choose j. The shared dimension tells how many products get added."

Visual constraints: readable real text, no clipped labels, no malformed math, no duplicated axis ticks, no crowded controls. Palette: mostly white, black/dark navy text, pale blue borders, blue row highlight, amber column highlight, green selected output, restrained red for invalid/negative only. Avoid purple-heavy palette. Keep all UI elements inside panels and aligned. Use professional dense lesson styling, not a landing page.
