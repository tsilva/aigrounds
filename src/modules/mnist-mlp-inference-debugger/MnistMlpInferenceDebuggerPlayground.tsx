"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  computeInputSaliency,
  normalizeMnistInput,
  parseOnnxMlpModel,
  runMlpCpu,
  runMlpWebGpu,
  softmax,
  topContributors,
  type ForwardDebug,
  type MlpModel,
} from "./mnist-mlp-engine";

type RunState = "idle" | "ready" | "running" | "done" | "error";

type SelectedNeuron = {
  layerIndex: number;
  neuronIndex: number;
};

const fallbackArchitecture = [784, 128, 64, 32, 10];
const digitLabels = Array.from({ length: 10 }, (_, index) => index);

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

function drawDefaultDigit(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "black";
  context.lineWidth = 24;
  context.beginPath();
  context.moveTo(82, 64);
  context.quadraticCurveTo(136, 52, 206, 50);
  context.quadraticCurveTo(226, 51, 218, 72);
  context.lineTo(150, 156);
  context.quadraticCurveTo(132, 184, 127, 224);
  context.stroke();
}

function clearCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.fillStyle = "white";
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
      let darkness = 0;
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

          darkness += 1 - luminance / 255;
          samples += 1;
        }
      }

      values.push(samples > 0 ? darkness / samples : 0);
    }
  }

  return normalizeMnistInput(values);
}

function InputPanel({
  input,
  onInputChange,
  onRun,
  disabled,
}: {
  input: Float32Array;
  onInputChange: (input: Float32Array) => void;
  onRun: () => void;
  disabled: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const erasingRef = useRef(false);

  const syncInput = useCallback(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      onInputChange(extractMnistInput(canvas));
    }
  }, [onInputChange]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    drawDefaultDigit(canvas);
    onInputChange(extractMnistInput(canvas));
  }, [onInputChange]);

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const { x, y } = getPointerPosition(event);

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = erasingRef.current ? 28 : 22;
    context.strokeStyle = erasingRef.current ? "white" : "black";
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
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
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          aria-label="Draw a digit"
          className="aspect-square w-full cursor-crosshair touch-none rounded-[8px] bg-white"
          style={{
            backgroundImage:
              "linear-gradient(#edf1f8 1px, transparent 1px), linear-gradient(90deg, #edf1f8 1px, transparent 1px)",
            backgroundSize: "14px 14px",
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
        <div className="mt-4 grid grid-cols-3 gap-3">
          <button
            type="button"
            aria-label="Draw mode"
            className="grid h-12 place-items-center rounded-[8px] border border-[#5e3dff] bg-[#f9f7ff] text-[#3e21ff]"
            onClick={() => {
              erasingRef.current = false;
            }}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            aria-label="Erase mode"
            className="grid h-12 place-items-center rounded-[8px] border border-[#dce4f2] bg-white text-[#071854] transition hover:border-[#aab8dc]"
            onClick={() => {
              erasingRef.current = true;
            }}
          >
            <EraserIcon />
          </button>
          <button
            type="button"
            aria-label="Clear drawing"
            className="grid h-12 place-items-center rounded-[8px] border border-[#dce4f2] bg-white text-[#071854] transition hover:border-[#aab8dc]"
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

      <div className="mt-5">
        <div className="flex items-center justify-between text-[13px] font-black text-[#263a6f]">
          <span>28x28 pixel preview</span>
          <button
            type="button"
            onClick={onRun}
            disabled={disabled}
            className="rounded-[8px] border border-[#d8e0f3] px-3 py-1 text-[#251cff] transition enabled:hover:border-[#251cff] disabled:cursor-not-allowed disabled:text-[#92a0c1]"
          >
            Run
          </button>
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_42px_34px] items-center gap-4">
          <div
            className="grid aspect-[2/1] border border-[#131a2f] bg-black"
            style={{ gridTemplateColumns: "repeat(28, minmax(0, 1fr))" }}
          >
            {Array.from(input).map((value, index) => (
              <span
                key={index}
                style={{ backgroundColor: `rgb(${value * 255}, ${value * 255}, ${value * 255})` }}
              />
            ))}
          </div>
          <div className="h-full bg-[linear-gradient(180deg,#fff,#000)]" />
          <div className="space-y-4 font-mono text-[13px] font-black text-[#263a6f]">
            <p>1.0</p>
            <p>0.5</p>
            <p>0.0</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function NetworkPanel({
  model,
  input,
  debug,
  selectedNeuron,
  onSelectNeuron,
}: {
  model: MlpModel | null;
  input: Float32Array;
  debug: ForwardDebug | null;
  selectedNeuron: SelectedNeuron;
  onSelectNeuron: (selection: SelectedNeuron) => void;
}) {
  const layerSizes = model
    ? [model.inputSize, ...model.layers.map((layer) => layer.outputSize)]
    : fallbackArchitecture;
  const width = 900;
  const height = 330;
  const displayLayers = layerSizes.map((size, layerIndex) => ({
    size,
    label:
      layerIndex === 0
        ? "Input"
        : layerIndex === layerSizes.length - 1
          ? "Output"
          : `Hidden Layer ${layerIndex}`,
    indices: layerIndex === layerSizes.length - 1 ? digitLabels : sampleIndices(size, 6),
  }));

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
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="MLP network visualization"
          className="min-w-[820px]"
        >
          {displayLayers.map((layer, layerIndex) => {
            const x = 52 + (layerIndex * (width - 110)) / (displayLayers.length - 1);
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
                const sourceLayer = displayLayers[targetDisplayIndex];
                const denseLayer = model.layers[targetDisplayIndex];
                const sourceX =
                  52 + (targetDisplayIndex * (width - 110)) / (displayLayers.length - 1);
                const targetX =
                  52 + ((targetDisplayIndex + 1) * (width - 110)) / (displayLayers.length - 1);

                return sourceLayer.indices.flatMap((sourceIndex, sourcePosition) =>
                  targetLayer.indices.map((targetIndex, targetPosition) => {
                    const sourceY = nodeY(sourcePosition, sourceLayer.indices.length);
                    const targetY = nodeY(targetPosition, targetLayer.indices.length);
                    const weight =
                      denseLayer.weights[sourceIndex * denseLayer.outputSize + targetIndex] ?? 0;
                    const activation =
                      targetDisplayIndex === 0
                        ? input[sourceIndex] ?? 0
                        : debug?.activations[targetDisplayIndex - 1]?.[sourceIndex] ?? 0;
                    const strength = Math.min(0.9, Math.abs(weight * activation) * 1.6);

                    return (
                      <path
                        key={`${targetDisplayIndex}-${sourceIndex}-${targetIndex}`}
                        d={`M ${sourceX + 15} ${sourceY} C ${sourceX + 75} ${sourceY}, ${targetX - 75} ${targetY}, ${targetX - 15} ${targetY}`}
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
            const x = 52 + (layerIndex * (width - 110)) / (displayLayers.length - 1);
            return layer.indices.map((nodeIndex, position) => {
              const y = nodeY(position, layer.indices.length);
              const isInput = layerIndex === 0;
              const isOutput = layerIndex === displayLayers.length - 1;
              const denseIndex = layerIndex - 1;
              const activation =
                isInput
                  ? input[nodeIndex] ?? 0
                  : debug?.activations[denseIndex]?.[nodeIndex] ?? 0;
              const isSelected =
                !isInput &&
                !isOutput &&
                selectedNeuron.layerIndex === denseIndex &&
                selectedNeuron.neuronIndex === nodeIndex;

              if (isInput) {
                return (
                  <rect
                    key={`${layerIndex}-${nodeIndex}`}
                    x={x - 8}
                    y={y - 8}
                    width={16}
                    height={16}
                    rx={2}
                    fill={`rgb(${235 - activation * 200}, ${238 - activation * 200}, ${244 - activation * 200})`}
                    stroke="#071854"
                  />
                );
              }

              return (
                <g
                  key={`${layerIndex}-${nodeIndex}`}
                  role={!isOutput ? "button" : undefined}
                  tabIndex={!isOutput ? 0 : undefined}
                  onClick={() => {
                    if (!isOutput) {
                      onSelectNeuron({ layerIndex: denseIndex, neuronIndex: nodeIndex });
                    }
                  }}
                  className={!isOutput ? "cursor-pointer" : ""}
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
            <input type="range" min="0" max="1" step="0.01" value="0.02" readOnly className="accent-[#4b23ff]" />
            <span className="font-mono text-[14px] font-black text-[#071854]">0.02</span>
          </div>
        </label>
        <div className="rounded-[8px] border border-[#dce4f2] bg-white px-3 py-2 text-[13px] font-bold text-[#263a6f]">
          Top-K edges per neuron
          <p className="mt-1 font-mono text-[#071854]">20</p>
        </div>
        <p className="text-[13px] leading-6 font-bold text-[#263a6f]">
          Edge intensity uses |activation x weight|. Node glow uses |activation|.
        </p>
      </div>
    </Panel>
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
  debug,
  selectedNeuron,
}: {
  model: MlpModel | null;
  debug: ForwardDebug | null;
  selectedNeuron: SelectedNeuron;
}) {
  const layer = model?.layers[selectedNeuron.layerIndex];
  const previousActivation =
    selectedNeuron.layerIndex === 0
      ? null
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
  debug,
  selectedNeuron,
}: {
  model: MlpModel | null;
  debug: ForwardDebug | null;
  selectedNeuron: SelectedNeuron;
}) {
  const layer = model?.layers[selectedNeuron.layerIndex];
  const previousActivation =
    selectedNeuron.layerIndex === 0
      ? null
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
  const [model, setModel] = useState<MlpModel | null>(null);
  const [input, setInput] = useState(() => new Float32Array(784));
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

  const runInference = useCallback(async () => {
    if (!model) {
      return;
    }

    setRunState("running");
    setMessage("Running dense layers on WebGPU...");

    try {
      const gpuLogits = await runMlpWebGpu(model, input);
      const cpuDebug = runMlpCpu(model, input);
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
  }, [input, model]);

  const handleInputChange = useCallback((nextInput: Float32Array) => {
    setInput(new Float32Array(nextInput));
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
  }, [input, model, runInference]);

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

        <div className="mt-4 grid gap-4 2xl:grid-cols-[390px_minmax(0,1fr)_390px]">
          <InputPanel
            input={input}
            onInputChange={handleInputChange}
            onRun={runInference}
            disabled={!model || runState === "running"}
          />
          <NetworkPanel
            model={model}
            input={input}
            debug={debug}
            selectedNeuron={selectedNeuron}
            onSelectNeuron={setSelectedNeuron}
          />
          <OutputPanel debug={debug} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(360px,0.86fr)_minmax(420px,1fr)_minmax(360px,0.9fr)]">
          <NeuronDetails
            model={model}
            debug={debug}
            selectedNeuron={selectedNeuron}
          />
          <ContributionMatrix
            model={model}
            debug={debug}
            selectedNeuron={selectedNeuron}
          />
          <SaliencyMap model={model} input={input} debug={debug} />
        </div>
      </div>
    </main>
  );
}
