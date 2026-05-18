export type FormulaId = "polynomial" | "sigmoid" | "squared-error";

export type ParameterKey = "a" | "b" | "x" | "w" | "m" | "c";

export type FormulaParameter = {
  key: ParameterKey;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export type FormulaDefinition = {
  id: FormulaId;
  label: string;
  shortLabel: string;
  description: string;
  expression: string;
  parameters: FormulaParameter[];
  constants?: Record<string, number>;
};

export type GraphNode = {
  id: string;
  label: string;
  subLabel: string;
  value: number;
  x: number;
  y: number;
  tone: "input" | "operation" | "output" | "constant";
};

export type GraphEdge = {
  from: string;
  to: string;
  label: string;
  kind: "forward" | "backward";
};

export type GradientBadge = {
  nodeId: string;
  label: string;
  value: string;
};

export type ChainRuleSection = {
  title: string;
  rows: string[];
  result: string;
};

export type ChartLine = {
  label: string;
  samples: Array<{ x: number; y: number }>;
  currentX: number;
  currentY: number;
  xLabel: string;
  yLabel: string;
};

export type AutogradAnalysis = {
  definition: FormulaDefinition;
  values: Record<ParameterKey, number>;
  output: number;
  gradients: Record<string, number>;
  graph: {
    nodes: GraphNode[];
    forwardEdges: GraphEdge[];
    backwardEdges: GraphEdge[];
    badges: GradientBadge[];
  };
  activeLocalDerivative: string;
  chainRule: ChainRuleSection[];
  charts: ChartLine[];
  updatePreview: Array<{
    key: string;
    before: number;
    gradient: number;
    after: number;
  }>;
};

export const learningRate = 0.1;

export const autogradFormulas: FormulaDefinition[] = [
  {
    id: "polynomial",
    label: "f(a, b) = a * b + b^2",
    shortLabel: "Multiply, square, add",
    description: "One shared input creates two gradient paths.",
    expression: "f(a, b) = a * b + b^2",
    parameters: [
      { key: "a", label: "a", min: -5, max: 5, step: 0.1, defaultValue: 2 },
      { key: "b", label: "b", min: -5, max: 5, step: 0.1, defaultValue: 3 },
    ],
  },
  {
    id: "sigmoid",
    label: "f(x, w) = sigmoid(w * x)",
    shortLabel: "Bounded between 0 and 1",
    description: "A product feeds a squashing activation.",
    expression: "f(x, w) = sigmoid(w * x)",
    parameters: [
      { key: "x", label: "x", min: -4, max: 4, step: 0.1, defaultValue: 1.5 },
      { key: "w", label: "w", min: -4, max: 4, step: 0.1, defaultValue: 1.2 },
    ],
  },
  {
    id: "squared-error",
    label: "L(m, c) = (m * x + c - y)^2",
    shortLabel: "Line then square the error",
    description: "A model prediction turns into a squared loss.",
    expression: "L(m, c) = (m * x + c - y)^2",
    parameters: [
      { key: "m", label: "m", min: -2, max: 4, step: 0.1, defaultValue: 1.5 },
      { key: "c", label: "c", min: -4, max: 6, step: 0.1, defaultValue: 1 },
    ],
    constants: {
      x: 2,
      y: 5,
    },
  },
];

export const defaultFormulaId: FormulaId = "polynomial";

export function getFormulaDefinition(id: FormulaId) {
  return autogradFormulas.find((formula) => formula.id === id) ?? autogradFormulas[0];
}

export function getDefaultValues(definition: FormulaDefinition) {
  return Object.fromEntries(
    definition.parameters.map((parameter) => [
      parameter.key,
      parameter.defaultValue,
    ]),
  ) as Record<ParameterKey, number>;
}

export function analyzeAutograd(
  formulaId: FormulaId,
  values: Record<ParameterKey, number>,
): AutogradAnalysis {
  if (formulaId === "sigmoid") {
    return analyzeSigmoid(values);
  }

  if (formulaId === "squared-error") {
    return analyzeSquaredError(values);
  }

  return analyzePolynomial(values);
}

function analyzePolynomial(values: Record<ParameterKey, number>): AutogradAnalysis {
  const definition = getFormulaDefinition("polynomial");
  const a = values.a ?? 2;
  const b = values.b ?? 3;
  const mul = a * b;
  const square = b ** 2;
  const output = mul + square;
  const gradA = b;
  const gradBFromMul = a;
  const gradBFromSquare = 2 * b;
  const gradB = gradBFromMul + gradBFromSquare;

  return {
    definition,
    values,
    output,
    gradients: { a: gradA, b: gradB },
    graph: {
      nodes: [
        node("a", "a", "input", a, 90, 95, "input"),
        node("b", "b", "input", b, 90, 230, "input"),
        node("mul", "mul", "a * b", mul, 285, 105, "operation"),
        node("square", "square", "b^2", square, 342, 240, "operation"),
        node("add", "add", "mul + square", output, 522, 165, "operation"),
        node("out", "out", "f(a, b)", output, 675, 165, "output"),
      ],
      forwardEdges: [
        edge("a", "mul", `a = ${formatFixed(a)}`, "forward"),
        edge("b", "mul", `b = ${formatFixed(b)}`, "forward"),
        edge("b", "square", `b = ${formatFixed(b)}`, "forward"),
        edge("mul", "add", formatFixed(mul), "forward"),
        edge("square", "add", formatFixed(square), "forward"),
        edge("add", "out", formatFixed(output), "forward"),
      ],
      backwardEdges: [
        edge("out", "add", "1", "backward"),
        edge("add", "mul", "1", "backward"),
        edge("add", "square", "1", "backward"),
        edge("mul", "a", formatFixed(gradA), "backward"),
        edge("mul", "b", formatFixed(gradBFromMul), "backward"),
        edge("square", "b", formatFixed(gradBFromSquare), "backward"),
      ],
      badges: [
        badge("a", "from mul", gradA),
        badge("a", "df/da", gradA),
        badge("b", "from mul", gradBFromMul),
        badge("b", "from square", gradBFromSquare),
        { nodeId: "b", label: "df/db", value: `${formatFixed(gradBFromMul)} + ${formatFixed(gradBFromSquare)} = ${formatFixed(gradB)}` },
        badge("mul", "incoming grad", 1),
        badge("square", "incoming grad", 1),
        badge("add", "output grad", 1),
      ],
    },
    activeLocalDerivative: "local add->mul = 1",
    chainRule: [
      {
        title: "Gradient for a",
        rows: [
          "output grad 1",
          "local add->mul 1",
          `local mul->a b = ${formatFixed(b)}`,
        ],
        result: `df/da = ${formatFixed(gradA)}`,
      },
      {
        title: "Gradient for b adds two paths",
        rows: [
          `via multiply: 1 x 1 x a = ${formatFixed(a)} -> ${formatFixed(gradBFromMul)}`,
          `via square: 1 x 1 x 2b = ${formatFixed(gradBFromSquare)} -> ${formatFixed(gradBFromSquare)}`,
        ],
        result: `df/db = ${formatFixed(gradBFromMul)} + ${formatFixed(gradBFromSquare)} = ${formatFixed(gradB)}`,
      },
    ],
    charts: [
      buildChart("f(a, b) = b*a + b^2", "a", "f", -5, 5, a, (x) => x * b + b ** 2),
      buildChart("df/da = b", "a", "df/da", -5, 5, a, () => b),
      buildChart("df/db = a + 2b", "b", "df/db", -5, 5, b, (x) => a + 2 * x),
    ],
    updatePreview: buildUpdatePreview([
      ["a", a, gradA],
      ["b", b, gradB],
    ]),
  };
}

function analyzeSigmoid(values: Record<ParameterKey, number>): AutogradAnalysis {
  const definition = getFormulaDefinition("sigmoid");
  const x = values.x ?? 1.5;
  const w = values.w ?? 1.2;
  const product = w * x;
  const output = sigmoid(product);
  const localSigmoid = output * (1 - output);
  const gradX = localSigmoid * w;
  const gradW = localSigmoid * x;

  return {
    definition,
    values,
    output,
    gradients: { x: gradX, w: gradW },
    graph: {
      nodes: [
        node("x", "x", "input", x, 90, 110, "input"),
        node("w", "w", "input", w, 90, 235, "input"),
        node("mul", "mul", "w * x", product, 300, 172, "operation"),
        node("sigmoid", "sigmoid", "1 / (1 + e^-z)", output, 510, 172, "operation"),
        node("out", "out", "f(x, w)", output, 675, 172, "output"),
      ],
      forwardEdges: [
        edge("x", "mul", `x = ${formatFixed(x)}`, "forward"),
        edge("w", "mul", `w = ${formatFixed(w)}`, "forward"),
        edge("mul", "sigmoid", `z = ${formatFixed(product)}`, "forward"),
        edge("sigmoid", "out", formatFixed(output), "forward"),
      ],
      backwardEdges: [
        edge("out", "sigmoid", "1", "backward"),
        edge("sigmoid", "mul", formatFixed(localSigmoid), "backward"),
        edge("mul", "x", formatFixed(gradX), "backward"),
        edge("mul", "w", formatFixed(gradW), "backward"),
      ],
      badges: [
        badge("sigmoid", "local sigmoid", localSigmoid),
        badge("x", "df/dx", gradX),
        badge("w", "df/dw", gradW),
        badge("mul", "incoming grad", localSigmoid),
      ],
    },
    activeLocalDerivative: "local sigmoid->mul = f(1 - f)",
    chainRule: [
      {
        title: "Gradient for x",
        rows: [
          "output grad 1",
          `local sigmoid ${formatFixed(localSigmoid)}`,
          `local mul->x w = ${formatFixed(w)}`,
        ],
        result: `df/dx = ${formatFixed(gradX)}`,
      },
      {
        title: "Gradient for w",
        rows: [
          "output grad 1",
          `local sigmoid ${formatFixed(localSigmoid)}`,
          `local mul->w x = ${formatFixed(x)}`,
        ],
        result: `df/dw = ${formatFixed(gradW)}`,
      },
    ],
    charts: [
      buildChart("f(x, w) = sigmoid(w*x)", "x", "f", -4, 4, x, (value) => sigmoid(w * value)),
      buildChart("df/dx = f(1-f)w", "x", "df/dx", -4, 4, x, (value) => {
        const current = sigmoid(w * value);
        return current * (1 - current) * w;
      }),
      buildChart("df/dw = f(1-f)x", "w", "df/dw", -4, 4, w, (value) => {
        const current = sigmoid(value * x);
        return current * (1 - current) * x;
      }),
    ],
    updatePreview: buildUpdatePreview([
      ["x", x, gradX],
      ["w", w, gradW],
    ]),
  };
}

function analyzeSquaredError(values: Record<ParameterKey, number>): AutogradAnalysis {
  const definition = getFormulaDefinition("squared-error");
  const m = values.m ?? 1.5;
  const c = values.c ?? 1;
  const x = 2;
  const y = 5;
  const product = m * x;
  const prediction = product + c;
  const error = prediction - y;
  const output = error ** 2;
  const gradM = 2 * error * x;
  const gradC = 2 * error;
  const localSquare = 2 * error;

  return {
    definition,
    values,
    output,
    gradients: { m: gradM, c: gradC },
    graph: {
      nodes: [
        node("m", "m", "slope", m, 80, 90, "input"),
        node("x", "x", "constant", x, 80, 190, "constant"),
        node("c", "c", "intercept", c, 80, 285, "input"),
        node("mul", "mul", "m * x", product, 265, 142, "operation"),
        node("add", "add", "mx + c", prediction, 420, 190, "operation"),
        node("y", "y", "target", y, 420, 290, "constant"),
        node("subtract", "subtract", "pred - y", error, 555, 222, "operation"),
        node("square", "square", "error^2", output, 685, 222, "output"),
      ],
      forwardEdges: [
        edge("m", "mul", `m = ${formatFixed(m)}`, "forward"),
        edge("x", "mul", `x = ${formatFixed(x)}`, "forward"),
        edge("mul", "add", formatFixed(product), "forward"),
        edge("c", "add", `c = ${formatFixed(c)}`, "forward"),
        edge("add", "subtract", `pred = ${formatFixed(prediction)}`, "forward"),
        edge("y", "subtract", `y = ${formatFixed(y)}`, "forward"),
        edge("subtract", "square", `err = ${formatFixed(error)}`, "forward"),
      ],
      backwardEdges: [
        edge("square", "subtract", formatFixed(localSquare), "backward"),
        edge("subtract", "add", formatFixed(localSquare), "backward"),
        edge("add", "mul", formatFixed(localSquare), "backward"),
        edge("add", "c", formatFixed(gradC), "backward"),
        edge("mul", "m", formatFixed(gradM), "backward"),
      ],
      badges: [
        badge("subtract", "incoming grad", localSquare),
        badge("m", "dL/dm", gradM),
        badge("c", "dL/dc", gradC),
        badge("mul", "through x", gradM),
        badge("add", "to c", gradC),
      ],
    },
    activeLocalDerivative: `local square->error = 2 * error = ${formatFixed(localSquare)}`,
    chainRule: [
      {
        title: "Gradient for m",
        rows: [
          `square local 2*error = ${formatFixed(localSquare)}`,
          "subtract->prediction 1",
          `prediction->m x = ${formatFixed(x)}`,
        ],
        result: `dL/dm = ${formatFixed(gradM)}`,
      },
      {
        title: "Gradient for c",
        rows: [
          `square local 2*error = ${formatFixed(localSquare)}`,
          "subtract->prediction 1",
          "prediction->c 1",
        ],
        result: `dL/dc = ${formatFixed(gradC)}`,
      },
    ],
    charts: [
      buildChart("L(m, c) vs m", "m", "L", -2, 4, m, (value) => (value * x + c - y) ** 2),
      buildChart("dL/dm = 2 error x", "m", "dL/dm", -2, 4, m, (value) => 2 * (value * x + c - y) * x),
      buildChart("dL/dc = 2 error", "c", "dL/dc", -4, 6, c, (value) => 2 * (m * x + value - y)),
    ],
    updatePreview: buildUpdatePreview([
      ["m", m, gradM],
      ["c", c, gradC],
    ]),
  };
}

function node(
  id: string,
  label: string,
  subLabel: string,
  value: number,
  x: number,
  y: number,
  tone: GraphNode["tone"],
): GraphNode {
  return { id, label, subLabel, value, x, y, tone };
}

function edge(
  from: string,
  to: string,
  label: string,
  kind: GraphEdge["kind"],
): GraphEdge {
  return { from, to, label, kind };
}

function badge(nodeId: string, label: string, value: number): GradientBadge {
  return { nodeId, label, value: formatFixed(value) };
}

function buildUpdatePreview(
  rows: Array<[string, number, number]>,
): AutogradAnalysis["updatePreview"] {
  return rows.map(([key, before, gradient]) => ({
    key,
    before,
    gradient,
    after: before - learningRate * gradient,
  }));
}

function buildChart(
  label: string,
  xLabel: string,
  yLabel: string,
  minX: number,
  maxX: number,
  currentX: number,
  fn: (value: number) => number,
): ChartLine {
  const samples = Array.from({ length: 80 }, (_, index) => {
    const x = minX + (index / 79) * (maxX - minX);

    return { x, y: fn(x) };
  });

  return {
    label,
    samples,
    currentX,
    currentY: fn(currentX),
    xLabel,
    yLabel,
  };
}

export function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

export function formatFixed(value: number, digits = 3) {
  if (Math.abs(value) < 0.0005) {
    return (0).toFixed(digits);
  }

  return value.toFixed(digits);
}

export function formatCompact(value: number) {
  if (Math.abs(value) >= 100) {
    return value.toFixed(0);
  }

  if (Math.abs(value) >= 10) {
    return value.toFixed(1);
  }

  return value.toFixed(2);
}
