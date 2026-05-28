"use client";

import Image from "next/image";
import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import { type ClassExample } from "./pytorch-image-augmentations-engine";
import { classExamples } from "./scenario";

type TransformId =
  | "random-resized-crop"
  | "rotation"
  | "color-jitter"
  | "gaussian-blur"
  | "random-erasing";

type TransformState = {
  blurSigma: number;
  brightness: number;
  contrast: number;
  cropMinArea: number;
  eraseMaxArea: number;
  enabled: Record<TransformId, boolean>;
  rotationDegrees: number;
};

type CropSample = {
  area: number;
  height: number;
  width: number;
  x: number;
  y: number;
};

const transformOrder: TransformId[] = [
  "random-resized-crop",
  "rotation",
  "color-jitter",
  "gaussian-blur",
  "random-erasing",
];

const transformCopy: Record<
  TransformId,
  { number: number; title: string; subtitle: string }
> = {
  "random-resized-crop": {
    number: 1,
    title: "RandomResizedCrop",
    subtitle: "random crop and resize",
  },
  rotation: {
    number: 2,
    title: "Rotation",
    subtitle: "random in-plane rotation",
  },
  "color-jitter": {
    number: 3,
    title: "ColorJitter",
    subtitle: "brightness and contrast jitter",
  },
  "gaussian-blur": {
    number: 4,
    title: "GaussianBlur",
    subtitle: "apply gaussian blur",
  },
  "random-erasing": {
    number: 5,
    title: "RandomErasing",
    subtitle: "erase a random region",
  },
};

const defaultTransformState: TransformState = {
  blurSigma: 0.8,
  brightness: 0.3,
  contrast: 0.3,
  cropMinArea: 0.72,
  eraseMaxArea: 0.12,
  enabled: {
    "random-resized-crop": true,
    rotation: true,
    "color-jitter": true,
    "gaussian-blur": false,
    "random-erasing": false,
  },
  rotationDegrees: 12,
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

function HelpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9a2.6 2.6 0 0 1 4.9 1.2c0 1.8-2 2.1-2 3.5" />
      <path d="M12 17h.01" />
    </svg>
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

function formatDecimal(value: number, digits = 2) {
  return value.toFixed(digits);
}

function seededUnit(seed: number, salt: number) {
  const value = Math.sin(seed * 917.3 + salt * 611.7) * 10000;

  return value - Math.floor(value);
}

function sampleResizedCrop(minArea: number, cropSeed: number): CropSample {
  const boundedMinArea = Math.min(1, Math.max(0.72, minArea));
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
  cropSeed,
  id,
  state,
  onResampleCrop,
  onToggle,
  onUpdate,
}: {
  cropSeed: number;
  id: TransformId;
  state: TransformState;
  onResampleCrop: () => void;
  onToggle: (id: TransformId, enabled: boolean) => void;
  onUpdate: (patch: Partial<TransformState>) => void;
}) {
  const copy = transformCopy[id];
  const isEnabled = state.enabled[id];

  return (
    <div
      className={`rounded-[8px] border px-3 py-3 transition ${
        isEnabled
          ? "border-[#c8d5f6] bg-white"
          : "border-[#dbe4f6] bg-[#f8fbff] opacity-70"
      }`}
    >
      <div className="grid grid-cols-[18px_36px_minmax(0,1fr)_48px_34px] items-center gap-3">
        <DragHandle />
        <span className="rounded-[6px] border border-[#d7e0f3] bg-[#fbfcff] py-1 text-center font-mono text-[14px] font-black text-[#052cff]">
          {copy.number}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-black text-[#071024]">
            {copy.title}
          </p>
          <p className="truncate text-[11px] font-bold text-[#30446f]">
            {copy.subtitle}
          </p>
        </div>
        <Toggle
          label={`${isEnabled ? "Disable" : "Enable"} ${copy.title}`}
          checked={isEnabled}
          onChange={(checked) => onToggle(id, checked)}
        />
        <button
          type="button"
          aria-label={`Disable ${copy.title}`}
          onClick={() => onToggle(id, false)}
          className="rounded-[6px] border border-[#d7e0f3] bg-white px-2 py-1 text-[14px] font-black text-[#30446f] transition hover:border-[#aebced]"
        >
          x
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {id === "random-resized-crop" ? (
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_126px]">
            <RangeRow
              disabled={!isEnabled}
              label="min crop area"
              min={0.72}
              max={1}
              step={0.01}
              value={state.cropMinArea}
              onChange={(cropMinArea) => onUpdate({ cropMinArea })}
            />
            <button
              type="button"
              disabled={!isEnabled}
              onClick={onResampleCrop}
              className="rounded-[6px] border border-[#052cff] bg-white px-3 py-2 text-[12px] font-black text-[#052cff] transition hover:bg-[#eef3ff] disabled:border-[#cbd5e1] disabled:text-[#7890b8]"
            >
              Resample crop
            </button>
          </div>
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
      </div>

      {id === "random-resized-crop" && isEnabled ? (
        <p className="mt-2 font-mono text-[10px] font-bold text-[#58709d]">
          sample #{cropSeed}
        </p>
      ) : null}
    </div>
  );
}

function getEnabledCodeLines(state: TransformState) {
  const lines: string[] = [];

  if (state.enabled["random-resized-crop"]) {
    lines.push(
      `    v2.RandomResizedCrop(size=(224, 224), scale=(${formatDecimal(
        state.cropMinArea,
      )}, 1.0)),`,
    );
  }

  if (state.enabled.rotation) {
    lines.push(`    v2.RandomRotation(degrees=${state.rotationDegrees}),`);
  }

  if (state.enabled["color-jitter"]) {
    lines.push(
      `    v2.ColorJitter(brightness=${formatDecimal(
        state.brightness,
      )}, contrast=${formatDecimal(state.contrast)}),`,
    );
  }

  if (state.enabled["gaussian-blur"]) {
    lines.push(
      `    v2.GaussianBlur(kernel_size=5, sigma=(0.1, ${formatDecimal(
        state.blurSigma,
        1,
      )})),`,
    );
  }

  if (state.enabled["random-erasing"]) {
    lines.push(
      `    v2.RandomErasing(p=0.35, scale=(0.02, ${formatDecimal(
        state.eraseMaxArea,
      )})),`,
    );
  }

  return [
    "from torchvision.transforms import v2",
    "",
    "transform = v2.Compose([",
    ...lines,
    "])",
    "image = transform(image)",
  ];
}

function getImageVisualState(state: TransformState, cropSeed: number) {
  const crop = sampleResizedCrop(state.cropMinArea, cropSeed);
  const originX = ((crop.x + crop.width / 2) * 100).toFixed(1);
  const originY = ((crop.y + crop.height / 2) * 100).toFixed(1);
  const transforms: string[] = [];
  const filters: string[] = [];

  if (state.enabled["random-resized-crop"]) {
    transforms.push(
      `scale(${(1 / crop.width).toFixed(3)}, ${(1 / crop.height).toFixed(3)})`,
    );
  }

  if (state.enabled.rotation) {
    transforms.push(`rotate(${state.rotationDegrees}deg)`);
  }

  if (state.enabled["color-jitter"]) {
    filters.push(
      `brightness(${1 + state.brightness})`,
      `contrast(${1 + state.contrast})`,
      `saturate(${1 + state.brightness * 1.4})`,
    );
  }

  if (state.enabled["gaussian-blur"]) {
    filters.push(`blur(${Math.min(4, state.blurSigma * 1.8).toFixed(2)}px)`);
    transforms.push("scale(1.03)");
  }

  return {
    crop,
    cropBoxStyle: {
      height: `${crop.height * 100}%`,
      left: `${crop.x * 100}%`,
      top: `${crop.y * 100}%`,
      width: `${crop.width * 100}%`,
    } satisfies CSSProperties,
    resultImageStyle: {
      filter: filters.length ? filters.join(" ") : "none",
      objectPosition: "50% 50%",
      transform: transforms.length ? transforms.join(" ") : "none",
      transformOrigin: `${originX}% ${originY}%`,
    } satisfies CSSProperties,
  };
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
  const [cropSeed, setCropSeed] = useState(7);

  const selectedExample = useMemo(
    () =>
      classExamples.find((example) => example.id === selectedExampleId) ??
      classExamples[0],
    [selectedExampleId],
  );
  const activeTransformCount = transformOrder.filter((id) => state.enabled[id]).length;
  const codeLines = getEnabledCodeLines(state);
  const { cropBoxStyle, resultImageStyle } = getImageVisualState(state, cropSeed);

  function updateState(patch: Partial<TransformState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  function toggleTransform(id: TransformId, enabled: boolean) {
    setState((current) => ({
      ...current,
      enabled: {
        ...current.enabled,
        [id]: enabled,
      },
    }));
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
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] border border-[#cfd4ff] bg-white px-5 py-3 text-[15px] font-black text-[#052cff] shadow-[0_10px_24px_rgba(68,88,170,0.06)]"
            >
              <HelpIcon />
              What changes and what stays?
            </button>
          </div>
        </header>

        <Panel className="p-4 sm:p-5">
          <h2 className="text-[16px] leading-tight font-black text-[#052cff] uppercase sm:text-[19px]">
            1. Stack Transforms And Preview The Result
          </h2>

          <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(430px,0.86fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="space-y-2">
                {transformOrder.map((id) => (
                  <TransformBlock
                    key={id}
                    cropSeed={cropSeed}
                    id={id}
                    state={state}
                    onResampleCrop={() => setCropSeed((seed) => seed + 1)}
                    onToggle={toggleTransform}
                    onUpdate={updateState}
                  />
                ))}
              </div>

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
                <p className="mb-3 text-[13px] font-black text-[#052cff] uppercase">
                  Choose an image
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {classExamples.map((example) => (
                    <ImageThumbnail
                      key={example.id}
                      example={example}
                      isSelected={example.id === selectedExample.id}
                      onSelect={() => setSelectedExampleId(example.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] xl:items-center">
                <ImagePane example={selectedExample} title="Original">
                  {state.enabled["random-resized-crop"] ? (
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
                  {state.enabled["random-erasing"] ? (
                    <div
                      className="absolute rounded-[5px] bg-[#0f172a]/75"
                      style={{
                        height: `${Math.round(state.eraseMaxArea * 120)}%`,
                        left: "46%",
                        top: "28%",
                        width: `${Math.round(state.eraseMaxArea * 120)}%`,
                      }}
                    />
                  ) : null}
                </ImagePane>
              </div>

              <div className="grid rounded-[9px] border border-[#d6e0f6] bg-white text-center sm:grid-cols-3">
                <div className="border-b border-[#d6e0f6] px-4 py-3 sm:border-r sm:border-b-0">
                  <p className="text-[12px] font-bold text-[#30446f]">
                    label mode
                  </p>
                  <p className="mt-1 text-[18px] font-black text-[#071024]">
                    one-hot
                  </p>
                </div>
                <div className="border-b border-[#d6e0f6] px-4 py-3 sm:border-r sm:border-b-0">
                  <p className="text-[12px] font-bold text-[#30446f]">class</p>
                  <p className="mt-1 text-[18px] font-black text-[#071024]">
                    {selectedExample.label} ({selectedExample.classIndex})
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[12px] font-bold text-[#30446f]">
                    active transforms
                  </p>
                  <p className="mt-1 text-[18px] font-black text-[#071024]">
                    {activeTransformCount}
                  </p>
                </div>
              </div>

              <p className="rounded-[8px] border border-[#cfd9f5] bg-[#fbfcff] px-4 py-3 text-[15px] font-semibold text-[#052cff]">
                Transforms compound: each block receives the image from the
                block above it.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </main>
  );
}
