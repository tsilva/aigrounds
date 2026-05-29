"use client";

import Image from "next/image";
import { type CSSProperties, useMemo, useState } from "react";
import {
  clampMixLambda,
  formatMixValue,
  getCutMixPatch,
  mixedLabelVector,
  type LabelMixExample,
  type LabelMixExampleId,
  type MixMode,
  oneHotVector,
} from "./label-mixing-image-transforms-engine";
import {
  defaultExampleAId,
  defaultExampleBId,
  defaultMixLambda,
  labelMixExamples,
} from "./scenario";

const classCount = labelMixExamples.length;

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[14px] border border-[#d8e0f3] bg-white/90 shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

function LessonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[19px] leading-tight font-black text-[#052cff] uppercase">
      {children}
    </h2>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      fill="currentColor"
    >
      <path d="M8 5.6v12.8L18.4 12 8 5.6Z" />
    </svg>
  );
}

function vectorText(vector: number[]) {
  return `[${vector.map((value) => formatMixValue(value)).join(", ")}]`;
}

function probabilityToken(example: LabelMixExample) {
  return `p_${example.label.replaceAll(" ", "_")}`;
}

function getExample(id: LabelMixExampleId) {
  return (
    labelMixExamples.find((example) => example.id === id) ?? labelMixExamples[0]
  );
}

function SourceCard({
  example,
  isA,
  isB,
  onSetA,
  onSetB,
}: {
  example: LabelMixExample;
  isA: boolean;
  isB: boolean;
  onSetA: () => void;
  onSetB: () => void;
}) {
  return (
    <div
      className={`rounded-[10px] border p-2 transition ${
        isA || isB
          ? "border-[#052cff] bg-[#f5f7ff] shadow-[0_12px_24px_rgba(38,63,255,0.08)]"
          : "border-[#d9e1f5] bg-white"
      }`}
    >
      <div className="relative aspect-[1.32] overflow-hidden rounded-[7px] bg-[#edf2ff]">
        <Image
          src={example.imageSrc}
          alt={example.imageAlt}
          fill
          sizes="(max-width: 768px) 42vw, 260px"
          className="object-cover"
          style={{ objectPosition: example.objectPosition }}
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {isA ? (
            <span className="rounded-[5px] bg-[#052cff] px-2 py-1 font-mono text-[11px] font-black text-white">
              A
            </span>
          ) : null}
          {isB ? (
            <span className="rounded-[5px] bg-[#052cff] px-2 py-1 font-mono text-[11px] font-black text-white">
              B
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-center text-[14px] font-black text-[#071024]">
        {example.label}
      </p>
      <p className="text-center font-mono text-[11px] font-bold text-[#34466f]">
        class {example.classIndex}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSetA}
          className={`rounded-[6px] border px-2 py-1 font-mono text-[11px] font-black ${
            isA
              ? "border-[#052cff] bg-[#052cff] text-white"
              : "border-[#d6def3] bg-white text-[#052cff]"
          }`}
        >
          A
        </button>
        <button
          type="button"
          onClick={onSetB}
          className={`rounded-[6px] border px-2 py-1 font-mono text-[11px] font-black ${
            isB
              ? "border-[#052cff] bg-[#052cff] text-white"
              : "border-[#d6def3] bg-white text-[#052cff]"
          }`}
        >
          B
        </button>
      </div>
    </div>
  );
}

function TargetRow({
  example,
  prefix,
}: {
  example: LabelMixExample;
  prefix: "A" | "B";
}) {
  return (
    <div className="rounded-[8px] border border-[#d9e1f5] bg-[#fbfcff] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-[6px] bg-[#052cff] px-2 py-1 font-mono text-[12px] font-black text-white">
            {prefix}
          </span>
          <p className="font-mono text-[13px] font-black text-[#071024]">
            y_{prefix} = {vectorText(oneHotVector(example.classIndex, classCount))}
          </p>
        </div>
        <p className="text-[12px] font-black text-[#052cff]">
          {example.label}{" "}
          <span className="font-mono text-[#30446f]">
            class {example.classIndex}
          </span>
        </p>
      </div>
    </div>
  );
}

function ModeButton({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[7px] border px-4 py-3 text-[13px] font-black transition ${
        isSelected
          ? "border-[#052cff] bg-[#052cff] text-white shadow-[0_12px_22px_rgba(23,53,255,0.16)]"
          : "border-[#d9e1f5] bg-white text-[#071024] hover:border-[#b8c5ed]"
      }`}
    >
      {label}
    </button>
  );
}

function MixedImage({
  exampleA,
  exampleB,
  lambda,
  mode,
  sampleSeed,
}: {
  exampleA: LabelMixExample;
  exampleB: LabelMixExample;
  lambda: number;
  mode: MixMode;
  sampleSeed: number;
}) {
  const patch = getCutMixPatch(lambda, sampleSeed);
  const patchStyle: CSSProperties = {
    height: `${patch.height * 100}%`,
    left: `${patch.left * 100}%`,
    top: `${patch.top * 100}%`,
    width: `${patch.width * 100}%`,
  };

  return (
    <div>
      <p className="mb-2 text-center text-[12px] font-black text-[#30446f] uppercase">
        Mixed image
      </p>
      <div className="relative aspect-[1.22] overflow-hidden rounded-[9px] border border-[#b9c6eb] bg-[#f8fbff]">
        <Image
          src={exampleA.imageSrc}
          alt={exampleA.imageAlt}
          fill
          sizes="(max-width: 768px) 92vw, 520px"
          className="object-cover"
          style={{ objectPosition: exampleA.objectPosition }}
        />
        {mode === "cutmix" ? (
          <div
            className="absolute overflow-hidden border-2 border-dashed border-[#052cff] shadow-[0_12px_28px_rgba(7,16,36,0.18)]"
            style={patchStyle}
          >
            <Image
              src={exampleB.imageSrc}
              alt={exampleB.imageAlt}
              fill
              sizes="260px"
              className="object-cover"
              style={{ objectPosition: exampleB.objectPosition }}
            />
          </div>
        ) : (
          <Image
            src={exampleB.imageSrc}
            alt={exampleB.imageAlt}
            fill
            sizes="(max-width: 768px) 92vw, 520px"
            className="object-cover"
            style={{
              objectPosition: exampleB.objectPosition,
              opacity: 1 - lambda,
            }}
          />
        )}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-[7px] border border-[#8ea0f8] bg-white/90 px-3 py-1 font-mono text-[12px] font-black text-[#052cff]">
          A {Math.round(lambda * 100)}% / B {Math.round((1 - lambda) * 100)}%
        </div>
      </div>
    </div>
  );
}

function SoftLabelChart({
  vector,
}: {
  vector: number[];
}) {
  return (
    <div className="rounded-[10px] border border-[#d9e1f5] bg-[#fbfcff] p-4">
      <p className="text-[12px] font-black text-[#052cff] uppercase">
        Soft label vector
      </p>
      <div className="mt-4 space-y-3">
        {labelMixExamples.map((example) => {
          const value = vector[example.classIndex] ?? 0;

          return (
            <div
              key={example.id}
              className="grid grid-cols-[104px_minmax(0,1fr)_42px] items-center gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] font-black text-[#071024]">
                  {example.label}
                </p>
                <p className="font-mono text-[10px] font-bold text-[#52628a]">
                  class {example.classIndex}
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#dfe5f1]">
                <div
                  className="h-full rounded-full bg-[#052cff]"
                  style={{ width: `${value * 100}%` }}
                />
              </div>
              <p className="text-right font-mono text-[12px] font-black text-[#071024]">
                {formatMixValue(value)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CodePreview({ mode }: { mode: MixMode }) {
  const transformName = mode === "cutmix" ? "CutMix" : "MixUp";
  const codeLines = [
    "from torchvision.transforms import v2",
    "",
    `transform = v2.${transformName}(num_classes=4, alpha=1.0)`,
    "images, labels = transform(images, labels)",
  ];

  return (
    <div className="rounded-[9px] border border-[#d4def5] bg-[#fbfcff]">
      <div className="border-b border-[#d4def5] px-4 py-3">
        <p className="text-[13px] font-black text-[#052cff] uppercase">
          PyTorch code preview
        </p>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-6 font-semibold text-[#071024]">
        {codeLines.map((line, index) => (
          <code key={`${line}-${index}`} className="block">
            {line || " "}
          </code>
        ))}
      </pre>
    </div>
  );
}

function WeightedLossPanel({
  exampleA,
  exampleB,
  lambda,
}: {
  exampleA: LabelMixExample;
  exampleB: LabelMixExample;
  lambda: number;
}) {
  return (
    <Panel className="p-5">
      <LessonTitle>3. What The Loss Sees</LessonTitle>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <div className="rounded-[10px] border border-[#d9e1f5] bg-[#fbfcff] p-4">
          <p className="text-[12px] font-black text-[#052cff] uppercase">
            Weighted cross-entropy
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[13px] font-black text-[#071024]">
            <span className="rounded-[7px] border border-[#d9e1f5] bg-white px-3 py-2">
              {formatMixValue(lambda)} x -log({probabilityToken(exampleA)})
            </span>
            <span>+</span>
            <span className="rounded-[7px] border border-[#d9e1f5] bg-white px-3 py-2">
              {formatMixValue(1 - lambda)} x -log({probabilityToken(exampleB)})
            </span>
          </div>
          <p className="mt-4 text-[14px] font-semibold text-[#30446f]">
            The model is rewarded for putting probability on both visible
            classes in the same proportions as the mixed target.
          </p>
        </div>

        <div className="rounded-[10px] border border-[#bfe8cd] bg-[#f6fff8] p-4">
          <p className="text-[13px] font-black text-[#086d27]">
            Labels are no longer one-hot.
          </p>
          <div className="mt-4 space-y-2 text-[12px] font-bold text-[#30446f]">
            <div className="flex items-center justify-between rounded-[7px] border border-[#d9e1f5] bg-white px-3 py-2">
              <span>RandomCrop</span>
              <span className="rounded-full bg-[#ddfbe7] px-2 py-1 text-[#08722a]">
                one-hot
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[7px] border border-[#d9e1f5] bg-white px-3 py-2">
              <span>CutMix / MixUp</span>
              <span className="rounded-full bg-[#e9edff] px-2 py-1 text-[#052cff]">
                soft
              </span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function LabelMixingImageTransformsPlayground() {
  const [exampleAId, setExampleAId] =
    useState<LabelMixExampleId>(defaultExampleAId);
  const [exampleBId, setExampleBId] =
    useState<LabelMixExampleId>(defaultExampleBId);
  const [mode, setMode] = useState<MixMode>("cutmix");
  const [lambda, setLambda] = useState(defaultMixLambda);
  const [sampleSeed, setSampleSeed] = useState(7);

  const exampleA = getExample(exampleAId);
  const exampleB = getExample(exampleBId);
  const mixedVector = useMemo(
    () =>
      mixedLabelVector({
        classCount,
        exampleA,
        exampleB,
        lambda,
      }),
    [exampleA, exampleB, lambda],
  );

  function setSourceA(nextId: LabelMixExampleId) {
    setExampleAId(nextId);

    if (nextId === exampleBId) {
      setExampleBId(exampleAId);
    }
  }

  function setSourceB(nextId: LabelMixExampleId) {
    setExampleBId(nextId);

    if (nextId === exampleAId) {
      setExampleAId(exampleBId);
    }
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfcff] px-3 py-4 text-[#071024] sm:px-5">
      <div className="mx-auto max-w-[1536px]">
        <header className="mb-4 pl-0 sm:pl-2">
          <h1 className="min-w-0 break-words text-[38px] leading-[1] font-black text-[#030713] sm:text-[58px]">
            Label-Mixing Image Transforms
          </h1>
          <p className="mt-2 max-w-[68rem] text-[18px] leading-tight font-medium text-[#10245a] sm:text-[22px]">
            CutMix and MixUp change the image and the target vector together.
          </p>
        </header>

        <div className="space-y-4">
          <Panel className="p-5">
            <LessonTitle>1. Pick Two Training Examples</LessonTitle>
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.55fr)]">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {labelMixExamples.map((example) => (
                  <SourceCard
                    key={example.id}
                    example={example}
                    isA={example.id === exampleA.id}
                    isB={example.id === exampleB.id}
                    onSetA={() => setSourceA(example.id)}
                    onSetB={() => setSourceB(example.id)}
                  />
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-[12px] font-black text-[#052cff] uppercase">
                  Target vectors before mixing
                </p>
                <TargetRow example={exampleA} prefix="A" />
                <TargetRow example={exampleB} prefix="B" />
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <LessonTitle>2. Mix Pixels, Then Mix Labels</LessonTitle>
            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(330px,0.48fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <ModeButton
                    isSelected={mode === "cutmix"}
                    label="CutMix"
                    onClick={() => setMode("cutmix")}
                  />
                  <ModeButton
                    isSelected={mode === "mixup"}
                    label="MixUp"
                    onClick={() => setMode("mixup")}
                  />
                </div>

                <div className="rounded-[9px] border border-[#d9e1f5] bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="lambda-slider"
                      className="text-[13px] font-black text-[#10245a]"
                    >
                      lambda / area from A
                    </label>
                    <span className="rounded-[7px] border border-[#d4def5] bg-[#fbfcff] px-3 py-2 font-mono text-[13px] font-black text-[#071024]">
                      {formatMixValue(lambda)}
                    </span>
                  </div>
                  <input
                    id="lambda-slider"
                    type="range"
                    min={0.05}
                    max={0.95}
                    step={0.01}
                    value={lambda}
                    onChange={(event) =>
                      setLambda(clampMixLambda(Number(event.target.value)))
                    }
                    className="mt-3 w-full accent-[#052cff]"
                  />
                  <button
                    type="button"
                    onClick={() => setSampleSeed((seed) => seed + 1)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[7px] border border-[#d9e1f5] bg-white px-4 py-3 text-[13px] font-black text-[#052cff] transition hover:border-[#052cff] hover:bg-[#eef3ff]"
                  >
                    <PlayIcon />
                    Sample
                  </button>
                </div>

                <CodePreview mode={mode} />
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
                <MixedImage
                  exampleA={exampleA}
                  exampleB={exampleB}
                  lambda={lambda}
                  mode={mode}
                  sampleSeed={sampleSeed}
                />
                <div className="space-y-4">
                  <SoftLabelChart vector={mixedVector} />
                  <div className="rounded-[9px] border border-[#d9e1f5] bg-[#fbfcff] p-4">
                    <p className="text-[12px] font-black text-[#052cff] uppercase">
                      Formula
                    </p>
                    <p className="mt-3 rounded-[7px] border border-[#d9e1f5] bg-white px-3 py-3 font-mono text-[13px] font-black text-[#071024]">
                      y_mix = lambda * y_A + (1 - lambda) * y_B
                    </p>
                    <p className="mt-3 font-mono text-[12px] font-bold text-[#30446f]">
                      lambda = {formatMixValue(lambda)} ; 1 - lambda ={" "}
                      {formatMixValue(1 - lambda)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <WeightedLossPanel
            exampleA={exampleA}
            exampleB={exampleB}
            lambda={lambda}
          />
        </div>
      </div>
    </main>
  );
}
