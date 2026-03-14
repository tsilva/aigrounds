export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type RgbaColor = RgbColor & {
  a: number;
};

type DiffusionStage = "coarse" | "mid" | "fine";

type EllipseShape = {
  kind: "ellipse";
  stage: DiffusionStage;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: RgbColor;
  opacity?: number;
  softness?: number;
};

type RectShape = {
  kind: "rect";
  stage: DiffusionStage;
  cx: number;
  cy: number;
  width: number;
  height: number;
  color: RgbColor;
  opacity?: number;
  softness?: number;
};

type DiffusionShape = EllipseShape | RectShape;

type Glow = {
  cx: number;
  cy: number;
  radius: number;
  color: RgbColor;
  opacity: number;
};

export type DiffusionPreset = {
  id: string;
  title: string;
  prompt: string;
  caption: string;
  backgroundTop: RgbColor;
  backgroundBottom: RgbColor;
  glow?: Glow;
  noiseTint: [RgbColor, RgbColor];
  shapes: DiffusionShape[];
  gridSize?: number;
  totalSteps?: number;
};

export type DiffusionFrame = {
  step: number;
  progress: number;
  pixels: string[];
  phaseLabel: string;
  phaseSummary: string;
  focusLabel: string;
  noiseLeft: number;
  structureLocked: number;
  detailVisible: number;
  guessability: number;
};

export type DiffusionRun = {
  preset: DiffusionPreset;
  frames: DiffusionFrame[];
  gridSize: number;
  totalSteps: number;
  milestoneSteps: number[];
};

const STAGES: DiffusionStage[] = ["coarse", "mid", "fine"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }

  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function mixNumber(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function mixColor(left: RgbColor, right: RgbColor, amount: number): RgbColor {
  return {
    r: mixNumber(left.r, right.r, amount),
    g: mixNumber(left.g, right.g, amount),
    b: mixNumber(left.b, right.b, amount),
  };
}

function multiplyColor(color: RgbColor, amount: number): RgbColor {
  return {
    r: color.r * amount,
    g: color.g * amount,
    b: color.b * amount,
  };
}

function addColors(left: RgbColor, right: RgbColor): RgbColor {
  return {
    r: left.r + right.r,
    g: left.g + right.g,
    b: left.b + right.b,
  };
}

function cssColor(color: RgbColor) {
  return `rgb(${Math.round(clamp(color.r, 0, 255))} ${Math.round(clamp(color.g, 0, 255))} ${Math.round(clamp(color.b, 0, 255))})`;
}

function alphaComposite(
  under: RgbaColor,
  overColor: RgbColor,
  overAlpha: number,
): RgbaColor {
  const alpha = clamp(overAlpha, 0, 1);

  if (alpha <= 0) {
    return under;
  }

  const outAlpha = alpha + under.a * (1 - alpha);

  if (outAlpha <= 0) {
    return under;
  }

  return {
    r: (overColor.r * alpha + under.r * under.a * (1 - alpha)) / outAlpha,
    g: (overColor.g * alpha + under.g * under.a * (1 - alpha)) / outAlpha,
    b: (overColor.b * alpha + under.b * under.a * (1 - alpha)) / outAlpha,
    a: outAlpha,
  };
}

function softEdgeMask(distance: number, softness = 0.1) {
  if (distance >= 1) {
    return 0;
  }

  const safeSoftness = clamp(softness, 0.02, 0.95);
  return 1 - smoothstep(1 - safeSoftness, 1, distance);
}

function shapeMask(shape: DiffusionShape, u: number, v: number) {
  if (shape.kind === "ellipse") {
    const dx = (u - shape.cx) / shape.rx;
    const dy = (v - shape.cy) / shape.ry;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return softEdgeMask(distance, shape.softness);
  }

  const dx = Math.abs(u - shape.cx);
  const dy = Math.abs(v - shape.cy);
  const xDistance = dx / (shape.width / 2);
  const yDistance = dy / (shape.height / 2);
  const distance = Math.max(xDistance, yDistance);
  return softEdgeMask(distance, shape.softness);
}

function createTransparentGrid(size: number) {
  return Array.from({ length: size * size }, () => ({
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  }));
}

function renderStageGrid(
  preset: DiffusionPreset,
  stage: DiffusionStage,
  size: number,
) {
  const grid = createTransparentGrid(size);

  for (const shape of preset.shapes) {
    if (shape.stage !== stage) {
      continue;
    }

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const u = (x + 0.5) / size;
        const v = (y + 0.5) / size;
        const mask = shapeMask(shape, u, v);
        const alpha = mask * (shape.opacity ?? 1);

        if (alpha <= 0) {
          continue;
        }

        const index = y * size + x;
        grid[index] = alphaComposite(grid[index], shape.color, alpha);
      }
    }
  }

  return grid;
}

function createBaseGrid(preset: DiffusionPreset, size: number) {
  const grid: RgbColor[] = [];

  for (let y = 0; y < size; y += 1) {
    const v = y / Math.max(size - 1, 1);
    const baseRow = mixColor(preset.backgroundTop, preset.backgroundBottom, v);

    for (let x = 0; x < size; x += 1) {
      const u = x / Math.max(size - 1, 1);
      let color = baseRow;

      if (preset.glow) {
        const dx = u - preset.glow.cx;
        const dy = v - preset.glow.cy;
        const distance = Math.sqrt(dx * dx + dy * dy) / preset.glow.radius;
        const glowStrength =
          clamp(1 - distance, 0, 1) * clamp(1 - distance, 0, 1) * preset.glow.opacity;
        color = mixColor(color, preset.glow.color, glowStrength);
      }

      grid.push(color);
    }
  }

  return grid;
}

function compositeGrid(
  baseGrid: RgbColor[],
  overlayGrid: RgbaColor[],
  amount: number,
) {
  return baseGrid.map((basePixel, index) => {
    const overlay = overlayGrid[index];
    const alpha = overlay.a * amount;

    if (alpha <= 0) {
      return basePixel;
    }

    return mixColor(basePixel, overlay, alpha);
  });
}

function boxBlur(grid: RgbColor[], size: number, passes: number) {
  let current = grid;

  for (let pass = 0; pass < passes; pass += 1) {
    const next: RgbColor[] = [];

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        let count = 0;
        let total = { r: 0, g: 0, b: 0 };

        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            const sampleX = clamp(x + offsetX, 0, size - 1);
            const sampleY = clamp(y + offsetY, 0, size - 1);
            const sample = current[sampleY * size + sampleX];
            total = addColors(total, sample);
            count += 1;
          }
        }

        next.push(multiplyColor(total, 1 / count));
      }
    }

    current = next;
  }

  return current;
}

function seededNoise(seed: string, x: number, y: number, salt: number) {
  let total = salt;

  for (let index = 0; index < seed.length; index += 1) {
    total += seed.charCodeAt(index) * (index + 17);
  }

  const value = Math.sin((x + 1.73 * total) * 12.9898 + (y + 0.91 * total) * 78.233);
  return value - Math.floor(value);
}

function createNoiseGrid(preset: DiffusionPreset, size: number) {
  const [lowTint, highTint] = preset.noiseTint;
  const grid: RgbColor[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const band = seededNoise(preset.id, Math.floor(x / 2), Math.floor(y / 2), 19);
      const base = mixColor(lowTint, highTint, band);
      const red = seededNoise(preset.id, x, y, 31);
      const green = seededNoise(preset.id, x, y, 47);
      const blue = seededNoise(preset.id, x, y, 73);

      grid.push({
        r: clamp(base.r + (red - 0.5) * 120, 0, 255),
        g: clamp(base.g + (green - 0.5) * 120, 0, 255),
        b: clamp(base.b + (blue - 0.5) * 120, 0, 255),
      });
    }
  }

  return grid;
}

function mixGrids(noiseGrid: RgbColor[], signalGrid: RgbColor[], signalWeight: number) {
  return signalGrid.map((signalPixel, index) =>
    mixColor(noiseGrid[index], signalPixel, signalWeight),
  );
}

function phaseForProgress(progress: number) {
  if (progress < 0.22) {
    return {
      phaseLabel: "Noise collapse",
      focusLabel: "Large color regions",
      phaseSummary:
        "Early steps spend most of their budget subtracting raw noise. You get vague color blocks first because low-frequency structure is easiest to recover.",
    };
  }

  if (progress < 0.55) {
    return {
      phaseLabel: "Composition lock-in",
      focusLabel: "Subject silhouette",
      phaseSummary:
        "The sampler now has enough signal to settle the pose and silhouette. You can usually guess the subject here even though boundaries still feel mushy.",
    };
  }

  if (progress < 0.82) {
    return {
      phaseLabel: "Edge recovery",
      focusLabel: "Eyes, windows, boundaries",
      phaseSummary:
        "Mid-frequency features show up next. Clean edges and recognizable parts arrive before tiny textures because the model is still narrowing uncertainty.",
    };
  }

  return {
    phaseLabel: "Texture polish",
    focusLabel: "Contrast and surface detail",
    phaseSummary:
      "Late denoising barely changes composition. The remaining work is texture, contrast, and small corrections, which is why the image seems to sharpen instead of popping in all at once.",
  };
}

function createFrame(
  step: number,
  totalSteps: number,
  noiseGrid: RgbColor[],
  finalGrid: RgbColor[],
  coarseGrid: RgbaColor[],
  midGrid: RgbaColor[],
  fineGrid: RgbaColor[],
  baseGrid: RgbColor[],
  size: number,
): DiffusionFrame {
  const progress = step / totalSteps;
  const coarseWeight = smoothstep(0.04, 0.36, progress);
  const midWeight = smoothstep(0.28, 0.72, progress);
  const fineWeight = smoothstep(0.58, 0.98, progress);
  const signalWeight = smoothstep(0.02, 0.96, progress);
  const blurPasses = Math.round(4 * Math.pow(1 - progress, 1.25));

  let denoisedGrid = compositeGrid(baseGrid, coarseGrid, coarseWeight);
  denoisedGrid = compositeGrid(denoisedGrid, midGrid, midWeight);
  denoisedGrid = compositeGrid(denoisedGrid, fineGrid, fineWeight);
  denoisedGrid = boxBlur(denoisedGrid, size, blurPasses);

  let currentGrid = mixGrids(noiseGrid, denoisedGrid, signalWeight);

  if (progress > 0.78) {
    const polishWeight = smoothstep(0.78, 1, progress) * 0.35;
    currentGrid = mixGrids(currentGrid, finalGrid, polishWeight);
  }

  const phase = phaseForProgress(progress);

  return {
    step,
    progress,
    pixels: currentGrid.map(cssColor),
    phaseLabel: phase.phaseLabel,
    focusLabel: phase.focusLabel,
    phaseSummary: phase.phaseSummary,
    noiseLeft: Math.round((1 - signalWeight) * 100),
    structureLocked: Math.round((coarseWeight * 0.65 + midWeight * 0.35) * 100),
    detailVisible: Math.round((midWeight * 0.55 + fineWeight * 0.45) * 100),
    guessability: Math.round(
      clamp(coarseWeight * 0.5 + midWeight * 0.35 + fineWeight * 0.15, 0, 1) * 100,
    ),
  };
}

export function buildDiffusionRun(preset: DiffusionPreset): DiffusionRun {
  const gridSize = preset.gridSize ?? 28;
  const totalSteps = preset.totalSteps ?? 40;
  const baseGrid = createBaseGrid(preset, gridSize);
  const coarseGrid = renderStageGrid(preset, "coarse", gridSize);
  const midGrid = renderStageGrid(preset, "mid", gridSize);
  const fineGrid = renderStageGrid(preset, "fine", gridSize);
  let finalGrid = baseGrid;

  for (const stage of STAGES) {
    const stageGrid =
      stage === "coarse" ? coarseGrid : stage === "mid" ? midGrid : fineGrid;
    finalGrid = compositeGrid(finalGrid, stageGrid, 1);
  }

  const noiseGrid = createNoiseGrid(preset, gridSize);
  const frames = Array.from({ length: totalSteps + 1 }, (_, step) =>
    createFrame(
      step,
      totalSteps,
      noiseGrid,
      finalGrid,
      coarseGrid,
      midGrid,
      fineGrid,
      baseGrid,
      gridSize,
    ),
  );

  const milestoneSteps = Array.from(
    new Set([0, 6, 12, 20, 28, totalSteps].map((value) => clamp(value, 0, totalSteps))),
  );

  return {
    preset,
    frames,
    gridSize,
    totalSteps,
    milestoneSteps,
  };
}
