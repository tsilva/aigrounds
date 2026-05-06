export type DescentState = {
  theta: number;
  velocity: number;
  step: number;
};

export type DescentPoint = DescentState & {
  loss: number;
  gradient: number;
  proposedUpdate: number;
  nextTheta: number;
};

type DescentAnalysis = DescentPoint & {
  stepSize: number;
  distanceToMinimum: number;
  behavior: "creeping" | "converging" | "overshooting";
  behaviorCopy: string;
};

export const minimumTheta = 0;
export const defaultStartTheta = 2.4;

export function loss(theta: number) {
  return 0.5 * theta * theta;
}

function gradient(theta: number) {
  return theta;
}

export function analyzeDescent(
  state: DescentState,
  learningRate: number,
  momentum: number,
): DescentAnalysis {
  const currentGradient = gradient(state.theta);
  const proposedUpdate =
    -learningRate * currentGradient + momentum * state.velocity;
  const nextTheta = state.theta + proposedUpdate;
  const behavior = getBehavior(
    state.theta,
    nextTheta,
    proposedUpdate,
    learningRate,
  );

  return {
    ...state,
    loss: loss(state.theta),
    gradient: currentGradient,
    proposedUpdate,
    nextTheta,
    stepSize: Math.abs(proposedUpdate),
    distanceToMinimum: Math.abs(state.theta - minimumTheta),
    behavior,
    behaviorCopy: getBehaviorCopy(behavior),
  };
}

export function stepDescent(
  state: DescentState,
  learningRate: number,
  momentum: number,
): DescentState {
  const analysis = analyzeDescent(state, learningRate, momentum);

  return {
    theta: clamp(round(analysis.nextTheta, 6), -3.2, 3.2),
    velocity: round(analysis.proposedUpdate, 6),
    step: state.step + 1,
  };
}

export function simulateDescent(
  initialTheta: number,
  learningRate: number,
  momentum: number,
  steps: number,
) {
  const states: DescentState[] = [
    {
      theta: initialTheta,
      velocity: 0,
      step: 0,
    },
  ];

  for (let index = 0; index < steps; index += 1) {
    const currentState = states[states.length - 1];

    if (!currentState) {
      break;
    }

    states.push(stepDescent(currentState, learningRate, momentum));
  }

  return states.map((state) => ({
    ...state,
    loss: loss(state.theta),
    gradient: gradient(state.theta),
  }));
}

export function formatSigned(value: number, digits = 2) {
  const formatted = Math.abs(value).toFixed(digits);

  if (Math.abs(value) < 10 ** -digits) {
    return formatted;
  }

  return `${value > 0 ? "+" : "-"}${formatted}`;
}

export function formatNumber(value: number, digits = 2) {
  return value.toFixed(digits);
}

function getBehavior(
  theta: number,
  nextTheta: number,
  update: number,
  learningRate: number,
): DescentAnalysis["behavior"] {
  if (Math.sign(theta) !== Math.sign(nextTheta) && Math.abs(nextTheta) > 0.12) {
    return "overshooting";
  }

  if (Math.abs(update) < 0.12 || learningRate < 0.16) {
    return "creeping";
  }

  return "converging";
}

function getBehaviorCopy(behavior: DescentAnalysis["behavior"]) {
  if (behavior === "overshooting") {
    return "This step crosses the valley, so the next gradient points back.";
  }

  if (behavior === "creeping") {
    return "The direction is right, but the step is too small to move fast.";
  }

  return "The step moves downhill without jumping past the minimum.";
}

function round(value: number, digits: number) {
  const scale = 10 ** digits;

  return Math.round(value * scale) / scale;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
