export const guidedPresetId = "two-by-two-times-two-by-three";

export const matrixExperiments = [
  {
    title: "Check the shapes",
    question: "For a 2 × 2 matrix times a 2 × 3 matrix, what shape will C have?",
    predictions: [
      { id: "correct", label: "2 × 3" },
      { id: "square", label: "2 × 2" },
      { id: "blocked", label: "Multiplication is blocked" },
    ],
    action: "Choose 2x2 x 2x3. Compare the matching inner sizes and the output shape. Then read the incompatible example below the formulas.",
    explanationQuestion: "Why does the product have 2 rows and 3 columns?",
    explanations: [
      { id: "square", label: "The output keeps both dimensions of A." },
      { id: "correct", label: "A's columns match B's rows; the output keeps A's rows and B's columns." },
      { id: "outer", label: "Only the outer sizes need to match." },
    ],
    recovery: "Read shape as rows × columns. Which two sizes must match so a row and column have the same number of entries?",
    takeaway: "(m × n) times (n × p) produces m × p. The shared n is the number of products added for each output cell.",
  },
  {
    title: "Build one cell",
    question: "Which values build C[1,2]: a row with a column, two rows, or two columns?",
    predictions: [
      { id: "rows", label: "Two rows" },
      { id: "columns", label: "Two columns" },
      { id: "correct", label: "Row 1 of A and column 2 of B" },
    ],
    action: "Use 2x2 x 2x3. Select C[1,2] in C, then select k = 1 and k = 2 in Build C[1,2]. Watch the running sum.",
    explanationQuestion: "Why does C[1,2] equal −6?",
    explanations: [
      { id: "correct", label: "Multiply matching pairs from row 1 of A and column 2 of B, then add." },
      { id: "elementwise", label: "Multiply values at the same row and column in A and B." },
      { id: "add", label: "Add the row and column values without multiplying." },
    ],
    recovery: "Trace 3 × 0 and (−2) × 3. The first product is zero; adding the second gives −6. k pairs the same position in the row and column.",
    takeaway: "A dot product multiplies each matching pair, then adds the products. Negative and zero terms follow the same rule.",
  },
  {
    title: "Repeat across C",
    question: "When you move from C[1,2] to C[2,1], what should change?",
    predictions: [
      { id: "size", label: "The output shape" },
      { id: "correct", label: "The row and column used, but not the rule" },
      { id: "rule", label: "The multiplication rule" },
    ],
    action: "Use 2x2 x 2x3. Select the formula for C[1,2], then the formula for C[2,1] under Every output cell follows the same rule. Compare the row and column labels above.",
    explanationQuestion: "What stays the same across the two output cells?",
    explanations: [
      { id: "values", label: "Every output cell has the same value." },
      { id: "row", label: "Every output cell uses row 1 of A." },
      { id: "correct", label: "Each cell uses one A row and one B column, with two matching products added." },
    ],
    recovery: "Compare the formulas and the selected row/column labels. C[1,2] uses row 1 and column 2; C[2,1] uses row 2 and column 1. Both use two products.",
    takeaway: "Every output cell repeats the row-column rule. Changing i or j changes the chosen row or column; the shared size still sets the term count.",
  },
] as const;
