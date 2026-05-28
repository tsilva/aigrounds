"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import { type ClassExample } from "./pytorch-image-augmentations-engine";
import { classExamples } from "./scenario";

type TransformId =
  | "random-resized-crop"
  | "horizontal-flip"
  | "vertical-flip"
  | "rotation"
  | "color-jitter"
  | "trivial-augment"
  | "rand-augment"
  | "gaussian-blur"
  | "random-erasing"
  | "to-tensor";

type TransformState = {
  blurSigma: number;
  brightness: number;
  contrast: number;
  cropMinArea: number;
  eraseMaxArea: number;
  enabled: Record<TransformId, boolean>;
  horizontalFlipProbability: number;
  randAugmentMagnitude: number;
  randAugmentOps: number;
  rotationDegrees: number;
  verticalFlipProbability: number;
};

type CropSample = {
  area: number;
  height: number;
  width: number;
  x: number;
  y: number;
};

type EraseSample = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type RandAugmentOperation =
  | "Rotate"
  | "Brightness"
  | "Contrast"
  | "Saturation"
  | "ShearX"
  | "TranslateX";

type RandAugmentSample = {
  amount: number;
  name: RandAugmentOperation;
};

type PipelineRun = {
  blurSigma: number;
  brightnessFactor: number;
  contrastFactor: number;
  crop: CropSample;
  erase: EraseSample;
  horizontalFlipApplied: boolean;
  randAugment: RandAugmentSample[];
  rotationDegrees: number;
  saturationFactor: number;
  trivialAugment: RandAugmentSample;
  verticalFlipApplied: boolean;
  version: number;
};

const defaultTransformOrder: TransformId[] = [
  "random-resized-crop",
  "horizontal-flip",
  "vertical-flip",
  "rotation",
  "color-jitter",
  "gaussian-blur",
  "random-erasing",
  "trivial-augment",
  "rand-augment",
  "to-tensor",
];

const transformCopy: Record<
  TransformId,
  { title: string; subtitle: string }
> = {
  "random-resized-crop": {
    title: "RandomResizedCrop",
    subtitle: "random crop and resize",
  },
  "horizontal-flip": {
    title: "HorizontalFlip",
    subtitle: "random mirror left to right",
  },
  "vertical-flip": {
    title: "VerticalFlip",
    subtitle: "random mirror top to bottom",
  },
  rotation: {
    title: "Rotation",
    subtitle: "random in-plane rotation",
  },
  "color-jitter": {
    title: "ColorJitter",
    subtitle: "brightness and contrast jitter",
  },
  "trivial-augment": {
    title: "TrivialAugmentWide",
    subtitle: "one sampled wide augmentation",
  },
  "rand-augment": {
    title: "RandAugment",
    subtitle: "random learned policy-style ops",
  },
  "gaussian-blur": {
    title: "GaussianBlur",
    subtitle: "apply gaussian blur",
  },
  "random-erasing": {
    title: "RandomErasing",
    subtitle: "erase a random region",
  },
  "to-tensor": {
    title: "ToTensor",
    subtitle: "convert PIL image to tensor",
  },
};

const defaultTransformState: TransformState = {
  blurSigma: 0.8,
  brightness: 0.3,
  contrast: 0.3,
  cropMinArea: 0.08,
  eraseMaxArea: 0.12,
  enabled: {
    "random-resized-crop": true,
    "horizontal-flip": true,
    "vertical-flip": false,
    rotation: false,
    "color-jitter": false,
    "trivial-augment": true,
    "rand-augment": false,
    "gaussian-blur": false,
    "random-erasing": false,
    "to-tensor": true,
  },
  horizontalFlipProbability: 0.5,
  randAugmentMagnitude: 9,
  randAugmentOps: 2,
  rotationDegrees: 12,
  verticalFlipProbability: 0.5,
};

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[12px] border border-[#c8d5f6] bg-white shadow-[0_14px_34px_rgba(58,88,160,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

function DragHandle() {
  return (
    <span
      aria-hidden="true"
      className="grid h-7 w-4 shrink-0 grid-cols-2 content-center gap-1"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <span
          key={index}
          className="size-1 rounded-full bg-[#31466f]"
        />
      ))}
    </span>
  );
}

function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`size-4 transition ${isExpanded ? "rotate-90" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function formatDecimal(value: number, digits = 2) {
  return value.toFixed(digits);
}

function seededUnit(seed: number, salt: number) {
  const value = Math.sin(seed * 917.3 + salt * 611.7) * 10000;

  return value - Math.floor(value);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function sampleResizedCrop(minArea: number, cropSeed: number): CropSample {
  const boundedMinArea = Math.min(1, Math.max(0.08, minArea));
  const area = boundedMinArea + seededUnit(cropSeed, 1) * (1 - boundedMinArea);
  const aspectRatio = Math.exp(
    Math.log(0.75) + seededUnit(cropSeed, 2) * (Math.log(4 / 3) - Math.log(0.75)),
  );
  let width = Math.sqrt(area * aspectRatio);
  let height = Math.sqrt(area / aspectRatio);

  if (width > 1) {
    height /= width;
    width = 1;
  }

  if (height > 1) {
    width /= height;
    height = 1;
  }

  return {
    area: width * height,
    height,
    width,
    x: seededUnit(cropSeed, 3) * (1 - width),
    y: seededUnit(cropSeed, 4) * (1 - height),
  };
}

function randomResizedCrop(minArea: number): CropSample {
  return sampleResizedCrop(minArea, Math.random() * 100000);
}

function randomErase(maxArea: number): EraseSample {
  const area = randomBetween(0.02, Math.max(0.02, maxArea));
  const width = Math.min(0.62, Math.sqrt(area) * randomBetween(0.82, 1.22));
  const height = Math.min(0.62, area / width);

  return {
    height,
    width,
    x: randomBetween(0, 1 - width),
    y: randomBetween(0, 1 - height),
  };
}

function randomInteger(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

function randomRandAugmentOps(
  numOps: number,
  magnitude: number,
): RandAugmentSample[] {
  const operations: RandAugmentOperation[] = [
    "Rotate",
    "Brightness",
    "Contrast",
    "Saturation",
    "ShearX",
    "TranslateX",
  ];
  const available = [...operations];
  const count = Math.min(Math.max(1, numOps), available.length);

  return Array.from({ length: count }).map(() => {
    const index = randomInteger(0, available.length - 1);
    const [name] = available.splice(index, 1);

    return {
      amount: randomBetween(-magnitude, magnitude),
      name,
    };
  });
}

function moveTransform(
  order: TransformId[],
  sourceId: TransformId,
  targetId: TransformId,
) {
  if (
    sourceId === targetId ||
    sourceId === "rand-augment" ||
    sourceId === "to-tensor"
  ) {
    return order;
  }

  const sourceIndex = order.indexOf(sourceId);

  if (sourceIndex < 0) {
    return order;
  }

  const nextOrder = order.filter((id) => id !== sourceId);
  const targetIndex = nextOrder.indexOf(targetId);

  if (targetIndex < 0) {
    return order;
  }

  nextOrder.splice(targetIndex, 0, sourceId);

  const normalizedOrder: TransformId[] = [
    ...nextOrder.filter(
      (id) => id !== "rand-augment" && id !== "to-tensor",
    ),
    "rand-augment",
    "to-tensor",
  ];

  return normalizedOrder.join("|") === order.join("|") ? order : normalizedOrder;
}

function hasConfigurableControls(id: TransformId) {
  return (
    id === "random-resized-crop" ||
    id === "horizontal-flip" ||
    id === "vertical-flip" ||
    id === "rotation" ||
    id === "color-jitter" ||
    id === "rand-augment" ||
    id === "gaussian-blur" ||
    id === "random-erasing"
  );
}

function RangeRow({
  disabled = false,
  label,
  max,
  min,
  step,
  suffix = "",
  value,
  valueDigits = 2,
  onChange,
}: {
  disabled?: boolean;
  label: string;
  max: number;
  min: number;
  step: number;
  suffix?: string;
  value: number;
  valueDigits?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label
      className={`grid grid-cols-[124px_38px_minmax(0,1fr)_44px_72px] items-center gap-2 text-[12px] font-bold ${
        disabled ? "text-[#7890b8]" : "text-[#10245a]"
      }`}
    >
      <span>{label}</span>
      <span className="text-right font-mono">{formatDecimal(min, valueDigits)}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full accent-[#1735ff] disabled:accent-[#aab7d1]"
      />
      <span className="font-mono">{formatDecimal(max, valueDigits)}</span>
      <span className="rounded-[6px] border border-[#d4def5] bg-white px-2 py-1.5 text-center font-mono text-[13px] font-black text-[#071024]">
        {formatDecimal(value, valueDigits)}
        {suffix ? <span className="ml-1">{suffix}</span> : null}
      </span>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? "bg-[#052cff]" : "bg-[#cbd5e1]"
      }`}
    >
      <span
        className={`absolute top-1 size-5 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function ImageThumbnail({
  example,
  isSelected,
  onSelect,
}: {
  example: ClassExample;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={`rounded-[8px] border p-1.5 transition ${
        isSelected
          ? "border-[#052cff] bg-[#eef3ff] shadow-[0_10px_22px_rgba(23,53,255,0.14)]"
          : "border-[#d7e0f3] bg-white hover:border-[#aebced]"
      }`}
    >
      <div className="relative aspect-[1.25] overflow-hidden rounded-[6px] bg-[#f8fbff]">
        <Image
          src={example.imageSrc}
          alt={example.imageAlt}
          fill
          sizes="(max-width: 768px) 42vw, 140px"
          className="object-cover"
          style={{ objectPosition: example.objectPosition }}
        />
      </div>
      <p className="mt-1.5 text-center text-[12px] font-black text-[#10245a]">
        {example.label}
      </p>
      <p className="text-center font-mono text-[11px] font-bold text-[#30446f]">
        class {example.classIndex}
      </p>
    </button>
  );
}

function TransformBlock({
  canDrag,
  canCollapse,
  id,
  index,
  isCollapsed,
  isDragging,
  isDragTarget,
  state,
  onDragEnd,
  onDragEnter,
  onDragStart,
  onToggleCollapse,
  onToggle,
  onUpdate,
}: {
  canDrag: boolean;
  canCollapse: boolean;
  id: TransformId;
  index: number;
  isCollapsed: boolean;
  isDragging: boolean;
  isDragTarget: boolean;
  state: TransformState;
  onDragEnd: () => void;
  onDragEnter: (id: TransformId) => void;
  onDragStart: (id: TransformId) => void;
  onToggleCollapse: (id: TransformId) => void;
  onToggle: (id: TransformId, enabled: boolean) => void;
  onUpdate: (patch: Partial<TransformState>) => void;
}) {
  const copy = transformCopy[id];
  const isEnabled = state.enabled[id];

  return (
    <div
      onDragEnd={onDragEnd}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragEnter(id);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDragEnd();
      }}
      className={`rounded-[8px] border px-3 py-3 transition ${
        isDragTarget
          ? "border-[#052cff] bg-[#eef3ff]"
          : isEnabled
            ? "border-[#c8d5f6] bg-white"
            : "border-[#dbe4f6] bg-[#f8fbff] opacity-70"
      } ${isDragging ? "scale-[0.99] opacity-50" : ""}`}
    >
      <div className="grid grid-cols-[18px_36px_minmax(0,1fr)_36px_48px] items-center gap-3">
        <span
          aria-label={`Drag ${copy.title}`}
          draggable={canDrag}
          title={canDrag ? "Drag to reorder" : "Pinned last in pipeline"}
          onDragStart={(event) => {
            if (!canDrag) {
              event.preventDefault();
              return;
            }

            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", id);
            onDragStart(id);
          }}
          className={canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed opacity-45"}
        >
          <DragHandle />
        </span>
        <span className="rounded-[6px] border border-[#d7e0f3] bg-[#fbfcff] py-1 text-center font-mono text-[14px] font-black text-[#052cff]">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-black text-[#071024]">
            {copy.title}
          </p>
          <p className="truncate text-[11px] font-bold text-[#30446f]">
            {copy.subtitle}
          </p>
        </div>
        {canCollapse ? (
          <button
            type="button"
            aria-expanded={!isCollapsed}
            aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${copy.title} settings`}
            title={`${isCollapsed ? "Expand" : "Collapse"} settings`}
            onClick={() => onToggleCollapse(id)}
            className="inline-flex size-9 items-center justify-center rounded-[6px] border border-[#d7e0f3] bg-white text-[#30446f] transition hover:border-[#aebced]"
          >
            <ChevronIcon isExpanded={!isCollapsed} />
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <Toggle
          label={`${isEnabled ? "Disable" : "Enable"} ${copy.title}`}
          checked={isEnabled}
          onChange={(checked) => onToggle(id, checked)}
        />
      </div>

      {!isCollapsed ? (
        <div className="mt-3 space-y-2">
          {id === "random-resized-crop" ? (
            <RangeRow
              disabled={!isEnabled}
              label="min crop area"
              min={0.08}
              max={1}
              step={0.01}
              value={state.cropMinArea}
              onChange={(cropMinArea) => onUpdate({ cropMinArea })}
            />
          ) : null}

          {id === "rotation" ? (
            <RangeRow
              disabled={!isEnabled}
              label="max degrees"
              min={0}
              max={18}
              step={1}
              suffix="deg"
              value={state.rotationDegrees}
              valueDigits={0}
              onChange={(rotationDegrees) => onUpdate({ rotationDegrees })}
            />
          ) : null}

          {id === "horizontal-flip" ? (
            <RangeRow
              disabled={!isEnabled}
              label="flip prob"
              min={0}
              max={1}
              step={0.05}
              value={state.horizontalFlipProbability}
              onChange={(horizontalFlipProbability) =>
                onUpdate({ horizontalFlipProbability })
              }
            />
          ) : null}

          {id === "vertical-flip" ? (
            <RangeRow
              disabled={!isEnabled}
              label="flip prob"
              min={0}
              max={1}
              step={0.05}
              value={state.verticalFlipProbability}
              onChange={(verticalFlipProbability) =>
                onUpdate({ verticalFlipProbability })
              }
            />
          ) : null}

          {id === "color-jitter" ? (
            <>
              <RangeRow
                disabled={!isEnabled}
                label="brightness"
                min={0}
                max={0.3}
                step={0.01}
                value={state.brightness}
                onChange={(brightness) => onUpdate({ brightness })}
              />
              <RangeRow
                disabled={!isEnabled}
                label="contrast"
                min={0}
                max={0.3}
                step={0.01}
                value={state.contrast}
                onChange={(contrast) => onUpdate({ contrast })}
              />
            </>
          ) : null}

          {id === "trivial-augment" ? (
            <p className="rounded-[6px] border border-[#d4def5] bg-white px-3 py-2 font-mono text-[11px] font-bold text-[#30446f]">
              No knobs: TrivialAugmentWide samples one operation and magnitude.
            </p>
          ) : null}

          {id === "rand-augment" ? (
            <>
              <RangeRow
                disabled={!isEnabled}
                label="num ops"
                min={1}
                max={4}
                step={1}
                value={state.randAugmentOps}
                valueDigits={0}
                onChange={(randAugmentOps) => onUpdate({ randAugmentOps })}
              />
              <RangeRow
                disabled={!isEnabled}
                label="magnitude"
                min={0}
                max={30}
                step={1}
                value={state.randAugmentMagnitude}
                valueDigits={0}
                onChange={(randAugmentMagnitude) =>
                  onUpdate({ randAugmentMagnitude })
                }
              />
            </>
          ) : null}

          {id === "gaussian-blur" ? (
            <RangeRow
              disabled={!isEnabled}
              label="max sigma"
              min={0.1}
              max={2}
              step={0.1}
              value={state.blurSigma}
              valueDigits={1}
              onChange={(blurSigma) => onUpdate({ blurSigma })}
            />
          ) : null}

          {id === "random-erasing" ? (
            <RangeRow
              disabled={!isEnabled}
              label="max erase area"
              min={0.02}
              max={0.3}
              step={0.01}
              value={state.eraseMaxArea}
              onChange={(eraseMaxArea) => onUpdate({ eraseMaxArea })}
            />
          ) : null}

          {id === "to-tensor" ? (
            <p className="rounded-[6px] border border-[#d4def5] bg-white px-3 py-2 font-mono text-[11px] font-bold text-[#30446f]">
              No visual change: this converts the image into a training tensor.
            </p>
          ) : null}
        </div>
      ) : null}

      {!isCollapsed && id === "random-resized-crop" && isEnabled ? (
        <p className="mt-2 font-mono text-[10px] font-bold text-[#58709d]">
          crop sample is drawn when the pipeline runs
        </p>
      ) : null}

      {!isCollapsed &&
      (id === "horizontal-flip" || id === "vertical-flip") &&
      isEnabled ? (
        <p className="mt-2 font-mono text-[10px] font-bold text-[#58709d]">
          flip decision is sampled when the pipeline runs
        </p>
      ) : null}

      {!isCollapsed && id === "rand-augment" && isEnabled ? (
        <p className="mt-2 font-mono text-[10px] font-bold text-[#58709d]">
          ops are sampled from RandAugment when the pipeline runs
        </p>
      ) : null}

      {!isCollapsed && id === "trivial-augment" && isEnabled ? (
        <p className="mt-2 font-mono text-[10px] font-bold text-[#58709d]">
          one operation is sampled from TrivialAugmentWide when the pipeline runs
        </p>
      ) : null}
    </div>
  );
}

function getEnabledCodeLines(state: TransformState, order: TransformId[]) {
  const lines: string[] = [];

  order.forEach((id) => {
    if (!state.enabled[id]) {
      return;
    }

    if (id === "random-resized-crop") {
      if (state.cropMinArea <= 0.08) {
        lines.push("    transforms.RandomResizedCrop(224),");
      } else {
        lines.push(
          `    transforms.RandomResizedCrop(224, scale=(${formatDecimal(
            state.cropMinArea,
          )}, 1.0)),`,
        );
      }
    }

    if (id === "rotation") {
      lines.push(`    transforms.RandomRotation(degrees=${state.rotationDegrees}),`);
    }

    if (id === "horizontal-flip") {
      if (state.horizontalFlipProbability === 0.5) {
        lines.push("    transforms.RandomHorizontalFlip(),");
      } else {
        lines.push(
          `    transforms.RandomHorizontalFlip(p=${formatDecimal(
            state.horizontalFlipProbability,
          )}),`,
        );
      }
    }

    if (id === "vertical-flip") {
      lines.push(
        `    transforms.RandomVerticalFlip(p=${formatDecimal(
          state.verticalFlipProbability,
        )}),`,
      );
    }

    if (id === "color-jitter") {
      lines.push(
        `    transforms.ColorJitter(brightness=${formatDecimal(
          state.brightness,
        )}, contrast=${formatDecimal(state.contrast)}),`,
      );
    }

    if (id === "trivial-augment") {
      lines.push("    transforms.TrivialAugmentWide(),");
    }

    if (id === "rand-augment") {
      lines.push(
        `    transforms.RandAugment(num_ops=${state.randAugmentOps}, magnitude=${state.randAugmentMagnitude}),`,
      );
    }

    if (id === "gaussian-blur") {
      lines.push(
        `    transforms.GaussianBlur(kernel_size=5, sigma=(0.1, ${formatDecimal(
          state.blurSigma,
          1,
        )})),`,
      );
    }

    if (id === "random-erasing") {
      lines.push(
        `    transforms.RandomErasing(p=0.35, scale=(0.02, ${formatDecimal(
          state.eraseMaxArea,
        )})),`,
      );
    }

    if (id === "to-tensor") {
      lines.push("    transforms.ToTensor(),");
    }
  });

  return [
    "from torchvision import transforms",
    "",
    "transform = transforms.Compose([",
    ...lines,
    "])",
    "image = transform(image)",
  ];
}

function createPipelineRun(state: TransformState, version: number): PipelineRun {
  return {
    blurSigma: randomBetween(0.1, state.blurSigma),
    brightnessFactor: randomBetween(1 - state.brightness, 1 + state.brightness),
    contrastFactor: randomBetween(1 - state.contrast, 1 + state.contrast),
    crop: randomResizedCrop(state.cropMinArea),
    erase: randomErase(state.eraseMaxArea),
    horizontalFlipApplied: Math.random() < state.horizontalFlipProbability,
    randAugment: randomRandAugmentOps(
      state.randAugmentOps,
      state.randAugmentMagnitude,
    ),
    rotationDegrees: randomBetween(
      -state.rotationDegrees,
      state.rotationDegrees,
    ),
    saturationFactor: randomBetween(
      1 - state.brightness * 0.8,
      1 + state.brightness * 1.4,
    ),
    trivialAugment: randomRandAugmentOps(1, 30)[0],
    verticalFlipApplied: Math.random() < state.verticalFlipProbability,
    version,
  };
}

function applyRandAugmentVisual(
  operations: RandAugmentSample[],
  transforms: string[],
  filters: string[],
) {
  operations.forEach((operation) => {
    if (operation.name === "Rotate") {
      transforms.push(`rotate(${operation.amount.toFixed(2)}deg)`);
    }

    if (operation.name === "Brightness") {
      filters.push(`brightness(${(1 + Math.abs(operation.amount) / 60).toFixed(3)})`);
    }

    if (operation.name === "Contrast") {
      filters.push(`contrast(${(1 + Math.abs(operation.amount) / 58).toFixed(3)})`);
    }

    if (operation.name === "Saturation") {
      filters.push(`saturate(${(1 + Math.abs(operation.amount) / 48).toFixed(3)})`);
    }

    if (operation.name === "ShearX") {
      transforms.push(`skewX(${(operation.amount / 2).toFixed(2)}deg)`);
    }

    if (operation.name === "TranslateX") {
      transforms.push(`translateX(${(operation.amount / 1.8).toFixed(2)}%)`);
    }
  });
}

function getImageVisualState(
  state: TransformState,
  order: TransformId[],
  run: PipelineRun | null,
) {
  const crop = run?.crop ?? null;
  const originX = crop ? ((crop.x + crop.width / 2) * 100).toFixed(1) : "50";
  const originY = crop ? ((crop.y + crop.height / 2) * 100).toFixed(1) : "50";
  const transforms: string[] = [];
  const filters: string[] = [];

  if (run) {
    order.forEach((id) => {
      if (!state.enabled[id]) {
        return;
      }

      if (id === "random-resized-crop") {
        transforms.push(
          `scale(${(1 / run.crop.width).toFixed(3)}, ${(
            1 / run.crop.height
          ).toFixed(3)})`,
        );
      }

      if (id === "rotation") {
        transforms.push(`rotate(${run.rotationDegrees.toFixed(2)}deg)`);
      }

      if (id === "horizontal-flip" && run.horizontalFlipApplied) {
        transforms.push("scaleX(-1)");
      }

      if (id === "vertical-flip" && run.verticalFlipApplied) {
        transforms.push("scaleY(-1)");
      }

      if (id === "color-jitter") {
        filters.push(
          `brightness(${run.brightnessFactor})`,
          `contrast(${run.contrastFactor})`,
          `saturate(${run.saturationFactor})`,
        );
      }

      if (id === "rand-augment") {
        applyRandAugmentVisual(run.randAugment, transforms, filters);
      }

      if (id === "trivial-augment") {
        applyRandAugmentVisual([run.trivialAugment], transforms, filters);
      }

      if (id === "gaussian-blur") {
        filters.push(`blur(${Math.min(4, run.blurSigma * 1.8).toFixed(2)}px)`);
        transforms.push("scale(1.03)");
      }
    });
  }

  return {
    crop,
    cropBoxStyle: crop
      ? ({
          height: `${crop.height * 100}%`,
          left: `${crop.x * 100}%`,
          top: `${crop.y * 100}%`,
          width: `${crop.width * 100}%`,
        } satisfies CSSProperties)
      : null,
    resultImageStyle: {
      filter: filters.length ? filters.join(" ") : "none",
      objectPosition: "50% 50%",
      transform: transforms.length ? transforms.join(" ") : "none",
      transformOrigin: `${originX}% ${originY}%`,
    } satisfies CSSProperties,
  };
}

function getRunSummary(
  run: PipelineRun,
  state: TransformState,
  order: TransformId[],
) {
  const summary: string[] = [];

  order.forEach((id) => {
    if (!state.enabled[id]) {
      return;
    }

    if (id === "random-resized-crop") {
      summary.push(`crop area ${Math.round(run.crop.area * 100)}%`);
    }

    if (id === "rotation") {
      summary.push(`rotation ${run.rotationDegrees.toFixed(1)}deg`);
    }

    if (id === "horizontal-flip") {
      summary.push(
        `hflip ${run.horizontalFlipApplied ? "applied" : "skipped"}`,
      );
    }

    if (id === "vertical-flip") {
      summary.push(`vflip ${run.verticalFlipApplied ? "applied" : "skipped"}`);
    }

    if (id === "color-jitter") {
      summary.push(
        `brightness x${formatDecimal(run.brightnessFactor)}`,
        `contrast x${formatDecimal(run.contrastFactor)}`,
      );
    }

    if (id === "rand-augment") {
      summary.push(
        `rand ${run.randAugment
          .map((operation) => `${operation.name} ${operation.amount.toFixed(1)}`)
          .join(", ")}`,
      );
    }

    if (id === "trivial-augment") {
      summary.push(
        `trivial ${run.trivialAugment.name} ${run.trivialAugment.amount.toFixed(
          1,
        )}`,
      );
    }

    if (id === "gaussian-blur") {
      summary.push(`blur sigma ${formatDecimal(run.blurSigma, 1)}`);
    }

    if (id === "random-erasing") {
      summary.push(
        `erase area ${Math.round(run.erase.width * run.erase.height * 100)}%`,
      );
    }
  });

  return summary;
}

function ImagePane({
  children,
  example,
  imageClassName = "",
  imageStyle,
  title,
}: {
  children?: ReactNode;
  example: ClassExample;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  title: string;
}) {
  return (
    <div>
      <p className="mb-2 text-center text-[12px] font-black text-[#30446f] uppercase">
        {title}
      </p>
      <div className="relative aspect-[1.28] overflow-hidden rounded-[8px] border border-[#b8c5e8] bg-[#f8fbff]">
        <Image
          src={example.imageSrc}
          alt={`${example.imageAlt} ${title.toLowerCase()}`}
          fill
          sizes="(max-width: 768px) 92vw, 430px"
          className={`object-cover transition-[filter,transform] duration-200 ease-out ${imageClassName}`}
          style={{
            objectPosition: example.objectPosition,
            ...imageStyle,
          }}
        />
        {children}
      </div>
    </div>
  );
}

export function PytorchImageAugmentationsPlayground() {
  const [selectedExampleId, setSelectedExampleId] =
    useState<ClassExample["id"]>("cat");
  const [state, setState] = useState<TransformState>(defaultTransformState);
  const [transformOrder, setTransformOrder] =
    useState<TransformId[]>(defaultTransformOrder);
  const [draggedTransformId, setDraggedTransformId] =
    useState<TransformId | null>(null);
  const [dropTargetId, setDropTargetId] = useState<TransformId | null>(null);
  const [collapsedTransformIds, setCollapsedTransformIds] = useState<
    Partial<Record<TransformId, boolean>>
  >({});
  const [pipelineVersion, setPipelineVersion] = useState(0);
  const [run, setRun] = useState<PipelineRun | null>(null);

  const selectedExample = useMemo(
    () =>
      classExamples.find((example) => example.id === selectedExampleId) ??
      classExamples[0],
    [selectedExampleId],
  );
  const overlappingRandAugmentTransforms = [
    state.enabled.rotation ? "Rotation" : null,
    state.enabled["color-jitter"] ? "ColorJitter" : null,
  ].filter(Boolean);
  const shouldWarnAboutRandAugmentOverlap =
    state.enabled["rand-augment"] && overlappingRandAugmentTransforms.length > 0;
  const codeLines = getEnabledCodeLines(state, transformOrder);
  const currentRun = run?.version === pipelineVersion ? run : null;
  const { cropBoxStyle, resultImageStyle } = getImageVisualState(
    state,
    transformOrder,
    currentRun,
  );

  function markPipelineChanged() {
    setPipelineVersion((version) => version + 1);
  }

  function updateState(patch: Partial<TransformState>) {
    setState((current) => ({ ...current, ...patch }));
    markPipelineChanged();
  }

  function toggleTransform(id: TransformId, enabled: boolean) {
    setState((current) => ({
      ...current,
      enabled: {
        ...current.enabled,
        [id]: enabled,
      },
    }));
    markPipelineChanged();
  }

  function toggleTransformCollapse(id: TransformId) {
    setCollapsedTransformIds((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function selectExample(exampleId: ClassExample["id"]) {
    setSelectedExampleId(exampleId);
    markPipelineChanged();
  }

  function runPipeline() {
    setRun(createPipelineRun(state, pipelineVersion));
  }

  function reorderTransforms(sourceId: TransformId, targetId: TransformId) {
    const nextOrder = moveTransform(transformOrder, sourceId, targetId);

    if (nextOrder === transformOrder) {
      return;
    }

    setTransformOrder(nextOrder);
    markPipelineChanged();
  }

  function endDrag() {
    setDraggedTransformId(null);
    setDropTargetId(null);
  }

  async function copyCode() {
    await navigator.clipboard?.writeText(codeLines.join("\n"));
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfcff] px-3 py-4 text-[#071024] sm:px-5">
      <div className="mx-auto max-w-[1536px]">
        <header className="mb-4 pl-0 sm:pl-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="min-w-0 break-words text-[38px] leading-[1] font-black text-[#030713] sm:text-[52px]">
                PyTorch Image Transforms
              </h1>
              <p className="mt-2 max-w-[64rem] text-[18px] leading-tight font-medium text-[#10245a] sm:text-[22px]">
                Stack transforms on one image and watch the composed result
                update.
              </p>
            </div>
          </div>
        </header>

        <Panel className="p-4 sm:p-5">
          <h2 className="text-[16px] leading-tight font-black text-[#052cff] uppercase sm:text-[19px]">
            1. Stack Transforms And Preview The Result
          </h2>

          <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(430px,0.86fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="space-y-2">
                {transformOrder.map((id, index) => (
                  <TransformBlock
                    key={id}
                    canDrag={id !== "rand-augment" && id !== "to-tensor"}
                    canCollapse={hasConfigurableControls(id)}
                    id={id}
                    index={index}
                    isCollapsed={Boolean(collapsedTransformIds[id])}
                    isDragging={draggedTransformId === id}
                    isDragTarget={dropTargetId === id}
                    state={state}
                    onDragEnd={endDrag}
                    onDragEnter={(targetId) => {
                      setDropTargetId(targetId);

                      if (draggedTransformId) {
                        reorderTransforms(draggedTransformId, targetId);
                      }
                    }}
                    onDragStart={(draggedId) => {
                      setDraggedTransformId(draggedId);
                      setDropTargetId(draggedId);
                    }}
                    onToggleCollapse={toggleTransformCollapse}
                    onToggle={toggleTransform}
                    onUpdate={updateState}
                  />
                ))}
              </div>

              {shouldWarnAboutRandAugmentOverlap ? (
                <div className="rounded-[8px] border border-[#f6c75f] bg-[#fff8e6] px-4 py-3 text-[13px] font-bold text-[#684800]">
                  Warning: RandAugment can already sample rotation and color
                  changes. {overlappingRandAugmentTransforms.join(" and ")} will
                  stack on top of it if left enabled.
                </div>
              ) : null}

              <div className="rounded-[9px] border border-[#d4def5] bg-[#fbfcff]">
                <div className="flex items-center justify-between gap-3 border-b border-[#d4def5] px-4 py-3">
                  <p className="text-[15px] font-black text-[#052cff] uppercase">
                    Generated torchvision code
                  </p>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="rounded-[7px] border border-[#052cff] bg-white px-3 py-2 text-[12px] font-black text-[#052cff] transition hover:bg-[#eef3ff]"
                  >
                    Copy code
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-6 font-semibold text-[#071024] sm:text-[14px]">
                  {codeLines.map((line, index) => (
                    <code key={`${line}-${index}`} className="block">
                      {line}
                    </code>
                  ))}
                </pre>
              </div>
            </div>

            <div className="min-w-0 space-y-4 border-t border-[#d6e0f6] pt-5 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-5">
              <div>
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[13px] font-black text-[#052cff] uppercase">
                    Choose an image
                  </p>
                  <button
                    type="button"
                    onClick={runPipeline}
                    className="rounded-[7px] border border-[#052cff] bg-[#052cff] px-4 py-2 text-[13px] font-black text-white shadow-[0_10px_22px_rgba(23,53,255,0.16)] transition hover:bg-[#0227d7]"
                  >
                    Run pipeline
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {classExamples.map((example) => (
                    <ImageThumbnail
                      key={example.id}
                      example={example}
                      isSelected={example.id === selectedExample.id}
                      onSelect={() => selectExample(example.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] xl:items-center">
                <ImagePane example={selectedExample} title="Original">
                  {currentRun &&
                  state.enabled["random-resized-crop"] &&
                  cropBoxStyle ? (
                    <div
                      className="absolute border-2 border-dashed border-[#052cff] bg-[#052cff]/10 shadow-[0_0_0_999px_rgba(7,16,36,0.12)]"
                      style={cropBoxStyle}
                    />
                  ) : null}
                </ImagePane>

                <div className="hidden text-center text-[#10245a] xl:block">
                  <p className="text-[13px] font-bold leading-tight">
                    top to
                    <br />
                    bottom
                  </p>
                  <p className="mt-3 text-[32px] leading-none">-&gt;</p>
                </div>

                <ImagePane
                  example={selectedExample}
                  imageStyle={resultImageStyle}
                  title="Composed result"
                >
                  {!currentRun ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 px-4 text-center">
                      <p className="rounded-[8px] border border-[#d6e0f6] bg-white px-4 py-3 text-[14px] font-black text-[#052cff] shadow-[0_10px_20px_rgba(68,88,170,0.08)]">
                        Run pipeline to sample the random transforms.
                      </p>
                    </div>
                  ) : null}
                  {currentRun && state.enabled["random-erasing"] ? (
                    <div
                      className="absolute rounded-[5px] bg-[#0f172a]/75"
                      style={{
                        height: `${currentRun.erase.height * 100}%`,
                        left: `${currentRun.erase.x * 100}%`,
                        top: `${currentRun.erase.y * 100}%`,
                        width: `${currentRun.erase.width * 100}%`,
                      }}
                    />
                  ) : null}
                </ImagePane>
              </div>

              <div className="rounded-[8px] border border-[#d6e0f6] bg-[#fbfcff] px-4 py-3">
                <p className="text-[12px] font-black text-[#052cff] uppercase">
                  Latest sampled values
                </p>
                {currentRun ? (
                  <p className="mt-2 font-mono text-[12px] font-bold text-[#10245a]">
                    {getRunSummary(currentRun, state, transformOrder).join(
                      " / ",
                    )}
                  </p>
                ) : (
                  <p className="mt-2 text-[13px] font-semibold text-[#30446f]">
                    Sliders edit pipeline parameters. Press Run pipeline to draw
                    a crop, rotation angle, color factors, and other random
                    samples.
                  </p>
                )}
              </div>

            </div>
          </div>
        </Panel>
      </div>
    </main>
  );
}
