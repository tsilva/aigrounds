"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  computeInputSaliency,
  normalizeMnistInput,
  parseOnnxMlpModel,
  preprocessMnistInput,
  runMlpCpu,
  runMlpWebGpu,
  softmax,
  topContributors,
  type ForwardDebug,
  type MnistPreprocessingMode,
  type MlpModel,
} from "./mnist-mlp-engine";

type RunState = "idle" | "ready" | "running" | "done" | "error";

type SelectedNeuron = {
  layerIndex: number;
  neuronIndex: number;
};

type EdgeScore = {
  key: string;
  sourceIndex: number;
  targetIndex: number;
  magnitude: number;
};

type ContributionEdge = {
  key: string;
  sourceIndex: number;
  targetIndex: number;
  weight: number;
  magnitude: number;
};

const fallbackArchitecture = [784, 128, 64, 32, 10];
const digitLabels = Array.from({ length: 10 }, (_, index) => index);
const networkSvgWidth = 940;
const networkSvgHeight = 350;
const preprocessingOptions: Array<{
  id: MnistPreprocessingMode;
  label: string;
}> = [
  { id: "mnist-standard", label: "MNIST norm" },
  { id: "raw", label: "Raw 0..1" },
];

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-[14px] border border-[#d8e0f3] bg-white/94 shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] leading-none font-black text-[#251cff] uppercase">
      {children}
    </h2>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        d="M12 16V4m0 0 4.2 4.2M12 4 7.8 8.2M5 15.5v2.8A1.7 1.7 0 0 0 6.7 20h10.6a1.7 1.7 0 0 0 1.7-1.7v-2.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="m4 20 4.8-1 10-10a2.2 2.2 0 0 0-3.1-3.1l-10 10L4 20Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="m3 17 9-9 6 6-6 6H6l-3-3Zm9 3h9M14.5 5.5l4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ArchitecturePill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[168px] rounded-[12px] border border-[#e2e7f4] bg-white px-5 py-3">
      <p className="text-[12px] font-black text-[#7180a8]">{label}</p>
      <p className="mt-1 truncate font-mono text-[17px] font-black text-[#071854]">
        {value}
      </p>
    </div>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(value > 0.1 ? 2 : 3)}%`;
}

function formatNumber(value: number) {
  if (Math.abs(value) >= 10) {
    return value.toFixed(1);
  }

  return value.toFixed(2);
}

function sampleIndices(size: number, count: number) {
  if (size <= count) {
    return Array.from({ length: size }, (_, index) => index);
  }

  return Array.from({ length: count }, (_, index) =>
    Math.round((index / (count - 1)) * (size - 1)),
  );
}

function sampleIndicesWithPinned(size: number, count: number, pinned: number | null) {
  const indices = sampleIndices(size, count);

  if (pinned === null || pinned < 0 || pinned >= size || indices.includes(pinned)) {
    return indices;
  }

  indices[Math.floor(indices.length / 2)] = pinned;

  return Array.from(new Set(indices)).sort((left, right) => left - right);
}

function inputEdgeSourceIndices(rawInput: Float32Array) {
  return Array.from({ length: Math.min(784, rawInput.length) }, (_, index) => ({
    index,
    value: rawInput[index] ?? 0,
  }))
    .filter((item) => item.value > 0.025)
    .sort((left, right) => right.value - left.value)
    .slice(0, 64)
    .map((item) => item.index);
}

function networkLayerX(layerIndex: number, layerCount: number) {
  if (layerIndex === 0) {
    return 64;
  }

  const firstNonInputX = layerCount <= 3 ? 500 : 310;
  const lastLayerX = networkSvgWidth - 60;

  return (
    firstNonInputX +
    ((layerIndex - 1) * (lastLayerX - firstNonInputX)) /
      Math.max(1, layerCount - 2)
  );
}

function selectVisibleContributionEdges(
  scoredEdges: ContributionEdge[],
  sourceIndices: number[],
  targetIndices: number[],
  topKEdges: number,
) {
  const keys = new Set<string>();
  const limit = Math.max(1, Math.min(20, topKEdges));

  sourceIndices.forEach((sourceIndex) => {
    scoredEdges
      .filter((edge) => edge.sourceIndex === sourceIndex)
      .sort((left, right) => right.magnitude - left.magnitude)
      .slice(0, limit)
      .forEach((edge) => keys.add(edge.key));
  });

  targetIndices.forEach((targetIndex) => {
    scoredEdges
      .filter((edge) => edge.targetIndex === targetIndex)
      .sort((left, right) => right.magnitude - left.magnitude)
      .slice(0, limit)
      .forEach((edge) => keys.add(edge.key));
  });

  return scoredEdges.filter((edge) => keys.has(edge.key));
}

function drawDefaultDigit(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const scale = canvas.width / 28;

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "white";
  context.lineWidth = Math.max(2.4, 2.4 * scale);
  context.beginPath();
  context.moveTo(8.2 * scale, 6.4 * scale);
  context.quadraticCurveTo(13.6 * scale, 5.2 * scale, 20.6 * scale, 5 * scale);
  context.quadraticCurveTo(22.6 * scale, 5.1 * scale, 21.8 * scale, 7.2 * scale);
  context.lineTo(15 * scale, 15.6 * scale);
  context.quadraticCurveTo(13.2 * scale, 18.4 * scale, 12.7 * scale, 22.4 * scale);
  context.stroke();
}

function clearCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function getPointerPosition(event: React.PointerEvent<HTMLCanvasElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const scaleX = event.currentTarget.width / rect.width;
  const scaleY = event.currentTarget.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function extractMnistInput(canvas: HTMLCanvasElement) {
  const source = canvas.getContext("2d");

  if (!source) {
    return normalizeMnistInput([]);
  }

  const imageData = source.getImageData(0, 0, canvas.width, canvas.height);
  const values: number[] = [];
  const cell = canvas.width / 28;

  for (let row = 0; row < 28; row += 1) {
    for (let column = 0; column < 28; column += 1) {
      let brightness = 0;
      let samples = 0;
      const xStart = Math.floor(column * cell);
      const xEnd = Math.floor((column + 1) * cell);
      const yStart = Math.floor(row * cell);
      const yEnd = Math.floor((row + 1) * cell);

      for (let y = yStart; y < yEnd; y += 1) {
        for (let x = xStart; x < xEnd; x += 1) {
          const index = (y * canvas.width + x) * 4;
          const luminance =
            (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;

          brightness += luminance / 255;
          samples += 1;
        }
      }

      values.push(samples > 0 ? brightness / samples : 0);
    }
  }

  return normalizeMnistInput(centerInk(values));
}

function centerInk(values: number[]) {
  const threshold = 0.04;
  let minX = 28;
  let minY = 28;
  let maxX = -1;
  let maxY = -1;

  for (let index = 0; index < values.length; index += 1) {
    if ((values[index] ?? 0) <= threshold) {
      continue;
    }

    const x = index % 28;
    const y = Math.floor(index / 28);

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (maxX < minX || maxY < minY) {
    return values;
  }

  const sourceWidth = maxX - minX + 1;
  const sourceHeight = maxY - minY + 1;
  const scale = Math.min(20 / sourceWidth, 20 / sourceHeight);
  const scaledWidth = Math.max(1, Math.round(sourceWidth * scale));
  const scaledHeight = Math.max(1, Math.round(sourceHeight * scale));
  const scaled = new Array(scaledWidth * scaledHeight).fill(0);

  for (let y = 0; y < scaledHeight; y += 1) {
    for (let x = 0; x < scaledWidth; x += 1) {
      const sourceX = minX + Math.min(sourceWidth - 1, Math.floor(x / scale));
      const sourceY = minY + Math.min(sourceHeight - 1, Math.floor(y / scale));
      scaled[y * scaledWidth + x] = values[sourceY * 28 + sourceX] ?? 0;
    }
  }

  let mass = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let y = 0; y < scaledHeight; y += 1) {
    for (let x = 0; x < scaledWidth; x += 1) {
      const value = scaled[y * scaledWidth + x] ?? 0;
      mass += value;
      weightedX += x * value;
      weightedY += y * value;
    }
  }

  const centerX = mass > 0 ? weightedX / mass : (scaledWidth - 1) / 2;
  const centerY = mass > 0 ? weightedY / mass : (scaledHeight - 1) / 2;
  const offsetX = Math.round(14 - centerX);
  const offsetY = Math.round(14 - centerY);
  const centered = new Array(784).fill(0);

  for (let y = 0; y < scaledHeight; y += 1) {
    for (let x = 0; x < scaledWidth; x += 1) {
      const targetX = x + offsetX;
      const targetY = y + offsetY;

      if (targetX >= 0 && targetX < 28 && targetY >= 0 && targetY < 28) {
        centered[targetY * 28 + targetX] = Math.max(
          centered[targetY * 28 + targetX] ?? 0,
          scaled[y * scaledWidth + x] ?? 0,
        );
      }
    }
  }

  return centered;
}

function InputPanel({
  canvasRef,
  onInputChange,
  modelLoaded,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onInputChange: (input: Float32Array) => void;
  modelLoaded: boolean;
}) {
  const drawingRef = useRef(false);
  const [activeTool, setActiveTool] = useState<"draw" | "erase">("draw");

  const syncInput = useCallback(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      onInputChange(extractMnistInput(canvas));
    }
  }, [canvasRef, onInputChange]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    drawDefaultDigit(canvas);
    onInputChange(extractMnistInput(canvas));
  }, [canvasRef, onInputChange]);

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const { x, y } = getPointerPosition(event);

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = activeTool === "erase" ? 3.4 : 2.8;
    context.strokeStyle = activeTool === "erase" ? "black" : "white";
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!modelLoaded) {
      return;
    }

    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const context = event.currentTarget.getContext("2d");
    const { x, y } = getPointerPosition(event);

    context?.beginPath();
    context?.moveTo(x, y);
    draw(event);
  }

  function stopDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) {
      return;
    }

    drawingRef.current = false;
    event.currentTarget.getContext("2d")?.beginPath();
    syncInput();
  }

  return (
    <Panel className="p-5">
      <SectionTitle>Input</SectionTitle>
      <div className="mt-5 rounded-[9px] border border-[#dce4f2] bg-white p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={28}
            height={28}
            aria-label="Draw a digit"
            aria-disabled={!modelLoaded}
            className={`aspect-square w-full touch-none rounded-[8px] border border-[#19254a] bg-black ${
              modelLoaded ? "cursor-crosshair" : "cursor-not-allowed opacity-55"
            }`}
            style={{
              imageRendering: "pixelated",
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
            onPointerDown={startDrawing}
            onPointerMove={(event) => {
              if (drawingRef.current) {
                draw(event);
              }
            }}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
          />
          {!modelLoaded ? (
            <div className="absolute inset-0 grid place-items-center rounded-[8px] border border-dashed border-[#b9c5e6] bg-white/72 px-5 text-center text-[14px] font-black text-[#263a6f]">
              Upload a model to enable drawing and inference.
            </div>
          ) : null}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <button
            type="button"
            aria-label="Draw mode"
            disabled={!modelLoaded}
            aria-pressed={activeTool === "draw"}
            className={`grid h-12 place-items-center rounded-[8px] border transition disabled:cursor-not-allowed disabled:opacity-45 ${
              activeTool === "draw"
                ? "border-[#5e3dff] bg-[#f9f7ff] text-[#3e21ff]"
                : "border-[#dce4f2] bg-white text-[#071854] hover:border-[#aab8dc]"
            }`}
            onClick={() => setActiveTool("draw")}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            aria-label="Erase mode"
            disabled={!modelLoaded}
            aria-pressed={activeTool === "erase"}
            className={`grid h-12 place-items-center rounded-[8px] border transition disabled:cursor-not-allowed disabled:opacity-45 ${
              activeTool === "erase"
                ? "border-[#5e3dff] bg-[#f9f7ff] text-[#3e21ff]"
                : "border-[#dce4f2] bg-white text-[#071854] hover:border-[#aab8dc]"
            }`}
            onClick={() => setActiveTool("erase")}
          >
            <EraserIcon />
          </button>
          <button
            type="button"
            aria-label="Clear drawing"
            disabled={!modelLoaded}
            className="grid h-12 place-items-center rounded-[8px] border border-[#dce4f2] bg-white text-[#071854] transition hover:border-[#aab8dc] disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => {
              const canvas = canvasRef.current;

              if (canvas) {
                clearCanvas(canvas);
                syncInput();
              }
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </Panel>
  );
}

function NetworkPanel({
  svgRef,
  model,
  modelInput,
  rawInput,
  debug,
  selectedNeuron,
  onSelectNeuron,
  contributionThreshold,
  onContributionThresholdChange,
  topKEdges,
  onTopKEdgesChange,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  model: MlpModel | null;
  modelInput: Float32Array;
  rawInput: Float32Array;
  debug: ForwardDebug | null;
  selectedNeuron: SelectedNeuron;
  onSelectNeuron: (selection: SelectedNeuron) => void;
  contributionThreshold: number;
  onContributionThresholdChange: (threshold: number) => void;
  topKEdges: number;
  onTopKEdgesChange: (count: number) => void;
}) {
  const layerSizes = useMemo(
    () =>
      model
        ? [model.inputSize, ...model.layers.map((layer) => layer.outputSize)]
        : fallbackArchitecture,
    [model],
  );
  const width = networkSvgWidth;
  const height = networkSvgHeight;
  const inputEdgeIndices = useMemo(() => inputEdgeSourceIndices(rawInput), [rawInput]);
  const layerX = (layerIndex: number) =>
    networkLayerX(layerIndex, layerSizes.length);
  const displayLayers = useMemo(
    () =>
      layerSizes.map((size, layerIndex) => ({
        size,
        label:
          layerIndex === 0
            ? "Input"
            : layerIndex === layerSizes.length - 1
              ? "Output"
              : `Hidden Layer ${layerIndex}`,
        indices:
          layerIndex === 0
            ? inputEdgeIndices
            : layerIndex === layerSizes.length - 1
              ? digitLabels
              : sampleIndicesWithPinned(
                  size,
                  6,
                  selectedNeuron.layerIndex === layerIndex - 1
                    ? selectedNeuron.neuronIndex
                    : null,
                ),
      })),
    [
      inputEdgeIndices,
      layerSizes,
      selectedNeuron.layerIndex,
      selectedNeuron.neuronIndex,
    ],
  );
  const canSelectHiddenNeuron = Boolean(model);
  const visibleEdgeKeys = useMemo(() => {
    const keys = new Set<string>();

    if (!model) {
      return keys;
    }

    const limit = Math.max(1, Math.min(20, topKEdges));

    displayLayers.slice(1).forEach((targetLayer, targetDisplayIndex) => {
      const sourceLayer = displayLayers[targetDisplayIndex];
      const denseLayer = model.layers[targetDisplayIndex];
      const scoredEdges: EdgeScore[] = [];
      const isOutputLayer = targetDisplayIndex === model.layers.length - 1;
      const targetIndices =
        isOutputLayer && debug?.predictedClass !== undefined
          ? targetLayer.indices.filter((targetIndex) => targetIndex === debug.predictedClass)
          : targetLayer.indices;

      sourceLayer.indices.forEach((sourceIndex) => {
        targetIndices.forEach((targetIndex) => {
          const weight =
            denseLayer.weights[sourceIndex * denseLayer.outputSize + targetIndex] ?? 0;
          const activation =
            targetDisplayIndex === 0
              ? modelInput[sourceIndex] ?? 0
              : debug?.activations[targetDisplayIndex - 1]?.[sourceIndex] ?? 0;
          const magnitude = Math.abs(weight * activation);

          if (magnitude >= contributionThreshold) {
            scoredEdges.push({
              key: `${targetDisplayIndex}-${sourceIndex}-${targetIndex}`,
              sourceIndex,
              targetIndex,
              magnitude,
            });
          }
        });
      });

      sourceLayer.indices.forEach((sourceIndex) => {
        scoredEdges
          .filter((edge) => edge.sourceIndex === sourceIndex)
          .sort((left, right) => right.magnitude - left.magnitude)
          .slice(0, limit)
          .forEach((edge) => keys.add(edge.key));
      });

      targetIndices.forEach((targetIndex) => {
        scoredEdges
          .filter((edge) => edge.targetIndex === targetIndex)
          .sort((left, right) => right.magnitude - left.magnitude)
          .slice(0, limit)
          .forEach((edge) => keys.add(edge.key));
      });
    });

    return keys;
  }, [contributionThreshold, debug, displayLayers, model, modelInput, topKEdges]);

  return (
    <Panel className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <SectionTitle>Network (MLP)</SectionTitle>
        </div>
        <div className="text-[13px] font-bold text-[#50608a]">
          Edge color: blue = positive, pink = negative
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="MLP network visualization"
          className="min-w-[900px]"
        >
          {displayLayers.map((layer, layerIndex) => {
            const x = layerX(layerIndex);
            return (
              <g key={layer.label}>
                <text
                  x={x}
                  y={24}
                  textAnchor="middle"
                  className="fill-[#071854] text-[13px] font-black"
                >
                  {layer.label}
                </text>
                <text
                  x={x}
                  y={44}
                  textAnchor="middle"
                  className="fill-[#071854] font-mono text-[13px] font-black"
                >
                  {layer.size}
                </text>
              </g>
            );
          })}

          {model
            ? displayLayers.slice(1).flatMap((targetLayer, targetDisplayIndex) => {
                if (targetDisplayIndex === 0) {
                  return [];
                }

                const sourceLayer = displayLayers[targetDisplayIndex];
                const denseLayer = model.layers[targetDisplayIndex];
                const sourceX = layerX(targetDisplayIndex);
                const targetX = layerX(targetDisplayIndex + 1);

                return sourceLayer.indices.flatMap((sourceIndex, sourcePosition) =>
                  targetLayer.indices.map((targetIndex, targetPosition) => {
                    const edgeKey = `${targetDisplayIndex}-${sourceIndex}-${targetIndex}`;
                    const isOutputLayer = targetDisplayIndex === model.layers.length - 1;

                    if (isOutputLayer && debug?.predictedClass !== targetIndex) {
                      return null;
                    }

                    if (!visibleEdgeKeys.has(edgeKey)) {
                      return null;
                    }

                    const sourceY = nodeY(sourcePosition, sourceLayer.indices.length);
                    const targetY = nodeY(targetPosition, targetLayer.indices.length);
                    const sourceAnchorX = sourceX + 15;
                    const targetAnchorX = targetX - 15;
                    const weight =
                      denseLayer.weights[sourceIndex * denseLayer.outputSize + targetIndex] ?? 0;
                    const activation =
                      targetDisplayIndex === 0
                        ? modelInput[sourceIndex] ?? 0
                        : debug?.activations[targetDisplayIndex - 1]?.[sourceIndex] ?? 0;
                    const strength = Math.min(0.9, Math.abs(weight * activation) * 1.6);

                    return (
                      <path
                        key={edgeKey}
                        d={`M ${sourceAnchorX} ${sourceY} C ${sourceAnchorX + 70} ${sourceY}, ${targetAnchorX - 70} ${targetY}, ${targetAnchorX} ${targetY}`}
                        fill="none"
                        stroke={weight >= 0 ? "#185cff" : "#ff1e76"}
                        strokeOpacity={0.08 + strength}
                        strokeWidth={0.7 + strength * 3}
                      />
                    );
                  }),
                );
              })
            : null}

          {displayLayers.map((layer, layerIndex) => {
            if (layerIndex === 0) {
              return null;
            }

            const x = layerX(layerIndex);
            return layer.indices.map((nodeIndex, position) => {
              const y = nodeY(position, layer.indices.length);
              const isInput = layerIndex === 0;
              const isOutput = layerIndex === displayLayers.length - 1;
              const denseIndex = layerIndex - 1;
              const activation =
                isInput
                  ? rawInput[nodeIndex] ?? 0
                  : debug?.activations[denseIndex]?.[nodeIndex] ?? 0;
              const isSelected =
                !isInput &&
                !isOutput &&
                selectedNeuron.layerIndex === denseIndex &&
                selectedNeuron.neuronIndex === nodeIndex;

              return (
                <g
                  key={`${layerIndex}-${nodeIndex}`}
                  role={!isOutput && canSelectHiddenNeuron ? "button" : undefined}
                  tabIndex={!isOutput && canSelectHiddenNeuron ? 0 : undefined}
                  onClick={() => {
                    if (!isOutput && canSelectHiddenNeuron) {
                      onSelectNeuron({ layerIndex: denseIndex, neuronIndex: nodeIndex });
                    }
                  }}
                  className={!isOutput && canSelectHiddenNeuron ? "cursor-pointer" : ""}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 17 : 14}
                    fill={isOutput ? "#fff" : layerColor(layerIndex)}
                    stroke={isOutput ? "#071854" : "#fff"}
                    strokeWidth={isSelected ? 4 : 2}
                    opacity={0.42 + Math.min(0.58, Math.abs(activation))}
                  />
                  {isSelected ? (
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      className="fill-white font-mono text-[12px] font-black"
                    >
                      {nodeIndex}
                    </text>
                  ) : null}
                  {isOutput ? (
                    <text
                      x={x + 26}
                      y={y + 5}
                      className={`font-mono text-[13px] font-black ${
                        debug?.predictedClass === nodeIndex
                          ? "fill-[#fa1167]"
                          : "fill-[#071854]"
                      }`}
                    >
                      {nodeIndex}
                    </text>
                  ) : null}
                </g>
              );
            });
          })}
        </svg>
      </div>
      <div className="mt-4 grid gap-3 rounded-[10px] border border-[#dce4f2] bg-[#fbfcff] p-4 lg:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)] lg:items-center">
        <label className="min-w-0">
          <span className="text-[13px] font-bold text-[#263a6f]">
            Contribution threshold
          </span>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={contributionThreshold}
              disabled={!model}
              className="accent-[#4b23ff] disabled:opacity-45"
              onChange={(event) =>
                onContributionThresholdChange(Number(event.currentTarget.value))
              }
            />
            <span className="font-mono text-[14px] font-black text-[#071854]">
              {contributionThreshold.toFixed(2)}
            </span>
          </div>
        </label>
        <label className="rounded-[8px] border border-[#dce4f2] bg-white px-3 py-2 text-[13px] font-bold text-[#263a6f]">
          Top-K edges per displayed pixel/neuron
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-3">
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={topKEdges}
              disabled={!model}
              className="accent-[#4b23ff] disabled:opacity-45"
              onChange={(event) => onTopKEdgesChange(Number(event.currentTarget.value))}
            />
            <span className="font-mono text-[14px] font-black text-[#071854]">
              {topKEdges}
            </span>
          </div>
        </label>
        <p className="text-[13px] leading-6 font-bold text-[#263a6f]">
          Contribution edges enter from the adjacent input canvas and preserve
          each source pixel&apos;s 28x28 position.
        </p>
      </div>
    </Panel>
  );
}

function CanvasContributionOverlay({
  containerRef,
  canvasRef,
  networkSvgRef,
  model,
  modelInput,
  rawInput,
  selectedNeuron,
  contributionThreshold,
  topKEdges,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  networkSvgRef: React.RefObject<SVGSVGElement | null>;
  model: MlpModel | null;
  modelInput: Float32Array;
  rawInput: Float32Array;
  selectedNeuron: SelectedNeuron;
  contributionThreshold: number;
  topKEdges: number;
}) {
  const [geometry, setGeometry] = useState<{
    container: DOMRect;
    canvas: DOMRect;
    networkSvg: DOMRect;
    networkTransform: {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
      f: number;
    } | null;
  } | null>(null);
  const layerSizes = model
    ? [model.inputSize, ...model.layers.map((layer) => layer.outputSize)]
    : fallbackArchitecture;
  const inputIndices = useMemo(() => inputEdgeSourceIndices(rawInput), [rawInput]);
  const targetIndices = useMemo(() => {
    const firstLayerSize = model?.layers[0]?.outputSize ?? fallbackArchitecture[1];

    return sampleIndicesWithPinned(
      firstLayerSize,
      6,
      selectedNeuron.layerIndex === 0 ? selectedNeuron.neuronIndex : null,
    );
  }, [model, selectedNeuron.layerIndex, selectedNeuron.neuronIndex]);
  const edges = useMemo(() => {
    const firstLayer = model?.layers[0];

    if (!firstLayer) {
      return [];
    }

    const scoredEdges: ContributionEdge[] = [];

    inputIndices.forEach((sourceIndex) => {
      targetIndices.forEach((targetIndex) => {
        const weight =
          firstLayer.weights[sourceIndex * firstLayer.outputSize + targetIndex] ?? 0;
        const magnitude = Math.abs((modelInput[sourceIndex] ?? 0) * weight);

        if (magnitude >= contributionThreshold) {
          scoredEdges.push({
            key: `canvas-${sourceIndex}-${targetIndex}`,
            sourceIndex,
            targetIndex,
            weight,
            magnitude,
          });
        }
      });
    });

    return selectVisibleContributionEdges(
      scoredEdges,
      inputIndices,
      targetIndices,
      topKEdges,
    );
  }, [contributionThreshold, inputIndices, model, modelInput, targetIndices, topKEdges]);

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const networkSvg = networkSvgRef.current;

      if (!container || !canvas || !networkSvg) {
        setGeometry(null);
        return;
      }

      setGeometry({
        container: container.getBoundingClientRect(),
        canvas: canvas.getBoundingClientRect(),
        networkSvg: networkSvg.getBoundingClientRect(),
        networkTransform: networkSvg.getScreenCTM()
          ? {
              a: networkSvg.getScreenCTM()?.a ?? 1,
              b: networkSvg.getScreenCTM()?.b ?? 0,
              c: networkSvg.getScreenCTM()?.c ?? 0,
              d: networkSvg.getScreenCTM()?.d ?? 1,
              e: networkSvg.getScreenCTM()?.e ?? 0,
              f: networkSvg.getScreenCTM()?.f ?? 0,
            }
          : null,
      });
    }

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [canvasRef, containerRef, networkSvgRef, rawInput, model]);

  if (!geometry || edges.length === 0 || !model) {
    return null;
  }

  const width = geometry.container.width;
  const height = geometry.container.height;
  const svgPointToContainerPoint = (svgX: number, svgY: number) => {
    if (geometry.networkTransform) {
      const screenX =
        geometry.networkTransform.a * svgX +
        geometry.networkTransform.c * svgY +
        geometry.networkTransform.e;
      const screenY =
        geometry.networkTransform.b * svgX +
        geometry.networkTransform.d * svgY +
        geometry.networkTransform.f;
      return {
        x: screenX - geometry.container.left,
        y: screenY - geometry.container.top,
      };
    }

    return {
      x:
        geometry.networkSvg.left -
        geometry.container.left +
        (svgX / networkSvgWidth) * geometry.networkSvg.width,
      y:
        geometry.networkSvg.top -
        geometry.container.top +
        (svgY / networkSvgHeight) * geometry.networkSvg.height,
    };
  };
  const canvasPixelPoint = (pixelIndex: number) => {
    const column = pixelIndex % 28;
    const row = Math.floor(pixelIndex / 28);

    return {
      x:
        geometry.canvas.left -
        geometry.container.left +
        ((column + 1) / 28) * geometry.canvas.width,
      y:
        geometry.canvas.top -
        geometry.container.top +
        ((row + 0.5) / 28) * geometry.canvas.height,
    };
  };
  const hiddenNodePoint = (targetIndex: number) => {
    const position = Math.max(0, targetIndices.indexOf(targetIndex));
    const radius =
      selectedNeuron.layerIndex === 0 && selectedNeuron.neuronIndex === targetIndex
        ? 17
        : 14;

    return svgPointToContainerPoint(
      networkLayerX(1, layerSizes.length) - radius,
      nodeY(position, targetIndices.length),
    );
  };

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
    >
      {edges.map((edge) => {
        const source = canvasPixelPoint(edge.sourceIndex);
        const target = hiddenNodePoint(edge.targetIndex);
        const strength = Math.min(0.9, edge.magnitude * 1.6);

        return (
          <path
            key={edge.key}
            d={`M ${source.x} ${source.y} C ${source.x + 90} ${source.y}, ${target.x - 90} ${target.y}, ${target.x} ${target.y}`}
            fill="none"
            stroke={edge.weight >= 0 ? "#185cff" : "#ff1e76"}
            strokeOpacity={0.12 + strength}
            strokeWidth={0.75 + strength * 3.2}
          />
        );
      })}
    </svg>
  );
}

function nodeY(position: number, count: number) {
  return 70 + (position * 230) / Math.max(1, count - 1);
}

function layerColor(layerIndex: number) {
  if (layerIndex === 1) {
    return "#5b24ff";
  }

  if (layerIndex === 2) {
    return "#1979ee";
  }

  return "#10c9df";
}

function OutputPanel({ debug }: { debug: ForwardDebug | null }) {
  const probabilities = debug?.probabilities ?? new Float32Array(10);
  const predictedClass = debug?.predictedClass ?? null;
  const confidence = debug?.confidence ?? 0;

  return (
    <Panel className="p-5">
      <SectionTitle>Output (Softmax)</SectionTitle>
      <div className="mt-6 space-y-3">
        {digitLabels.map((digit) => {
          const value = probabilities[digit] ?? 0;
          const active = predictedClass === digit;

          return (
            <div
              key={digit}
              className={`grid grid-cols-[20px_minmax(0,1fr)_66px] items-center gap-3 font-mono text-[14px] font-black ${
                active ? "text-[#fa1167]" : "text-[#071854]"
              }`}
            >
              <span>{digit}</span>
              <span className="h-[5px] overflow-hidden rounded-full bg-[#e4e8f0]">
                <span
                  className={`block h-full rounded-full ${active ? "bg-[#fa1167]" : "bg-[#b7bfce]"}`}
                  style={{ width: `${Math.max(2, value * 100)}%` }}
                />
              </span>
              <span className="text-right">{formatPercent(value)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-8 grid grid-cols-2 rounded-[12px] border border-[#ff9fbd] bg-[#fff7fa] text-center">
        <div className="border-r border-[#ffd2df] px-4 py-5">
          <p className="text-[12px] font-black text-[#fa1167] uppercase">
            Predicted class
          </p>
          <p className="mt-2 text-[42px] leading-none font-black text-[#fa1167]">
            {predictedClass ?? "-"}
          </p>
        </div>
        <div className="px-4 py-5">
          <p className="text-[12px] font-black text-[#fa1167] uppercase">
            Confidence
          </p>
          <p className="mt-3 text-[31px] leading-none font-black text-[#fa1167]">
            {formatPercent(confidence)}
          </p>
        </div>
      </div>
    </Panel>
  );
}

function NeuronDetails({
  model,
  input,
  debug,
  selectedNeuron,
}: {
  model: MlpModel | null;
  input: Float32Array;
  debug: ForwardDebug | null;
  selectedNeuron: SelectedNeuron;
}) {
  const layer = model?.layers[selectedNeuron.layerIndex];
  const previousActivation =
    selectedNeuron.layerIndex === 0
      ? input
      : debug?.activations[selectedNeuron.layerIndex - 1] ?? null;
  const contributors =
    layer && previousActivation
      ? topContributors(layer, previousActivation, selectedNeuron.neuronIndex)
      : [];
  const activation =
    debug?.activations[selectedNeuron.layerIndex]?.[selectedNeuron.neuronIndex] ?? 0;
  const preActivation =
    debug?.preActivations[selectedNeuron.layerIndex]?.[selectedNeuron.neuronIndex] ?? 0;

  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionTitle>A. Selected Neuron Details</SectionTitle>
          <p className="mt-4 text-[15px] font-black text-[#071854]">
            Hidden Layer {selectedNeuron.layerIndex + 1} <span className="px-2">.</span>{" "}
            Neuron {selectedNeuron.neuronIndex}
          </p>
        </div>
        <div className="rounded-[8px] border border-[#8be4ee] bg-[#ecfeff] px-4 py-2 font-mono text-[14px] font-black text-[#071854]">
          Activation <span className="ml-4">{formatNumber(activation)}</span>
        </div>
      </div>
      <p className="mt-5 text-[13px] font-black text-[#263a6f]">
        Top upstream contributors
      </p>
      <div className="mt-3 overflow-hidden rounded-[8px] border border-[#e2e8f4]">
        <div className="grid grid-cols-4 bg-[#fbfcff] px-3 py-2 text-[12px] font-black text-[#50608a]">
          <span>Neuron</span>
          <span>Activation</span>
          <span>Weight</span>
          <span className="text-right">Contribution</span>
        </div>
        {contributors.length > 0 ? (
          contributors.map((item) => (
            <div
              key={item.neuron}
              className="grid grid-cols-4 border-t border-[#edf1f8] px-3 py-2 font-mono text-[13px] font-black text-[#071854]"
            >
              <span>{item.neuron}</span>
              <span>{formatNumber(item.activation)}</span>
              <span>{formatNumber(item.weight)}</span>
              <span
                className={`text-right ${
                  item.contribution >= 0 ? "text-[#185cff]" : "text-[#fa1167]"
                }`}
              >
                {item.contribution >= 0 ? "+" : ""}
                {formatNumber(item.contribution)}
              </span>
            </div>
          ))
        ) : (
          <div className="border-t border-[#edf1f8] px-3 py-4 text-[13px] font-bold text-[#50608a]">
            Upload a model and select a hidden neuron after inference.
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 rounded-[10px] border border-[#dfe5f3] text-center">
        <div className="border-r border-[#dfe5f3] px-4 py-4">
          <p className="text-[12px] font-bold text-[#50608a]">Pre-activation (z)</p>
          <p className="mt-2 font-mono text-[16px] font-black text-[#071854]">
            {formatNumber(preActivation)}
          </p>
        </div>
        <div className="px-4 py-4">
          <p className="text-[12px] font-bold text-[#50608a]">Activation (a)</p>
          <p className="mt-2 font-mono text-[16px] font-black text-[#071854]">
            {formatNumber(activation)}
          </p>
        </div>
      </div>
    </Panel>
  );
}

function ContributionMatrix({
  model,
  input,
  debug,
  selectedNeuron,
}: {
  model: MlpModel | null;
  input: Float32Array;
  debug: ForwardDebug | null;
  selectedNeuron: SelectedNeuron;
}) {
  const layer = model?.layers[selectedNeuron.layerIndex];
  const previousActivation =
    selectedNeuron.layerIndex === 0
      ? input
      : debug?.activations[selectedNeuron.layerIndex - 1] ?? null;
  const fromIndices = layer ? sampleIndices(layer.inputSize, Math.min(64, layer.inputSize)) : [];
  const toIndices = layer ? sampleIndices(layer.outputSize, Math.min(32, layer.outputSize)) : [];
  const cells =
    layer && previousActivation
      ? toIndices.flatMap((toIndex) =>
          fromIndices.map((fromIndex) => {
            const value =
              (previousActivation[fromIndex] ?? 0) *
              (layer.weights[fromIndex * layer.outputSize + toIndex] ?? 0);
            return { toIndex, fromIndex, value };
          }),
        )
      : [];
  const maxAbs = Math.max(0.001, ...cells.map((cell) => Math.abs(cell.value)));

  return (
    <Panel className="p-5">
      <SectionTitle>B. Effective Contributions Matrix</SectionTitle>
      <p className="mt-4 text-[13px] font-bold text-[#263a6f]">
        From previous layer to Hidden Layer {selectedNeuron.layerIndex + 1}
      </p>
      <div className="mt-5 overflow-x-auto">
        <div
          className="grid min-w-[520px] border border-[#dce4f2]"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, fromIndices.length)}, minmax(0, 1fr))`,
          }}
        >
          {cells.length > 0 ? (
            cells.map((cell) => (
              <span
                key={`${cell.toIndex}-${cell.fromIndex}`}
                title={`${cell.fromIndex} -> ${cell.toIndex}: ${formatNumber(cell.value)}`}
                className={`aspect-square border-r border-b border-white/35 ${
                  cell.toIndex === selectedNeuron.neuronIndex
                    ? "outline outline-1 outline-[#071854]"
                    : ""
                }`}
                style={{
                  backgroundColor: contributionColor(cell.value / maxAbs),
                }}
              />
            ))
          ) : (
            <div className="col-span-full p-8 text-[13px] font-bold text-[#50608a]">
              Upload a supported MLP ONNX model to inspect contribution matrices.
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-between font-mono text-[12px] font-black text-[#50608a]">
        <span>negative</span>
        <span>0</span>
        <span>positive</span>
      </div>
    </Panel>
  );
}

function contributionColor(normalized: number) {
  const value = Math.max(-1, Math.min(1, normalized));

  if (value >= 0) {
    const light = 96 - value * 45;
    return `hsl(226 92% ${light}%)`;
  }

  const light = 96 - Math.abs(value) * 42;
  return `hsl(338 94% ${light}%)`;
}

function SaliencyMap({
  model,
  input,
  debug,
}: {
  model: MlpModel | null;
  input: Float32Array;
  debug: ForwardDebug | null;
}) {
  const saliency = useMemo(
    () => (model && debug ? computeInputSaliency(model, debug, input) : new Float32Array(784)),
    [debug, input, model],
  );
  const maxAbs = Math.max(0.0001, ...Array.from(saliency, Math.abs));

  return (
    <Panel className="p-5">
      <SectionTitle>C. Input Saliency Map</SectionTitle>
      <p className="mt-4 text-[13px] font-bold text-[#263a6f]">
        Influence on predicted class {debug?.predictedClass ?? "-"}
      </p>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_50px] items-center gap-5">
        <div
          className="grid aspect-square border border-[#dce4f2]"
          style={{ gridTemplateColumns: "repeat(28, minmax(0, 1fr))" }}
        >
          {Array.from(saliency).map((value, index) => (
            <span
              key={index}
              className="border-r border-b border-[#edf1f8]"
              style={{ backgroundColor: contributionColor(value / maxAbs) }}
            />
          ))}
        </div>
        <div className="space-y-3 text-[12px] font-black text-[#071854]">
          <div className="h-44 bg-[linear-gradient(180deg,#153fff,#fff_50%,#fa1167)]" />
          <p>More positive</p>
          <p className="pt-8">More negative</p>
        </div>
      </div>
      <p className="mt-4 text-[13px] font-bold text-[#50608a]">
        Blue increases the predicted digit score; pink decreases it.
      </p>
    </Panel>
  );
}

export function MnistMlpInferenceDebuggerPlayground() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRowRef = useRef<HTMLDivElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const networkSvgRef = useRef<SVGSVGElement>(null);
  const [model, setModel] = useState<MlpModel | null>(null);
  const [input, setInput] = useState(() => new Float32Array(784));
  const [inputRevision, setInputRevision] = useState(0);
  const [preprocessingMode, setPreprocessingMode] =
    useState<MnistPreprocessingMode>("mnist-standard");
  const [contributionThreshold, setContributionThreshold] = useState(0.02);
  const [topKEdges, setTopKEdges] = useState(20);
  const [debug, setDebug] = useState<ForwardDebug | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [message, setMessage] = useState("Drop a dense MNIST ONNX model to begin.");
  const [selectedNeuron, setSelectedNeuron] = useState<SelectedNeuron>({
    layerIndex: 1,
    neuronIndex: 0,
  });

  const architecture = model
    ? [model.inputSize, ...model.layers.map((layer) => layer.outputSize)].join("-")
    : fallbackArchitecture.join("-");
  const activationName = model
    ? Array.from(new Set(model.layers.map((layer) => layer.activation).filter((item) => item !== "linear"))).join(", ") || "Linear"
    : "ReLU";
  const modelInput = useMemo(
    () => preprocessMnistInput(input, preprocessingMode),
    [input, preprocessingMode],
  );

  const runInference = useCallback(async () => {
    if (!model) {
      return;
    }

    setRunState("running");
    setMessage("Running dense layers on WebGPU...");

    try {
      const gpuLogits = await runMlpWebGpu(model, modelInput);
      const cpuDebug = runMlpCpu(model, modelInput);
      const gpuProbabilities = softmax(gpuLogits);
      let predictedClass = 0;

      for (let index = 1; index < gpuProbabilities.length; index += 1) {
        if (gpuProbabilities[index] > gpuProbabilities[predictedClass]) {
          predictedClass = index;
        }
      }

      setDebug({
        ...cpuDebug,
        logits: gpuLogits,
        probabilities: gpuProbabilities,
        predictedClass,
        confidence: gpuProbabilities[predictedClass],
      });
      setRunState("done");
      setMessage("Inference completed with WebGPU.");
    } catch (error) {
      setRunState("error");
      setMessage(error instanceof Error ? error.message : "Inference failed.");
    }
  }, [model, modelInput]);

  const handleInputChange = useCallback((nextInput: Float32Array) => {
    setInput(new Float32Array(nextInput));
    setInputRevision((revision) => revision + 1);
  }, []);

  async function loadFile(file: File) {
    setRunState("idle");
    setMessage("Reading ONNX graph...");

    try {
      const parsedModel = parseOnnxMlpModel(await file.arrayBuffer(), file.name);
      const hiddenLayerIndex = Math.max(0, Math.min(parsedModel.layers.length - 2, 2));
      const hiddenLayer = parsedModel.layers[hiddenLayerIndex];

      setModel(parsedModel);
      setDebug(null);
      setSelectedNeuron({
        layerIndex: hiddenLayerIndex,
        neuronIndex: Math.min(18, hiddenLayer.outputSize - 1),
      });
      setRunState("ready");
      setMessage("Model loaded. Run inference to inspect activations.");
    } catch (error) {
      setModel(null);
      setDebug(null);
      setRunState("error");
      setMessage(error instanceof Error ? error.message : "Could not parse the ONNX file.");
    }
  }

  useEffect(() => {
    if (model) {
      const handle = window.setTimeout(() => {
        void runInference();
      }, 350);

      return () => window.clearTimeout(handle);
    }

    return undefined;
  }, [inputRevision, model, runInference]);

  return (
    <main
      className="min-h-screen bg-[#fbfcff] px-4 py-4 text-[#071024] sm:px-6 lg:px-8"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];

        if (file) {
          void loadFile(file);
        }
      }}
    >
      <div className="mx-auto max-w-[1900px]">
        <header className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
            <h1 className="text-[27px] leading-none font-black tracking-normal text-[#071024] sm:text-[36px]">
              MNIST MLP Inference Debugger
            </h1>
            <p className="mt-2 text-[16px] font-bold text-[#6b779f] sm:text-[19px]">
              Upload a model and inspect a single inference
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".onnx,application/octet-stream"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  void loadFile(file);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-14 items-center gap-3 rounded-[12px] border border-[#a990ff] bg-[#fbf9ff] px-6 text-[16px] font-black text-[#381cff] transition hover:border-[#381cff]"
            >
              <UploadIcon />
              Upload model
            </button>
            <ArchitecturePill label="File" value={model?.fileName ?? "mnist_mlp.onnx"} />
            <ArchitecturePill label="Architecture" value={architecture} />
            <ArchitecturePill label="Activation" value={activationName} />
            <div className="min-w-[220px] rounded-[12px] border border-[#e2e7f4] bg-white px-5 py-3">
              <p className="text-[12px] font-black text-[#7180a8]">
                Preprocess
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {preprocessingOptions.map((option) => {
                  const isActive = preprocessingMode === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isActive}
                      className={`rounded-[7px] border px-2 py-1.5 text-[12px] font-black transition ${
                        isActive
                          ? "border-[#381cff] bg-[#f5f2ff] text-[#381cff]"
                          : "border-[#dce4f2] bg-white text-[#263a6f] hover:border-[#aab8dc]"
                      }`}
                      onClick={() => setPreprocessingMode(option.id)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <div
          className={`mt-4 rounded-[10px] border px-4 py-3 text-[13px] font-bold ${
            runState === "error"
              ? "border-[#ffadc7] bg-[#fff4f8] text-[#bd0043]"
              : "border-[#d8e0f3] bg-white text-[#263a6f]"
          }`}
        >
          {message}
        </div>

        <div
          ref={topRowRef}
          className="relative mt-4 grid gap-4 2xl:grid-cols-[390px_minmax(0,1fr)_390px]"
        >
          <InputPanel
            canvasRef={drawingCanvasRef}
            onInputChange={handleInputChange}
            modelLoaded={Boolean(model)}
          />
          <NetworkPanel
            svgRef={networkSvgRef}
            model={model}
            modelInput={modelInput}
            rawInput={input}
            debug={debug}
            selectedNeuron={selectedNeuron}
            onSelectNeuron={setSelectedNeuron}
            contributionThreshold={contributionThreshold}
            onContributionThresholdChange={setContributionThreshold}
            topKEdges={topKEdges}
            onTopKEdgesChange={setTopKEdges}
          />
          <OutputPanel debug={debug} />
          <CanvasContributionOverlay
            containerRef={topRowRef}
            canvasRef={drawingCanvasRef}
            networkSvgRef={networkSvgRef}
            model={model}
            modelInput={modelInput}
            rawInput={input}
            selectedNeuron={selectedNeuron}
            contributionThreshold={contributionThreshold}
            topKEdges={topKEdges}
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(360px,0.86fr)_minmax(420px,1fr)_minmax(360px,0.9fr)]">
          <NeuronDetails
            model={model}
            input={modelInput}
            debug={debug}
            selectedNeuron={selectedNeuron}
          />
          <ContributionMatrix
            model={model}
            input={modelInput}
            debug={debug}
            selectedNeuron={selectedNeuron}
          />
          <SaliencyMap model={model} input={modelInput} debug={debug} />
        </div>
      </div>
    </main>
  );
}
