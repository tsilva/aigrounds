"use client";

import Image from "next/image";
import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import {
  calculateMixAnalysis,
  calculateSingleImageAnalysis,
  formatDecimal,
  formatPercent,
  getFamilyForTransform,
  type AugmentationFamilyId,
  type ClassExample,
  type TransformDefinition,
  type TransformId,
} from "./pytorch-image-augmentations-engine";
import {
  augmentationFamilies,
  classExamples,
  defaultFamilyId,
  defaultLambda,
  defaultStrength,
  defaultTransformId,
  transformDefinitions,
} from "./scenario";

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-[12px] border border-[#c8d5f6] bg-white shadow-[0_14px_34px_rgba(58,88,160,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

function LessonTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[16px] leading-tight font-black text-[#052cff] uppercase sm:text-[19px]">
      {children}
    </h2>
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
      <path d="M9.4 9a2.8 2.8 0 0 1 5.2 1.4c0 1.9-2.2 2.2-2.2 3.7" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function FamilyIcon({ familyId }: { familyId: AugmentationFamilyId }) {
  if (familyId === "batch-mixing") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className="size-10">
        <path
          d="M10 11h13v13H10zM17 17h13v13H17z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M9 29h6M25 9h6M30 9v6M15 29v-6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (familyId === "color") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className="size-10">
        <circle
          cx="20"
          cy="20"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M20 5v5M20 30v5M5 20h5M30 20h5M9.4 9.4l3.6 3.6M27 27l3.6 3.6M30.6 9.4 27 13M13 27l-3.6 3.6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (familyId === "occlusion") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className="size-10">
        <path
          d="M10 9h18v18H10z"
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 3"
          strokeWidth="2"
        />
        <path d="M22 22h10v10H22z" fill="currentColor" opacity="0.82" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="size-10">
      <path
        d="M11 9h18v18H11zM8 16V9h7M32 20v7h-7"
        fill="none"
        stroke="currentColor"
        strokeDasharray="5 3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="m11 30-4-4 4-4M29 10l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ObjectThumbnail({
  example,
  variant = "normal",
}: {
  example: ClassExample;
  variant?: "normal" | "flipped" | "cropped" | "erased" | "jitter";
}) {
  const isMuted = variant === "erased";
  const scaleClass = variant === "cropped" ? "scale-125" : "";
  const flipClass = variant === "flipped" ? "-scale-x-100" : "";
  const filterClass =
    variant === "jitter"
      ? "saturate-[1.6] contrast-[1.18]"
      : isMuted
        ? "opacity-80 grayscale"
        : "";

  return (
    <div
      className={`relative flex aspect-[4/2.15] min-h-0 items-center justify-center overflow-hidden rounded-[8px] border border-[#b8c5e8] bg-[#f8fbff] ${filterClass}`}
    >
      <Image
        src={example.imageSrc}
        alt={example.imageAlt}
        fill
        sizes="(max-width: 768px) 44vw, 180px"
        className={`object-cover transition ${scaleClass} ${flipClass}`}
        style={{ objectPosition: example.objectPosition }}
      />
      {isMuted ? (
        <div className="absolute top-[26%] left-[48%] h-[44%] w-[30%] rounded bg-[#0f172a]/70" />
      ) : null}
    </div>
  );
}

type TransformPreviewVisual = {
  imageStyle: CSSProperties;
  overlayStyle?: CSSProperties;
  caption: string;
};

const cropFocusByExampleId: Record<ClassExample["id"], string> = {
  cat: "44% 42%",
  sneaker: "44% 62%",
  "stop-sign": "50% 50%",
  leaf: "58% 48%",
};

function clampPreviewStrength(strength: number) {
  return Math.max(0, Math.min(1, strength));
}

function getTransformPreviewVisual({
  activeTransform,
  example,
  strength,
}: {
  activeTransform: TransformDefinition;
  example: ClassExample;
  strength: number;
}): TransformPreviewVisual {
  const amount = clampPreviewStrength(strength);
  const baseStyle: CSSProperties = {
    objectPosition: example.objectPosition,
    transform: "none",
    filter: "none",
  };

  if (activeTransform.id === "random-resized-crop") {
    const zoom = 1 + amount * 0.46;

    return {
      imageStyle: {
        ...baseStyle,
        objectPosition:
          amount > 0.08
            ? cropFocusByExampleId[example.id]
            : example.objectPosition,
        transform: `scale(${zoom})`,
      },
      caption: `crop window ${(100 / zoom).toFixed(0)}% of original`,
    };
  }

  if (activeTransform.id === "horizontal-flip") {
    return {
      imageStyle: {
        ...baseStyle,
        transform: amount === 0 ? "scaleX(1)" : "scaleX(-1)",
      },
      caption:
        amount === 0
          ? "p=0.00, sample passes through"
          : `mirrored sample, p=${formatDecimal(amount)}`,
    };
  }

  if (activeTransform.id === "rotation") {
    const degrees = amount * 30;

    return {
      imageStyle: {
        ...baseStyle,
        transform: `rotate(${degrees.toFixed(1)}deg) scale(1.08)`,
      },
      caption: `${degrees.toFixed(1)}deg rotation`,
    };
  }

  if (activeTransform.id === "color-jitter") {
    const brightness = 1 + amount * 0.34;
    const contrast = 1 + amount * 0.32;
    const saturation = 1 + amount * 0.7;

    return {
      imageStyle: {
        ...baseStyle,
        filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`,
      },
      caption: `brightness x${brightness.toFixed(
        2,
      )}, contrast x${contrast.toFixed(2)}`,
    };
  }

  if (activeTransform.id === "random-grayscale") {
    return {
      imageStyle: {
        ...baseStyle,
        filter: `grayscale(${amount}) contrast(${1 + amount * 0.12})`,
      },
      caption: `${Math.round(amount * 100)}% grayscale`,
    };
  }

  if (activeTransform.id === "gaussian-blur") {
    const blur = amount * 4.2;

    return {
      imageStyle: {
        ...baseStyle,
        filter: `blur(${blur.toFixed(2)}px)`,
        transform: "scale(1.03)",
      },
      caption: `blur sigma proxy ${blur.toFixed(2)}px`,
    };
  }

  if (activeTransform.id === "random-erasing") {
    return {
      imageStyle: {
        ...baseStyle,
        filter: `saturate(${1 - amount * 0.18})`,
      },
      overlayStyle: {
        top: `${20 + amount * 8}%`,
        left: `${46 - amount * 16}%`,
        width: `${14 + amount * 30}%`,
        height: `${12 + amount * 34}%`,
        opacity: 0.28 + amount * 0.68,
      },
      caption: `erase patch covers about ${Math.round(
        (0.02 + amount * 0.22) * 100,
      )}%`,
    };
  }

  const hue = -14 + amount * 28;

  return {
    imageStyle: {
      ...baseStyle,
      filter: `contrast(${1 + amount * 0.28}) saturate(${
        1 + amount * 0.85
      }) hue-rotate(${hue.toFixed(1)}deg)`,
      transform: `rotate(${(amount * 7 - 3.5).toFixed(1)}deg) scale(${
        1 + amount * 0.08
      })`,
    },
    caption: `AugMix-style color and geometry chain, width ${formatDecimal(
      amount,
    )}`,
  };
}

function TransformPreviewImage({
  activeTransform,
  example,
  strength,
  mode,
}: {
  activeTransform: TransformDefinition;
  example: ClassExample;
  strength: number;
  mode: "original" | "augmented";
}) {
  const visual: TransformPreviewVisual =
    mode === "augmented"
      ? getTransformPreviewVisual({ activeTransform, example, strength })
      : {
          imageStyle: {
            objectPosition: example.objectPosition,
          },
          caption: "source image",
        };

  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/2.55] overflow-hidden rounded-[8px] border border-[#b8c5e8] bg-[#f8fbff]">
        <Image
          src={example.imageSrc}
          alt={
            mode === "augmented"
              ? `${example.imageAlt}, augmented with ${activeTransform.title}`
              : example.imageAlt
          }
          fill
          sizes="(max-width: 768px) 92vw, 520px"
          className="object-cover transition-[filter,transform] duration-200 ease-out"
          style={visual.imageStyle}
        />
        {visual.overlayStyle ? (
          <div
            className="absolute rounded-[5px] bg-[#0f172a]"
            style={visual.overlayStyle}
          />
        ) : null}
      </div>
      <p className="min-h-[20px] text-center font-mono text-[12px] font-black text-[#30446f]">
        {visual.caption}
      </p>
    </div>
  );
}

function CutMixThumbnail({
  sourceA,
  sourceB,
  patchPercent,
}: {
  sourceA: ClassExample;
  sourceB: ClassExample;
  patchPercent: number;
}) {
  return (
    <div className="relative">
      <ObjectThumbnail example={sourceA} />
      <div
        className="absolute top-[18%] right-[8%] overflow-hidden rounded-[4px] border-2 border-white shadow-[0_8px_20px_rgba(15,23,42,0.28)]"
        style={{
          width: `${Math.max(24, Math.min(54, patchPercent + 18))}%`,
          height: `${Math.max(28, Math.min(60, patchPercent + 22))}%`,
        }}
      >
        <ObjectThumbnail example={sourceB} variant="cropped" />
      </div>
    </div>
  );
}

function MixUpThumbnail({
  sourceA,
  sourceB,
  sourceBWeight,
}: {
  sourceA: ClassExample;
  sourceB: ClassExample;
  sourceBWeight: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-[8px] border border-[#b8c5e8] bg-[#f8fbff]">
      <ObjectThumbnail example={sourceA} />
      <div
        className="absolute inset-0"
        style={{ opacity: Math.max(0.18, Math.min(0.78, sourceBWeight)) }}
      >
        <ObjectThumbnail example={sourceB} />
      </div>
      <div className="absolute right-2 bottom-2 rounded-[4px] bg-white/90 px-2 py-1 font-mono text-[12px] font-black text-[#071024] shadow">
        blend
      </div>
    </div>
  );
}

function MetricPill({
  label,
  value,
  tone = "blue",
}: {
  label: string;
  value: string;
  tone?: "blue" | "red" | "neutral";
}) {
  const valueClass =
    tone === "red"
      ? "text-[#ff1d37]"
      : tone === "neutral"
        ? "text-[#071024]"
        : "text-[#052cff]";

  return (
    <div className="min-w-0 rounded-[8px] border border-[#dbe4ff] bg-white px-3 py-3 text-center">
      <p className="text-[11px] leading-tight font-black text-[#30446f] uppercase">
        {label}
      </p>
      <p className={`mt-2 font-mono text-[22px] leading-none font-black ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function SoftTargetBars({
  sourceA,
  sourceB,
  sourceAWeight,
  sourceBWeight,
}: {
  sourceA: ClassExample;
  sourceB: ClassExample;
  sourceAWeight: number;
  sourceBWeight: number;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="grid grid-cols-[92px_minmax(0,1fr)_48px] items-center gap-3">
        <span className="text-[13px] font-bold text-[#10245a]">
          {sourceA.label} ({sourceA.classIndex})
        </span>
        <div className="h-6 overflow-hidden rounded-[4px] border border-[#c8d5f6] bg-white">
          <div
            className="h-full bg-[#052cff]"
            style={{ width: `${sourceAWeight * 100}%` }}
          />
        </div>
        <span className="font-mono text-[14px] font-black">
          {formatDecimal(sourceAWeight)}
        </span>
      </div>
      <div className="grid grid-cols-[92px_minmax(0,1fr)_48px] items-center gap-3">
        <span className="text-[13px] font-bold text-[#10245a]">
          {sourceB.label} ({sourceB.classIndex})
        </span>
        <div className="h-6 overflow-hidden rounded-[4px] border border-[#c8d5f6] bg-white">
          <div
            className="h-full bg-[#ff1d37]"
            style={{ width: `${sourceBWeight * 100}%` }}
          />
        </div>
        <span className="font-mono text-[14px] font-black">
          {formatDecimal(sourceBWeight)}
        </span>
      </div>
      <p className="border-t border-dashed border-[#c8d5f6] pt-2 text-center font-mono text-[13px] font-bold text-[#30446f]">
        sum = 1.00
      </p>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  quickValues,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  quickValues?: number[];
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="grid grid-cols-1 gap-2 text-[14px] font-semibold text-[#10245a] sm:grid-cols-[150px_minmax(0,1fr)_74px] sm:items-center sm:gap-4">
        <span>{label}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full accent-[#1735ff]"
        />
        <span className="rounded-[6px] border border-[#d4def5] bg-white px-3 py-2 text-center font-mono font-black text-[#071024]">
          {formatDecimal(value)}
        </span>
      </label>
      {quickValues ? (
        <div className="flex flex-wrap gap-2 sm:ml-[166px]">
          {quickValues.map((quickValue) => (
            <button
              key={quickValue}
              type="button"
              onClick={() => onChange(quickValue)}
              className={`rounded-[6px] border px-3 py-1.5 font-mono text-[12px] font-black transition ${
                Math.abs(value - quickValue) < step / 2
                  ? "border-[#052cff] bg-[#052cff] text-white"
                  : "border-[#d4def5] bg-white text-[#10245a] hover:border-[#aebced]"
              }`}
            >
              set {formatDecimal(quickValue)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FamilyPanel({
  activeFamilyId,
  onSelectFamily,
}: {
  activeFamilyId: AugmentationFamilyId;
  onSelectFamily: (familyId: AugmentationFamilyId) => void;
}) {
  return (
    <Panel className="p-4 sm:p-5">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <LessonTitle>1. Choose The Augmentation Assumption</LessonTitle>
          <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            {augmentationFamilies.map((family) => {
              const isActive = family.id === activeFamilyId;

              return (
                <button
                  key={family.id}
                  type="button"
                  onClick={() => onSelectFamily(family.id)}
                  className={`min-h-[130px] rounded-[9px] border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-[#1735ff] bg-[linear-gradient(180deg,#123cff,#0227d7)] text-white shadow-[0_16px_28px_rgba(23,53,255,0.18)]"
                      : "border-[#d8e1f5] bg-white text-[#071024] hover:border-[#aebced]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-white" : "text-[#052cff]"}>
                      <FamilyIcon familyId={family.id} />
                    </span>
                    <span className="text-[17px] font-black">
                      {family.title}
                    </span>
                  </div>
                  <div
                    className={`mt-3 space-y-1 font-mono text-[13px] leading-tight ${
                      isActive ? "text-white" : "text-[#0f1f4a]"
                    }`}
                  >
                    {family.transforms.map((transformId) => {
                      const transform = transformDefinitions.find(
                        (item) => item.id === transformId,
                      );

                      return transform ? (
                        <p key={transform.id}>{transform.title}</p>
                      ) : null;
                    })}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-[7px] border border-[#cfd9f5] bg-[#fbfcff] px-3 py-2 text-[13px] font-bold text-[#052cff]">
            <span aria-hidden="true">+</span>
            <span>AugMix: image-only robustness, label stays one-hot</span>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#d6e0f6] bg-white p-4">
          <p className="text-[15px] font-black text-[#052cff] uppercase">
            The Label Contract
          </p>
          <div className="mt-4 space-y-4 text-[15px] font-semibold text-[#071024]">
            <div className="grid grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] items-center gap-3">
              <span>Single-image transforms</span>
              <span className="text-center text-[22px] text-[#071024]">→</span>
              <span>one-hot label survives</span>
            </div>
            <div className="border-t border-[#c8d5f6]" />
            <div className="grid grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] items-center gap-3">
              <span>CutMix / MixUp</span>
              <span className="text-center text-[22px] text-[#071024]">→</span>
              <span>soft label is required</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function TransformPanel({
  activeTransform,
  activeFamilyId,
  alpha,
  lambda,
  strength,
  onSelectTransform,
  onChangeAlpha,
  onChangeLambda,
  onChangeStrength,
}: {
  activeTransform: TransformDefinition;
  activeFamilyId: AugmentationFamilyId;
  alpha: number;
  lambda: number;
  strength: number;
  onSelectTransform: (transformId: TransformId) => void;
  onChangeAlpha: (value: number) => void;
  onChangeLambda: (value: number) => void;
  onChangeStrength: (value: number) => void;
}) {
  const shownTransforms: TransformId[] =
    activeFamilyId === "batch-mixing"
      ? ["cutmix", "mixup"]
      : activeFamilyId === "color"
        ? ["color-jitter", "random-grayscale", "gaussian-blur", "augmix"]
        : augmentationFamilies.find((family) => family.id === activeFamilyId)
            ?.transforms ?? [];
  const code =
    activeTransform.labelBehavior === "soft"
      ? activeTransform.id === "mixup"
        ? [
            "from torchvision.transforms import v2",
            "",
            "mixup = v2.MixUp(num_classes=4, alpha=1.0)",
            "images, labels = mixup(images, labels)",
          ]
        : [
            "from torchvision.transforms import v2",
            "",
            "cutmix = v2.CutMix(num_classes=4, alpha=1.0)",
            "images, labels = cutmix(images, labels)",
          ]
      : [
          "from torchvision.transforms import v2",
          "",
          "transform = v2.Compose([",
          `    ${activeTransform.codeName},`,
          "])",
          "image = transform(image)",
        ];

  return (
    <Panel className="p-4 sm:p-5">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,0.82fr)_minmax(520px,1fr)]">
        <div>
          <LessonTitle>2. Tune The Transform</LessonTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {shownTransforms.map((transformId) => {
              const transform = transformDefinitions.find(
                (item) => item.id === transformId,
              );

              if (!transform) {
                return null;
              }

              const isActive = transform.id === activeTransform.id;

              return (
                <button
                  key={transform.id}
                  type="button"
                  onClick={() => onSelectTransform(transform.id)}
                  className={`rounded-[7px] border px-5 py-2 text-[14px] font-bold transition ${
                    isActive
                      ? "border-[#052cff] bg-[#052cff] text-white"
                      : "border-[#d7e0f3] bg-white text-[#071024] hover:border-[#aebced]"
                  }`}
                >
                  {transform.title}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] leading-5 font-bold text-[#30446f]">
            Guide path: CutMix, MixUp, RandomResizedCrop, and AugMix. Other
            transform tabs are optional comparisons.
          </p>
          <div className="mt-5 space-y-4">
            {activeTransform.labelBehavior === "soft" ? (
              <>
                <RangeControl
                  label="alpha (Beta)"
                  value={alpha}
                  min={0.2}
                  max={2}
                  step={0.1}
                  onChange={onChangeAlpha}
                />
                <RangeControl
                  label="lambda Source A"
                  value={lambda}
                  min={0.05}
                  max={0.95}
                  step={0.01}
                  quickValues={[0.4, defaultLambda, 0.8]}
                  onChange={onChangeLambda}
                />
                <div className="grid grid-cols-1 gap-2 text-[14px] font-semibold text-[#10245a] sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center sm:gap-4">
                  <span>mix choice</span>
                  <select
                    value={activeTransform.id}
                    onChange={(event) =>
                      onSelectTransform(event.target.value as TransformId)
                    }
                    className="rounded-[7px] border border-[#d4def5] bg-white px-3 py-2 font-bold text-[#071024]"
                  >
                    <option value="cutmix">CutMix</option>
                    <option value="mixup">MixUp</option>
                  </select>
                </div>
                <p className="rounded-[7px] border border-[#d6e0f6] bg-[#fbfcff] px-3 py-2 text-[13px] font-bold text-[#052cff]">
                  Guide focus: move lambda directly. Optional context: alpha
                  shapes sampled lambdas in real PyTorch; mix choice switches
                  between CutMix and MixUp.
                </p>
                <p className="rounded-[7px] border border-[#d6e0f6] bg-[#fbfcff] px-3 py-2 text-[13px] font-bold text-[#052cff]">
                  lambda semantics: Source A gets lambda; Source B gets 1 -
                  lambda.
                </p>
              </>
            ) : (
              <>
                <RangeControl
                  label="strength"
                  value={strength}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={onChangeStrength}
                />
                <p className="rounded-[7px] border border-[#d6e0f6] bg-[#fbfcff] px-3 py-2 text-[13px] font-bold text-[#052cff]">
                  {activeTransform.helper}
                </p>
                <p className="rounded-[7px] border border-[#d6e0f6] bg-[#fbfcff] px-3 py-2 text-[13px] font-bold text-[#052cff]">
                  Guide focus: leave strength at 0.70 unless exploring; higher
                  strength makes the single-image transform more intense.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[9px] border border-[#d4def5] bg-[#fbfcff]">
          <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-6 font-semibold text-[#071024] sm:text-[14px]">
            {code.map((line, index) => (
              <code key={`${line}-${index}`} className="block">
                {line}
              </code>
            ))}
          </pre>
          <p className="border-t border-[#d4def5] px-4 py-3 text-[13px] font-semibold text-[#30446f]">
            {activeTransform.labelBehavior === "soft"
              ? "Use after batching, or from collate_fn."
              : "Single-image transforms can run before batching."}
          </p>
        </div>
      </div>
    </Panel>
  );
}

function BatchMixPanel({
  activeTransform,
  lambda,
}: {
  activeTransform: TransformDefinition;
  lambda: number;
}) {
  const analysis = calculateMixAnalysis(lambda);
  const pairOne = [classExamples[0], classExamples[1]] as const;
  const pairTwo = [classExamples[2], classExamples[3]] as const;
  const isMixUp = activeTransform.id === "mixup";
  const resultTitle = isMixUp
    ? `MixUp result (${analysis.sourceAPercent}% A / ${analysis.sourceBPercent}% B)`
    : `CutMix result (${analysis.sourceBPercent}% from B)`;

  return (
    <Panel className="p-4 sm:p-5">
      <LessonTitle>3. Watch A Batch Pair Mix</LessonTitle>
      <div className="mt-4 space-y-5">
        {[pairOne, pairTwo].map(([sourceA, sourceB]) => (
          <div
            key={sourceA.id}
            className="grid gap-4 border-b border-dashed border-[#c8d5f6] pb-5 last:border-b-0 last:pb-0 2xl:grid-cols-[170px_24px_170px_42px_220px_minmax(320px,1fr)] 2xl:items-center"
          >
            <div>
              <p className="mb-2 text-center text-[12px] font-black text-[#052cff] uppercase">
                Source A ({formatDecimal(analysis.sourceAWeight)})
              </p>
              <ObjectThumbnail example={sourceA} />
              <p className="mt-2 text-center text-[13px] font-bold text-[#10245a]">
                {sourceA.label} class {sourceA.classIndex}
              </p>
            </div>
            <div className="hidden text-center text-[34px] font-light text-[#071024] 2xl:block">
              +
            </div>
            <div>
              <p className="mb-2 text-center text-[12px] font-black text-[#ff1d37] uppercase">
                Source B ({formatDecimal(analysis.sourceBWeight)})
              </p>
              <ObjectThumbnail example={sourceB} />
              <p className="mt-2 text-center text-[13px] font-bold text-[#10245a]">
                {sourceB.label} class {sourceB.classIndex}
              </p>
            </div>
            <div className="hidden text-center text-[34px] font-light text-[#071024] 2xl:block">
              →
            </div>
            <div>
              <p className="mb-2 text-center text-[12px] font-black text-[#052cff] uppercase">
                {resultTitle}
              </p>
              {isMixUp ? (
                <MixUpThumbnail
                  sourceA={sourceA}
                  sourceB={sourceB}
                  sourceBWeight={analysis.sourceBWeight}
                />
              ) : (
                <CutMixThumbnail
                  sourceA={sourceA}
                  sourceB={sourceB}
                  patchPercent={analysis.sourceBPercent}
                />
              )}
            </div>
            <div>
              <p className="mb-2 text-center text-[12px] font-black text-[#052cff] uppercase">
                Soft target (class probabilities)
              </p>
              <SoftTargetBars
                sourceA={sourceA}
                sourceB={sourceB}
                sourceAWeight={analysis.sourceAWeight}
                sourceBWeight={analysis.sourceBWeight}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SingleImagePanel({
  activeTransform,
  strength,
  selectedExample,
  onSelectExample,
}: {
  activeTransform: TransformDefinition;
  strength: number;
  selectedExample: ClassExample;
  onSelectExample: (exampleId: ClassExample["id"]) => void;
}) {
  return (
    <Panel className="p-4 sm:p-5">
      <LessonTitle>3. Compare Original vs Augmented</LessonTitle>
      <div className="mt-4 grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
        <div>
          <p className="mb-2 text-[12px] font-black text-[#30446f] uppercase">
            Select source image
          </p>
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
            {classExamples.map((example) => {
              const isSelected = example.id === selectedExample.id;

              return (
                <button
                  key={example.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectExample(example.id)}
                  className={`rounded-[9px] border p-1.5 text-left transition ${
                    isSelected
                      ? "border-[#052cff] bg-[#eef3ff] shadow-[0_10px_22px_rgba(23,53,255,0.14)]"
                      : "border-[#d7e0f3] bg-white hover:border-[#aebced]"
                  }`}
                >
                  <ObjectThumbnail example={example} />
                  <p className="mt-1.5 text-center text-[12px] font-black text-[#10245a]">
                    {example.label} / class {example.classIndex}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-center text-[12px] font-black text-[#052cff] uppercase">
            {selectedExample.label}: {activeTransform.title}, strength{" "}
            {formatDecimal(strength)}
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-center text-[12px] font-black text-[#30446f] uppercase">
                Original
              </p>
              <TransformPreviewImage
                activeTransform={activeTransform}
                example={selectedExample}
                strength={strength}
                mode="original"
              />
            </div>
            <div>
              <p className="mb-2 text-center text-[12px] font-black text-[#052cff] uppercase">
                Augmented
              </p>
              <TransformPreviewImage
                activeTransform={activeTransform}
                example={selectedExample}
                strength={strength}
                mode="augmented"
              />
            </div>
          </div>
          <p className="mt-3 rounded-[7px] border border-[#d6e0f6] bg-[#fbfcff] px-3 py-2 text-[13px] font-bold text-[#052cff]">
            Label stays one-hot for class {selectedExample.classIndex}; only the
            image pixels are transformed.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function MetricsPanel({
  activeTransform,
  lambda,
  strength,
}: {
  activeTransform: TransformDefinition;
  lambda: number;
  strength: number;
}) {
  const isSoft = activeTransform.labelBehavior === "soft";
  const mixAnalysis = calculateMixAnalysis(lambda);
  const singleAnalysis = calculateSingleImageAnalysis(activeTransform, strength);
  const meterValue = isSoft
    ? mixAnalysis.oneHotViolation
    : singleAnalysis.risk;

  return (
    <Panel className="p-4 sm:p-5">
      <LessonTitle>4. Check What Changed</LessonTitle>
      <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px] 2xl:items-center">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {isSoft ? (
            <>
              <MetricPill label="Label mode" value={mixAnalysis.labelMode} />
              <MetricPill
                label="Source A weight"
                value={`${mixAnalysis.sourceAPercent}%`}
              />
              <MetricPill
                label={
                  activeTransform.id === "mixup"
                    ? "Source B blend"
                    : "Source B patch"
                }
                value={`${mixAnalysis.sourceBPercent}%`}
                tone="red"
              />
              <MetricPill
                label="Label entropy"
                value={`${formatDecimal(mixAnalysis.entropyBits)} bits`}
              />
            </>
          ) : (
            <>
              <MetricPill label="Label mode" value={singleAnalysis.labelMode} />
              <MetricPill
                label="Label clarity"
                value={formatPercent(singleAnalysis.labelClarity)}
              />
              <MetricPill
                label="Diversity gain"
                value={`+${formatPercent(singleAnalysis.diversityGain)}`}
              />
              <MetricPill
                label="Risk"
                value={formatPercent(singleAnalysis.risk)}
                tone={singleAnalysis.risk > 0.22 ? "red" : "blue"}
              />
            </>
          )}
        </div>
        <div className="rounded-[9px] border border-[#d6e0f6] bg-[#fbfcff] p-4">
          <div className="flex items-center justify-between gap-3 text-[13px] font-black text-[#10245a] uppercase">
            <span>{isSoft ? "One-hot violation" : "Label confusion risk"}</span>
            <span className="font-mono text-[#052cff]">
              {isSoft ? "amber-low" : "low"}
            </span>
          </div>
          <div className="relative mt-4 h-5 rounded-full bg-[linear-gradient(90deg,#16a34a,#facc15,#ff2525)]">
            <div
              className="absolute top-[-7px] h-9 w-1.5 rounded-full bg-[#071024]"
              style={{ left: `calc(${meterValue * 100}% - 3px)` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[12px] font-bold text-[#30446f]">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-[8px] border border-[#cfd9f5] bg-[#fbfcff] px-4 py-3 text-[16px] font-semibold text-[#10245a]">
        {isSoft
          ? "The target changes because the mixed image contains evidence for two classes."
          : "Good single-image augmentation changes nuisance details, not the class."}
      </div>
    </Panel>
  );
}

export function PytorchImageAugmentationsPlayground() {
  const [activeFamilyId, setActiveFamilyId] =
    useState<AugmentationFamilyId>(defaultFamilyId);
  const [activeTransformId, setActiveTransformId] =
    useState<TransformId>(defaultTransformId);
  const [alpha, setAlpha] = useState(1);
  const [lambda, setLambda] = useState(defaultLambda);
  const [strength, setStrength] = useState(defaultStrength);
  const [selectedExampleId, setSelectedExampleId] =
    useState<ClassExample["id"]>("cat");

  const activeTransform = useMemo(
    () =>
      transformDefinitions.find((transform) => transform.id === activeTransformId) ??
      transformDefinitions.find((transform) => transform.id === defaultTransformId)!,
    [activeTransformId],
  );
  const selectedExample = useMemo(
    () =>
      classExamples.find((example) => example.id === selectedExampleId) ??
      classExamples[0],
    [selectedExampleId],
  );

  function selectFamily(familyId: AugmentationFamilyId) {
    const family = augmentationFamilies.find((item) => item.id === familyId);

    if (!family) {
      return;
    }

    setActiveFamilyId(familyId);
    setActiveTransformId(family.transforms[0]);
  }

  function selectTransform(transformId: TransformId) {
    const transform = transformDefinitions.find((item) => item.id === transformId);

    if (!transform) {
      return;
    }

    setActiveTransformId(transform.id);
    setActiveFamilyId(getFamilyForTransform(transform));
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfcff] px-3 py-4 text-[#071024] sm:px-5">
      <div className="mx-auto max-w-[1536px]">
        <header className="mb-4 pl-0 sm:pl-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="min-w-0 break-words text-[38px] leading-[1] font-black tracking-[-0.055em] text-[#030713] sm:text-[52px]">
                PyTorch Image Augmentations
              </h1>
              <p className="mt-2 max-w-[64rem] text-[18px] leading-tight font-medium text-[#052cff] sm:text-[22px]">
                Tune image transforms, then see when the target label must
                change too.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] border border-[#cfd4ff] bg-white px-5 py-3 text-[15px] font-black text-[#052cff] shadow-[0_10px_24px_rgba(68,88,170,0.06)]"
            >
              <HelpIcon />
              What should stay invariant?
            </button>
          </div>
        </header>

        <div className="grid gap-3 sm:gap-4">
          <FamilyPanel
            activeFamilyId={activeFamilyId}
            onSelectFamily={selectFamily}
          />
          <TransformPanel
            activeTransform={activeTransform}
            activeFamilyId={activeFamilyId}
            alpha={alpha}
            lambda={lambda}
            strength={strength}
            onSelectTransform={selectTransform}
            onChangeAlpha={setAlpha}
            onChangeLambda={setLambda}
            onChangeStrength={setStrength}
          />
          {activeTransform.labelBehavior === "soft" ? (
            <BatchMixPanel activeTransform={activeTransform} lambda={lambda} />
          ) : (
            <SingleImagePanel
              activeTransform={activeTransform}
              strength={strength}
              selectedExample={selectedExample}
              onSelectExample={setSelectedExampleId}
            />
          )}
          <MetricsPanel
            activeTransform={activeTransform}
            lambda={lambda}
            strength={strength}
          />
        </div>
      </div>
    </main>
  );
}
