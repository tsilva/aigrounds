"use client";

import { type CSSProperties, useMemo, useState } from "react";
import {
  adjustProbability,
  analyzeLoss,
  categoricalCrossEntropyLoss,
} from "./cross-entropy-engine";
import {
  crossEntropyLessons,
  type CrossEntropyClass,
  type CrossEntropyMode,
  type IntuitionExample,
} from "./scenario";

const maxTeachingLoss = 5;
const modeOrder: CrossEntropyMode[] = ["binary", "categorical", "multilabel"];

const modeFacts: Record<
  CrossEntropyMode,
  {
    shortLabel: string;
    decisionLabel: string;
    targetShape: string;
    exampleTarget: string;
    canBeTrue: string;
    sumRule: string;
    lossFocus: string;
  }
> = {
  binary: {
    shortLabel: "Yes / no",
    decisionLabel: "Is it one yes/no question?",
    targetShape: "One binary target",
    exampleTarget: "y = 1",
    canBeTrue: "One outcome",
    sumRule: "No + Yes = 1",
    lossFocus: "The outcome that happened",
  },
  categorical: {
    shortLabel: "One class",
    decisionLabel: "Is exactly one class true?",
    targetShape: "One-hot target",
    exampleTarget: "y = [1, 0, 0, 0]",
    canBeTrue: "One class",
    sumRule: "Probabilities sum to 1",
    lossFocus: "The true class probability",
  },
  multilabel: {
    shortLabel: "Many labels",
    decisionLabel: "Can several labels be true?",
    targetShape: "Multi-hot target",
    exampleTarget: "y = [1, 0, 1, 0]",
    canBeTrue: "Many labels",
    sumRule: "Each label is independent",
    lossFocus: "Every yes/no label",
  },
};

function formatProbability(value: number) {
  return value.toFixed(2);
}

function formatLoss(value: number) {
  return value.toFixed(3);
}

function moodColor(mood: IntuitionExample["mood"]) {
  if (mood === "happy") {
    return "#16a34a";
  }

  if (mood === "neutral") {
    return "#f59e0b";
  }

  return "#ff2525";
}

function moodCopy(mood: IntuitionExample["mood"]) {
  if (mood === "happy") {
    return ":)";
  }

  if (mood === "neutral") {
    return ":|";
  }

  return ":(";
}

function BulbIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8">
      <path
        d="M8.2 15.1a6.2 6.2 0 1 1 7.6 0 5.2 5.2 0 0 0-1.8 3.1H10a5.2 5.2 0 0 0-1.8-3.1Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10 21h4M9.5 18.2h5M12 3V1.8M5.6 5.6l-.9-.9M18.4 5.6l.9-.9M4 12H2.8M21.2 12H20"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        d="M9.4 3.5 11 8.2l4.6 1.6L11 11.4l-1.6 4.7-1.6-4.7-4.6-1.6 4.6-1.6 1.6-4.7ZM17.3 13.2l.9 2.6 2.6.9-2.6.9-.9 2.7-.9-2.7-2.6-.9 2.6-.9.9-2.6Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m8 12.4 2.4 2.3L16.4 9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function MoodIcon({ mood }: { mood: IntuitionExample["mood"] }) {
  const color = moodColor(mood);

  return (
    <div
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] text-[20px] font-bold"
      style={{ borderColor: color, color }}
      aria-hidden="true"
    >
      {moodCopy(mood)}
    </div>
  );
}

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
    <h2 className="text-[19px] leading-none font-black tracking-[-0.03em] text-[#352cff] uppercase">
      {children}
    </h2>
  );
}

function FormulaExpression({
  classCount,
  mode,
  size = "large",
}: {
  classCount: number;
  mode: CrossEntropyMode;
  size?: "large" | "small";
}) {
  const sigmaSize = size === "large" ? "text-[36px]" : "text-[24px]";
  const subSize = size === "large" ? "text-[13px]" : "text-[10px]";

  if (mode === "binary") {
    return (
      <>
        L = − [ y log(<span className="text-[#ff1e1e]">p</span>) + (1 − y)
        log(1 − <span className="text-[#ff1e1e]">p</span>) ]
      </>
    );
  }

  if (mode === "multilabel") {
    return (
      <div className="mx-auto flex max-w-full flex-col items-center gap-1">
        <div>
          L = − 1/{classCount}{" "}
          <span className={`inline-block align-middle ${sigmaSize}`}>
            Σ
          </span>
          <sub className={subSize}>l=1</sub>
          <sup className={subSize}>{classCount}</sup>
        </div>
        <div>
          [ y<sub className={subSize}>l</sub> log(
          <span className="text-[#ff1e1e]">
            p<sub className={subSize}>l</sub>
          </span>
          ) + (1 − y<sub className={subSize}>l</sub>) log(1 −{" "}
          <span className="text-[#ff1e1e]">
            p<sub className={subSize}>l</sub>
          </span>
          ) ]
        </div>
      </div>
    );
  }

  return (
    <>
      L = −{" "}
      <span className={`inline-block align-middle ${sigmaSize}`}>
        Σ
      </span>
      <sub className={subSize}>k=1</sub>
      <sup className={subSize}>K</sup>{" "}
      <span className="text-[#2f39ff]">
        y<sub className={subSize}>k</sub>
      </span>{" "}
      log (
      <span className="text-[#ff1e1e]">
        p̂<sub className={subSize}>k</sub>
      </span>
      )
    </>
  );
}

function SimplifiedFormula({
  mode,
}: {
  mode: CrossEntropyMode;
}) {
  if (mode === "multilabel") {
    return (
      <>
        L = mean<sub className="text-[14px]">labels</sub> BCE(y
        <sub className="text-[14px]">l</sub>, p
        <sub className="text-[14px]">l</sub>)
      </>
    );
  }

  return (
    <>
      L = − log (
      <span className="text-[#2f39ff]">
        p̂
        <sub className="text-[14px]">
          {mode === "binary" ? "true outcome" : "true class"}
        </sub>
      </span>
      )
    </>
  );
}

function TargetShapePanel({
  mode,
  onSelectMode,
}: {
  mode: CrossEntropyMode;
  onSelectMode: (mode: CrossEntropyMode) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Choose The Target Shape</LessonTitle>
          <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
            Cross entropy is the same penalty idea with different truth shapes.
            Pick the shape first, then the formula and simulator adapt.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {modeOrder.map((entryMode) => {
              const fact = modeFacts[entryMode];
              const isSelected = entryMode === mode;

              return (
                <button
                  key={entryMode}
                  type="button"
                  onClick={() => onSelectMode(entryMode)}
                  className={`min-w-0 rounded-[10px] border p-4 text-left transition ${
                    isSelected
                      ? "border-[#5636f5] bg-[linear-gradient(180deg,#694bff,#4a27e8)] text-white shadow-[0_14px_24px_rgba(70,39,232,0.2)]"
                      : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de] hover:bg-[#fbfaff]"
                  }`}
                >
                  <span className="block text-[13px] font-black uppercase tracking-[0.02em]">
                    {fact.shortLabel}
                  </span>
                  <span className="mt-2 block text-[16px] leading-[1.25] font-black">
                    {crossEntropyLessons[entryMode].switchLabel}
                  </span>
                  <span
                    className={`mt-2 block text-[13px] leading-[1.35] ${
                      isSelected ? "text-white/85" : "text-[#30446f]"
                    }`}
                  >
                    {fact.decisionLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black tracking-[0.02em] text-[#352cff] uppercase">
            Current Shape
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FactPill label="Target" value={modeFacts[mode].targetShape} />
            <FactPill label="Example" value={modeFacts[mode].exampleTarget} />
            <FactPill label="True at once" value={modeFacts[mode].canBeTrue} />
            <FactPill label="Probability rule" value={modeFacts[mode].sumRule} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function FactPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2">
      <p className="text-[11px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-[13px] font-bold text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function FormulaFamilyPanel({
  classCount,
  lesson,
  mode,
}: {
  classCount: number;
  lesson: (typeof crossEntropyLessons)[CrossEntropyMode];
  mode: CrossEntropyMode;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <LessonTitle>2. Watch The Formula Morph</LessonTitle>
          <p className="mt-4 text-[16px] leading-[1.45] text-[#071024]">
            {lesson.formulaIntro}
          </p>
          <div
            className={`mt-4 min-w-0 overflow-hidden rounded-[8px] border border-[#dbe2f2] bg-[#fbfbff] px-5 py-4 text-center font-serif shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ${
              mode === "multilabel"
                ? "text-[21px] leading-[1.45] sm:text-[24px]"
                : "text-[25px] leading-[1.3] sm:text-[30px]"
            }`}
          >
            <FormulaExpression classCount={classCount} mode={mode} />
          </div>
          <p className="mt-4 text-[16px] leading-[1.35] text-[#071024]">
            {lesson.simplificationIntro}
          </p>
          <div
            className={`mt-3 min-w-0 overflow-hidden rounded-[8px] border border-[#dbe2f2] bg-[#fbfbff] px-5 py-2 text-center font-serif shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ${
              mode === "multilabel"
                ? "text-[22px] leading-[1.3] sm:text-[25px]"
                : "text-[25px] sm:text-[29px]"
            }`}
          >
            <SimplifiedFormula mode={mode} />
          </div>
        </div>

        <div className="min-w-0">
          <LessonTitle>Same Idea, Different Contract</LessonTitle>
          <div className="mt-4 overflow-hidden rounded-[10px] border border-[#dfe4f4]">
            <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr] bg-[#f7f8ff] text-[11px] font-black tracking-[0.03em] text-[#52628a] uppercase">
              <span className="p-3">Mode</span>
              <span className="p-3">Target</span>
              <span className="p-3">Sum rule</span>
              <span className="p-3">Loss focuses on</span>
            </div>
            {modeOrder.map((entryMode) => {
              const fact = modeFacts[entryMode];
              const isSelected = entryMode === mode;

              return (
                <div
                  key={entryMode}
                  className={`grid grid-cols-[1fr_1fr_1fr_1.2fr] border-t border-[#dfe4f4] text-[13px] leading-[1.3] ${
                    isSelected ? "bg-[#f6f4ff]" : "bg-white"
                  }`}
                >
                  <span className="p-3 font-black text-[#071024]">
                    {fact.shortLabel}
                  </span>
                  <span className="p-3 text-[#263a68]">{fact.exampleTarget}</span>
                  <span className="p-3 text-[#263a68]">{fact.sumRule}</span>
                  <span className="p-3 text-[#263a68]">{fact.lossFocus}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 rounded-[8px] border border-[#dedcff] bg-[#f8f7ff] px-5 py-3 text-[15px] leading-[1.35] text-[#2924ff]">
            <BulbIcon />
            <p>{lesson.insight}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function MiniDistribution({
  classes,
  example,
  mode,
}: {
  classes: CrossEntropyClass[];
  example: IntuitionExample;
  mode: CrossEntropyMode;
}) {
  const exampleTrueClassIds = example.trueClassIds ?? [example.trueClassId];
  const loss = categoricalCrossEntropyLoss(
    classes,
    example.probabilities,
    exampleTrueClassIds,
    mode,
  );
  const trueClassSet = new Set(exampleTrueClassIds);
  const tone = moodColor(example.mood);

  return (
    <div className="grid grid-cols-1 items-center gap-4 border-b border-[#dfe5f2] py-[10px] last:border-b-0 md:grid-cols-[278px_minmax(260px,1fr)_120px] xl:grid-cols-[278px_minmax(320px,1fr)_142px] xl:gap-7">
      <div className="flex items-center gap-5">
        <MoodIcon mood={example.mood} />
        <div>
          <p className="max-w-[230px] text-[16px] leading-[1.35] font-bold text-[#070b1a]">
            {example.title}
          </p>
          <p className="mt-2 flex items-center gap-2 text-[15px] text-[#0a1636]">
            {example.subtitle}
            <span style={{ color: tone }}>{moodCopy(example.mood)}</span>
          </p>
        </div>
      </div>

      <div
        className="grid items-end gap-4 xl:gap-7"
        style={{ gridTemplateColumns: `repeat(${classes.length}, minmax(0, 1fr))` }}
      >
        {classes.map((classItem) => {
          const probability = example.probabilities[classItem.id] ?? 0;
          const isTrueClass = trueClassSet.has(classItem.id);

          return (
            <div
              key={classItem.id}
              className="grid h-[82px] grid-rows-[18px_50px_14px] justify-items-center"
            >
              <span className="text-[14px] font-bold text-[#060917]">
                {formatProbability(probability)}
              </span>
              <div className="flex h-[50px] items-end">
                <div
                  className="w-[36px] rounded-t-[4px]"
                  style={{
                    height: `${Math.max(4, probability * 54)}px`,
                    background: isTrueClass
                      ? `linear-gradient(180deg, ${classItem.color}, #13a044)`
                      : "linear-gradient(180deg, #c7cedd, #929cac)",
                  }}
                />
              </div>
              <span className="text-[13px] font-bold text-[#071024]">
                {classItem.label}
              </span>
            </div>
          );
        })}
        <div
          className="-mt-[18px] h-px bg-[#8b99bb]"
          style={{ gridColumn: `span ${classes.length} / span ${classes.length}` }}
        />
      </div>

      <p
        className="justify-self-start text-[18px] font-black md:justify-self-end"
        style={{ color: tone }}
      >
        Loss = {formatLoss(loss)}
      </p>
    </div>
  );
}

function ProbabilitySlider({
  classItem,
  value,
  onChange,
}: {
  classItem: CrossEntropyClass;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-[42px_minmax(0,1fr)_62px] items-center gap-4">
      <div className="flex items-center gap-3">
        <span
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: classItem.color }}
        />
        <label
          htmlFor={`probability-${classItem.id}`}
          className="text-[16px] font-bold text-[#12192e]"
        >
          {classItem.label}
        </label>
      </div>
      <input
        id={`probability-${classItem.id}`}
        type="range"
        min="0.01"
        max="0.97"
        step="0.01"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dce1ec] accent-[#5335f4] [--thumb-color:#5335f4] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--thumb-color)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--thumb-color)]"
        style={
          {
            background: `linear-gradient(90deg, #5335f4 0%, #5335f4 ${value * 100}%, #dce1ec ${value * 100}%, #dce1ec 100%)`,
          } as CSSProperties
        }
      />
      <input
        type="text"
        inputMode="decimal"
        min="0.01"
        max="0.97"
        step="0.01"
        aria-label={`${classItem.label} probability`}
        value={formatProbability(value)}
        onChange={(event) =>
          onChange(Number(event.target.value.replace(",", ".")))
        }
        className="w-[62px] rounded-[8px] border border-[#d7def0] bg-white px-2 py-1.5 text-center font-mono text-[15px] font-semibold text-[#071024] outline-none transition focus:border-[#6b55ff]"
      />
    </div>
  );
}

function MainDistributionChart({
  classes,
  distributionLabel,
  probabilities,
  targetLabel,
  trueClassIds,
}: {
  classes: CrossEntropyClass[];
  distributionLabel: string;
  probabilities: Record<string, number>;
  targetLabel: string;
  trueClassIds: string[];
}) {
  const trueClassSet = new Set(trueClassIds);
  const trueLabel = classes
    .filter((classItem) => trueClassSet.has(classItem.id))
    .map((classItem) => classItem.label)
    .join(", ");

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#121a35]">
          {distributionLabel}
        </h3>
        <div className="flex items-center gap-2 text-[13px] text-[#142247]">
          <span className="h-px w-8 border-t-2 border-dashed border-[#41ce6a]" />
          {targetLabel} ({trueLabel})
        </div>
      </div>
      <div className="grid grid-cols-[34px_minmax(210px,1fr)] gap-2">
        <div className="grid h-[292px] grid-rows-5 items-center text-right text-[14px] text-[#12214a]">
          <span>1.0</span>
          <span>0.8</span>
          <span>0.6</span>
          <span>0.4</span>
          <span>0.2</span>
        </div>
        <div className="relative h-[292px] border-b border-l border-[#98a6c5]">
          <div className="absolute inset-0 grid grid-rows-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="border-t border-[#e3e8f4]" />
            ))}
          </div>
          <div className="absolute -left-[5px] top-0 h-full w-[9px]">
            {Array.from({ length: 11 }).map((_, index) => (
              <span
                key={index}
                className="absolute left-0 h-px w-[9px] bg-[#98a6c5]"
                style={{ top: `${index * 10}%` }}
              />
            ))}
          </div>
          <div
            className="absolute inset-x-3 bottom-0 grid h-full items-end gap-3 sm:inset-x-5 sm:gap-6"
            style={{ gridTemplateColumns: `repeat(${classes.length}, minmax(0, 1fr))` }}
          >
            {classes.map((classItem) => {
              const probability = probabilities[classItem.id] ?? 0;
              const isTrueClass = trueClassSet.has(classItem.id);

              return (
                <div key={classItem.id} className="grid justify-items-center gap-2">
                  <span className="text-[14px] font-bold text-[#071024]">
                    {formatProbability(probability)}
                  </span>
                  <div
                    className="w-[36px] rounded-t-[4px]"
                    style={{
                      height: `${Math.max(5, probability * 250)}px`,
                      background: isTrueClass
                        ? `linear-gradient(180deg, ${classItem.color}, #13a044)`
                        : `linear-gradient(180deg, ${classItem.color}, ${classItem.color})`,
                    }}
                  />
                  <span className="text-[14px] font-bold text-[#071024]">
                    {classItem.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <span />
        <p className="pt-1 text-center text-[14px] font-medium text-[#243558]">
          Classes
        </p>
      </div>
    </div>
  );
}

function FocusChart({
  explanation,
  focusLabel,
  mode,
  trueClass,
  probability,
  loss,
}: {
  explanation: string;
  focusLabel: string;
  mode: CrossEntropyMode;
  trueClass: CrossEntropyClass;
  probability: number;
  loss: number;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[70px_minmax(0,1fr)] gap-4 border-l border-dashed border-[#d6ddec] pl-4 sm:gap-5 sm:pl-5">
      <div>
        <h3 className="mb-4 text-[15px] font-bold text-[#121a35]">
          {focusLabel}
        </h3>
        <div className="grid grid-cols-[30px_50px] gap-2">
          <div className="grid h-[292px] grid-rows-2 justify-items-end text-[14px] text-[#12214a]">
            <span>1.0</span>
            <span className="self-end">0</span>
          </div>
          <div className="relative h-[292px] border-b border-l border-[#98a6c5]">
            <div className="absolute -top-px left-[10px] h-full w-[38px] rounded-t-[6px] border border-dashed border-[#98a6c5]" />
            <div
              className="absolute bottom-0 left-[10px] w-[38px] rounded-t-[4px]"
              style={{
                height: `${Math.max(5, probability * 250)}px`,
                background: `linear-gradient(180deg, ${trueClass.mutedColor}, ${trueClass.color})`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-end pb-7 text-[15px] leading-[1.35] text-[#27385f]">
        <p className="mb-8 font-bold text-[#14a646]">
          {formatProbability(probability)}
        </p>
        <p>{explanation}</p>
        <p className="mt-5 text-[18px] text-[#071024]">
          {mode === "multilabel"
            ? "Loss = mean BCE(all labels)"
            : `Loss = −log(${formatProbability(probability)})`}
        </p>
        <p className="mt-3 text-[18px] font-bold text-[#071024]">
          ={" "}
          <span className="text-[24px] text-[#18a64a]">{formatLoss(loss)}</span>
        </p>
      </div>
    </div>
  );
}

function LossMeter({
  title,
  loss,
  label,
}: {
  title: string;
  loss: number;
  label: string;
}) {
  const meterPosition = Math.min(100, (loss / maxTeachingLoss) * 100);
  const isHighLoss = loss >= 1.2;
  const lossColor = isHighLoss ? "#ff2626" : loss >= 0.6 ? "#c78a00" : "#19a64b";
  const noteClassName = isHighLoss
    ? "mt-3 flex items-center gap-4 rounded-[8px] border border-[#ffc7c7] bg-[#fff1f1] px-4 py-2.5 text-[14px] leading-[1.2] text-[#ba1a1a]"
    : "mt-3 flex items-center gap-4 rounded-[8px] border border-[#c8ead7] bg-[#f1fbf7] px-4 py-2.5 text-[14px] leading-[1.2] text-[#078033]";

  return (
    <div>
      <div className="text-center">
        <h3 className="text-[14px] font-bold text-[#0b1531]">
          {title}
        </h3>
        <p
          className="text-[42px] leading-none font-black tracking-[-0.04em]"
          style={{ color: lossColor }}
        >
          {formatLoss(loss)}
        </p>
      </div>
      <div className="relative mt-3 h-6">
        <div className="absolute top-[9px] h-[6px] w-full rounded-full bg-[linear-gradient(90deg,#08a842_0%,#f8e79b_48%,#ff2626_100%)]" />
        <div
          className="absolute top-[3px] h-[18px] w-[10px] rounded-full border-2 border-[#083b22] bg-[#18b957]"
          style={{ left: `calc(${meterPosition}% - 5px)` }}
        />
      </div>
      <div className="flex justify-between text-[12px] leading-[1.2] font-bold">
        <span className="text-[#0b9b3c]">
          Low Loss
          <br />
          (Good)
        </span>
        <span className="text-right text-[#ff1717]">
          High Loss
          <br />
          (Bad)
        </span>
      </div>
      <div className={noteClassName}>
        <CheckIcon />
        <p>{label}</p>
      </div>
    </div>
  );
}

function FormulaBlock({
  classCount,
  mode,
  note,
  trueClass,
  terms,
  probability,
  loss,
}: {
  classCount: number;
  mode: CrossEntropyMode;
  note: string;
  trueClass: CrossEntropyClass;
  terms: string[];
  probability: number;
  loss: number;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[10px] border border-[#dfe4f4] bg-[#fbfbff] px-5 py-2.5 text-center font-serif text-[15px] leading-[1.55] text-[#070b1a] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-8 sm:text-[16px]">
      <p>
        {mode === "binary" ? (
          <>
            L = − [ y log(p) + (1 − y) log(1 − p) ]
          </>
        ) : mode === "multilabel" ? (
          <span className="block">
            L = − 1/{classCount}{" "}
            <span className="inline-block align-middle text-[22px]">
              Σ
            </span>
            <sub>l=1</sub>
            <sup>{classCount}</sup> BCE(y<sub>l</sub>, p<sub>l</sub>)
          </span>
        ) : (
          <>
            L = −{" "}
            <span className="inline-block align-middle text-[22px]">
              Σ
            </span>
            <sub>k=1</sub>
            <sup>{classCount}</sup> y<sub>k</sub> log (p̂<sub>k</sub>)
          </>
        )}
      </p>
      {mode === "multilabel" ? (
        <div className="mt-1 space-y-0.5 font-sans text-[12px] leading-[1.35] text-[#27385f] sm:text-[13px]">
          <p>= - 1/{classCount} (</p>
          {terms.map((term, index) => (
            <p key={`${term}-${index}`}>{term}</p>
          ))}
          <p>)</p>
        </div>
      ) : (
        <p>= − ( {terms.join(" + ")} )</p>
      )}
      {mode === "multilabel" ? (
        <p>= mean BCE across all labels</p>
      ) : (
        <p>= −log({formatProbability(probability)})</p>
      )}
      <p>
        ={" "}
        <span className="font-sans font-bold text-[#1aa64b]">
          {formatLoss(loss)}
        </span>
      </p>
      <p className="mt-1 font-sans text-[12px] leading-[1.3] text-[#263a68]">
        {note.replace("{label}", trueClass.label)}
      </p>
    </div>
  );
}

export function CategoricalCrossEntropyPlayground() {
  const [mode, setMode] = useState<CrossEntropyMode>("categorical");
  const lesson = crossEntropyLessons[mode];
  const [trueClassIds, setTrueClassIds] = useState(lesson.initialTrueClassIds);
  const [probabilities, setProbabilities] = useState(lesson.initialProbabilities);
  const [showCalculation, setShowCalculation] = useState(true);
  const analysis = useMemo(
    () => analyzeLoss(lesson.classes, probabilities, trueClassIds, mode),
    [lesson.classes, mode, probabilities, trueClassIds],
  );

  function selectMode(nextMode: CrossEntropyMode) {
    const nextLesson = crossEntropyLessons[nextMode];

    setMode(nextMode);
    setTrueClassIds(nextLesson.initialTrueClassIds);
    setProbabilities(nextLesson.initialProbabilities);
  }

  function selectTrueClass(nextClassId: string) {
    if (lesson.targetMode === "multiple") {
      setTrueClassIds((current) => {
        if (current.includes(nextClassId) && current.length > 1) {
          return current.filter((classId) => classId !== nextClassId);
        }

        if (current.includes(nextClassId)) {
          return current;
        }

        return [...current, nextClassId];
      });
      return;
    }

    setTrueClassIds([nextClassId]);
  }

  function updateProbability(classId: string, value: number) {
    setProbabilities((current) =>
      adjustProbability(lesson.classes, current, classId, value, mode),
    );
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfcff] px-3 py-4 text-[#071024] sm:px-5">
      <div className="mx-auto max-w-[1536px]">
        <header className="mb-4 pl-0 sm:pl-6">
          <div className="min-w-0">
            <h1 className="min-w-0 break-words text-[38px] leading-[1] font-black tracking-[-0.055em] text-[#030713] sm:text-[44px]">
              Cross Entropy Loss
            </h1>
            <p className="mt-2 max-w-[58rem] text-[18px] leading-tight font-medium text-[#30446f] sm:text-[22px]">
              One penalty idea for binary, categorical, and multi-label targets.
            </p>
          </div>
        </header>

        <div className="grid gap-4">
          <TargetShapePanel mode={mode} onSelectMode={selectMode} />
          <FormulaFamilyPanel
            classCount={lesson.classes.length}
            lesson={lesson}
            mode={mode}
          />
          <Panel className="px-5 py-6 sm:px-8">
            <LessonTitle>The Intuition</LessonTitle>
            <div className="mt-1">
              {lesson.examples.map((example) => (
                <MiniDistribution
                  key={example.id}
                  classes={lesson.classes}
                  example={example}
                  mode={mode}
                />
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-4 grid gap-5 xl:grid-cols-[410px_minmax(0,1fr)_444px]">
          <Panel className="min-h-[467px] p-6">
            <LessonTitle>3. Set The Scenario</LessonTitle>
            <p className="mt-5 text-[14px] font-medium text-[#16264e]">
              {lesson.scenarioLabel}
            </p>
            <div
              className="mt-4 grid gap-4"
              style={{ gridTemplateColumns: `repeat(${lesson.classes.length}, minmax(0, 1fr))` }}
            >
              {lesson.classes.map((classItem) => {
                const isSelected = trueClassIds.includes(classItem.id);

                return (
                  <button
                    key={classItem.id}
                    type="button"
                    onClick={() => selectTrueClass(classItem.id)}
                    className={`rounded-[7px] border px-5 py-2 text-[16px] font-black transition ${
                      isSelected
                        ? "border-[#5636f5] bg-[linear-gradient(180deg,#694bff,#4a27e8)] text-white shadow-[0_10px_18px_rgba(70,39,232,0.18)]"
                        : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de]"
                    }`}
                  >
                    {classItem.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-[15px] font-medium text-[#16264e]">
              {lesson.probabilityLabel}
            </p>
            <div className="mt-4 space-y-2">
              {lesson.classes.map((classItem) => (
                <ProbabilitySlider
                  key={classItem.id}
                  classItem={classItem}
                  value={probabilities[classItem.id] ?? 0}
                  onChange={(value) => updateProbability(classItem.id, value)}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#dfe4f0] pt-3 text-[15px]">
              <span className="text-[#263a68]">{lesson.totalLabel}</span>
              <div className="flex items-center gap-4">
                {mode === "multilabel" ? (
                  <span className="font-mono text-[13px] font-bold text-[#071024]">
                    {trueClassIds.length}/{lesson.classes.length} true
                  </span>
                ) : (
                  <span className="font-mono text-[16px] font-bold text-[#071024]">
                    {formatProbability(analysis.total)}
                  </span>
                )}
                <span
                  className={
                    analysis.isValidDistribution
                      ? "text-[#16a34a]"
                      : "text-[#ff2525]"
                  }
                >
                  <CheckIcon />
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-4 rounded-[8px] border border-[#dedcff] bg-[#fbfaff] px-4 py-2.5 text-[14px] leading-[1.25] text-[#2924ff]">
              <SparkleIcon />
              <p>
                {lesson.tip.replace("{label}", analysis.trueClass.label)}
              </p>
            </div>
          </Panel>

          <Panel className="min-h-[467px] p-6 sm:p-7">
            <LessonTitle>4. See The Prediction</LessonTitle>
            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(330px,1fr)_minmax(250px,0.88fr)]">
              <MainDistributionChart
                classes={lesson.classes}
                distributionLabel={lesson.distributionLabel}
                probabilities={probabilities}
                targetLabel={lesson.targetLabel}
                trueClassIds={trueClassIds}
              />
              <FocusChart
                explanation={lesson.focusExplanation}
                focusLabel={lesson.focusLabel}
                mode={mode}
                trueClass={analysis.trueClass}
                probability={analysis.trueProbability}
                loss={analysis.loss}
              />
            </div>
          </Panel>

          <Panel className="min-h-[467px] p-6">
            <LessonTitle>5. The Loss</LessonTitle>
            <div className="mt-2">
              <LossMeter
                title={lesson.lossTitle}
                loss={analysis.loss}
                label={analysis.qualityLabel}
              />
            </div>
            <div className="mt-4 rounded-[10px] border border-[#dfe4f4] bg-[#fbfbff]">
              <button
                type="button"
                onClick={() => setShowCalculation((current) => !current)}
                className="flex w-full items-center justify-between px-5 py-2.5 text-[14px] font-black text-[#352cff] uppercase"
              >
                See The Calculation
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={`h-5 w-5 transition ${showCalculation ? "" : "rotate-180"}`}
                >
                  <path
                    d="m6 14 6-6 6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.4"
                  />
                </svg>
              </button>
              {showCalculation ? (
                <FormulaBlock
                  classCount={lesson.classes.length}
                  mode={mode}
                  note={lesson.calculationNote}
                  trueClass={analysis.trueClass}
                  terms={analysis.calculationTerms}
                  probability={analysis.trueProbability}
                  loss={analysis.loss}
                />
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
