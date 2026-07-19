"use client";

import { useMemo, useState } from "react";
import {
  adjustApproximation,
  analyzeKlDivergence,
  distributionTotal,
  formatKl,
  formatProbability,
  formatRatio,
  type KlDirection,
} from "./kl-divergence-engine";
import {
  initialApproximation,
  initialReferenceScenarioId,
  klCategories,
  referenceScenarios,
  type ReferenceScenario,
} from "./scenario";

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[14px] border border-[#d8e0f3] bg-white/92 shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

function LessonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] leading-none font-black text-[#352cff] uppercase">
      {children}
    </h2>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9.6 9.3a2.5 2.5 0 0 1 4.7 1.2c0 1.8-2.3 2-2.3 3.7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M12 17.1h.01"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.6"
      />
    </svg>
  );
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" fill="#16a34a" />
      <path
        d="m8 12.4 2.4 2.3L16.4 9"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
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

function MiniDistribution({ values }: { values: number[] }) {
  return (
    <div className="mt-4 flex h-20 items-end gap-3 border-b border-[#b8c4df] px-2">
      {values.map((value, index) => (
        <div
          key={klCategories[index].id}
          className="flex flex-1 flex-col items-center justify-end gap-1"
        >
          <div
            className="w-full max-w-6 rounded-t-[3px] bg-[linear-gradient(180deg,#77b6ff,#2f7bf5)]"
            style={{ height: `${Math.max(10, value * 76)}px` }}
          />
          <span className="font-mono text-[12px] font-black text-[#071024]">
            {klCategories[index].label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ScenarioSelector({
  activeScenario,
  onSelectScenario,
}: {
  activeScenario: ReferenceScenario;
  onSelectScenario: (scenario: ReferenceScenario) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Pick The Reference Shape</LessonTitle>
          <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
            Choose the distribution P that the approximation Q is trying to
            match. The same Q mistake can matter differently under each
            reference shape.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {referenceScenarios.map((scenario) => {
              const isSelected = scenario.id === activeScenario.id;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => onSelectScenario(scenario)}
                  aria-pressed={isSelected}
                  className={`relative min-w-0 rounded-[10px] border p-4 text-left transition ${
                    isSelected
                      ? "border-[#2f2bff] bg-[#fbfbff] shadow-[0_10px_24px_rgba(47,43,255,0.14)]"
                      : "border-[#d8e0f0] bg-white hover:border-[#b9c4de] hover:bg-[#fbfaff]"
                  }`}
                >
                  {isSelected ? (
                    <span className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full bg-[#2f2bff] text-white">
                      <CheckIcon />
                    </span>
                  ) : null}
                  <span className="block text-[13px] font-black text-[#071024]">
                    {scenario.label}
                  </span>
                  <span className="mt-2 block font-mono text-[12px] font-bold text-[#233b75]">
                    {scenario.description}
                  </span>
                  <MiniDistribution values={scenario.values} />
                  <span className="mt-3 block text-[12px] font-black text-[#30446f] uppercase">
                    {scenario.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black tracking-[0.02em] text-[#352cff] uppercase">
            Current Reference Distribution P
          </p>
          <div className="mt-4 overflow-hidden rounded-[8px] border border-[#d9e2f3] bg-white">
            <table className="w-full table-fixed border-collapse text-center font-mono">
              <caption className="sr-only">
                Current reference distribution P by bucket
              </caption>
              <thead className="text-[12px] font-bold text-[#30446f]">
                <tr className="border-b border-[#d9e2f3]">
                  <th
                    scope="col"
                    className="border-r border-[#d9e2f3] p-2 text-left font-sans text-[11px] font-black uppercase text-[#7180a5]"
                  >
                    Bucket
                  </th>
                  {klCategories.map((category) => (
                    <th
                      key={category.id}
                      scope="col"
                      className="border-r border-[#d9e2f3] p-2 last:border-r-0"
                    >
                      {category.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[13px] font-bold text-[#071024]">
                <tr>
                  <th
                    scope="row"
                    className="border-r border-[#d9e2f3] p-2 font-serif"
                  >
                    P<sub>i</sub>
                  </th>
                  {activeScenario.values.map((value, index) => (
                    <td
                      key={klCategories[index].id}
                      className="border-r border-[#d9e2f3] p-2 last:border-r-0"
                    >
                      {formatProbability(value)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-[8px] border border-[#e3e8f6] bg-white px-3 py-2 text-[13px] leading-[1.4] text-[#30446f]">
            Tutor path uses Peaked and Rare event. Balanced is optional for
            checking the symmetric-looking case.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function FormulaPanel({
  reference,
  approximation,
  direction,
}: {
  reference: number[];
  approximation: number[];
  direction: KlDirection;
}) {
  const analysis = useMemo(
    () => analyzeKlDivergence(klCategories, reference, approximation, direction),
    [approximation, direction, reference],
  );

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>2. Watch The Formula Split Into Buckets</LessonTitle>
      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <p className="text-[16px] leading-[1.45] text-[#071024]">
            KL adds one weighted log-ratio per bucket. The selected direction
            decides which distribution supplies the weights.
          </p>
          <div className="mt-4 rounded-[8px] border border-[#dbe2f2] bg-[#fbfbff] px-3 py-5 text-center font-serif text-[22px] leading-[1.35] text-[#071024] sm:text-[32px]">
            D<sub className="text-[12px] sm:text-[15px]">KL</sub>(
            {analysis.sourceLabel} || {analysis.targetLabel}) = Σ
            <sub className="text-[12px] sm:text-[15px]">i</sub>{" "}
            {analysis.sourceLabel}
            <sub className="text-[12px] sm:text-[15px]">i</sub> log(
            {analysis.sourceLabel}
            <sub className="text-[12px] sm:text-[15px]">i</sub> /{" "}
            {analysis.targetLabel}
            <sub className="text-[12px] sm:text-[15px]">i</sub>)
          </div>
          <p className="mt-3 text-[13px] font-bold text-[#53658f]">
            Natural log, measured in nats. KL is directional, not a symmetric
            distance.
          </p>
        </div>
        <div className="min-w-0 overflow-hidden rounded-[10px] border border-[#dbe2f2] bg-white">
          <table className="w-full table-fixed border-collapse font-mono text-[12px] font-bold text-[#071024] sm:text-[13px]">
            <caption className="sr-only">
              Per-bucket contributions for D KL of {analysis.sourceLabel} relative
              to {analysis.targetLabel}
            </caption>
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[19%]" />
              <col className="w-[31%]" />
            </colgroup>
            <thead className="bg-[#fbfbff] text-[11px] font-black tracking-[0.02em] text-[#53658f] uppercase">
              <tr className="border-b border-[#dbe2f2]">
                <th scope="col" className="p-2.5 text-left">
                  Bucket
                </th>
                <th scope="col" className="p-2.5 text-left">
                  {analysis.sourceLabel}<sub>i</sub>
                </th>
                <th scope="col" className="p-2.5 text-left">
                  {analysis.targetLabel}<sub>i</sub>
                </th>
                <th scope="col" className="p-2.5 text-left">
                  Ratio
                </th>
                <th scope="col" className="p-2.5 text-left">
                  Contribution
                </th>
              </tr>
            </thead>
            <tbody>
              {analysis.contributions.map((row) => {
                const isLargestSource =
                  row.sourceValue ===
                  Math.max(
                    ...analysis.contributions.map(
                      (contribution) => contribution.sourceValue,
                    ),
                  );

                return (
                  <tr
                    key={row.category.id}
                    className={`border-b border-[#e5ebf6] ${
                      isLargestSource ? "bg-[#fff8df]" : "bg-white"
                    }`}
                  >
                    <th scope="row" className="p-2.5 text-left">
                      {row.category.label}
                    </th>
                    <td className="p-2.5">
                      {formatProbability(row.sourceValue)}
                    </td>
                    <td className="p-2.5">
                      {formatProbability(row.targetValue)}
                    </td>
                    <td className="p-2.5">{formatRatio(row.ratio)}</td>
                    <td
                      className={`p-2.5 ${
                        row.contribution >= 0
                          ? "text-[#ff2525]"
                          : "text-[#09984c]"
                      }`}
                    >
                      {row.contribution >= 0 ? "+" : ""}
                      {formatKl(row.contribution)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#fbfbff] font-black">
              <tr>
                <th scope="row" colSpan={4} className="p-2.5 text-center">
                  Sum
                </th>
                <td className="p-2.5 text-[#ff2525]">
                  {formatKl(analysis.score)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Panel>
  );
}

function MismatchPanel({
  reference,
  approximation,
  direction,
}: {
  reference: number[];
  approximation: number[];
  direction: KlDirection;
}) {
  const analysis = useMemo(
    () => analyzeKlDivergence(klCategories, reference, approximation, direction),
    [approximation, direction, reference],
  );
  const largestPositive = Math.max(
    ...analysis.contributions.map((row) => row.contribution),
  );
  const distributionChartLabel = `Bar chart comparing reference P and approximation Q. ${klCategories
    .map(
      (category, index) =>
        `${category.label}: P ${formatProbability(reference[index])}, Q ${formatProbability(approximation[index])}`,
    )
    .join("; ")}.`;
  const contributionChartLabel = `Per-bucket contributions in nats for D KL of ${analysis.sourceLabel} relative to ${analysis.targetLabel}. ${analysis.contributions
    .map(
      (row) =>
        `${row.category.label}: ${row.contribution >= 0 ? "plus " : "minus "}${formatKl(Math.abs(row.contribution))}`,
    )
    .join("; ")}.`;

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>3. See The Weighted Mismatch</LessonTitle>
      <div className="mt-4 grid gap-7 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,0.85fr)_minmax(260px,0.55fr)]">
        <div
          className="min-w-0"
          role="img"
          aria-label={distributionChartLabel}
        >
          <p className="text-[14px] font-bold text-[#16264e]">
            Reference P (blue) vs Approximation Q (red)
          </p>
          <div className="mt-2 flex gap-4 text-[13px] font-bold text-[#30446f]">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px] bg-[#2f7bf5]" />P
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px] bg-[#ff332b]" />Q
            </span>
          </div>
          <div className="mt-5 h-48 border-l border-b border-[#b8c4df] px-3">
            <div className="flex h-full items-end justify-around gap-4">
              {klCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex h-full flex-1 items-end justify-center gap-2"
                >
                  <div className="flex h-full w-10 flex-col justify-end gap-1">
                    <span className="text-center font-mono text-[12px] font-black">
                      {formatProbability(reference[index])}
                    </span>
                    <div
                      className="rounded-t-[4px] bg-[linear-gradient(180deg,#4d91ff,#1b55eb)]"
                      style={{ height: `${Math.max(6, reference[index] * 170)}px` }}
                    />
                    <span className="text-center font-mono text-[12px] font-black">
                      {category.label}
                    </span>
                  </div>
                  <div className="flex h-full w-10 flex-col justify-end gap-1">
                    <span className="text-center font-mono text-[12px] font-black">
                      {formatProbability(approximation[index])}
                    </span>
                    <div
                      className="rounded-t-[4px] bg-[linear-gradient(180deg,#ff6b51,#ff2525)]"
                      style={{
                        height: `${Math.max(6, approximation[index] * 170)}px`,
                      }}
                    />
                    <span className="text-center font-mono text-[12px] font-black text-transparent">
                      {category.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="min-w-0"
          role="img"
          aria-label={contributionChartLabel}
        >
          <p className="font-serif text-[16px] font-bold text-[#071024]">
            Per-bucket contribution {analysis.sourceLabel}
            <sub>i</sub> log({analysis.sourceLabel}
            <sub>i</sub> / {analysis.targetLabel}
            <sub>i</sub>)
          </p>
          <p className="text-[13px] font-bold text-[#53658f]">(nats)</p>
          <div className="mt-4 h-48 border-l border-[#b8c4df]">
            <div className="relative flex h-full items-center border-b border-[#b8c4df]">
              {analysis.contributions.map((row) => {
                const magnitude = Math.min(
                  86,
                  (Math.abs(row.contribution) / Math.max(largestPositive, 0.08)) *
                    82,
                );

                return (
                  <div
                    key={row.category.id}
                    className="flex h-full flex-1 flex-col items-center justify-center"
                  >
                    <span className="mb-1 font-mono text-[12px] font-black text-[#071024]">
                      {row.contribution >= 0 ? "+" : ""}
                      {formatKl(row.contribution)}
                    </span>
                    <div className="relative h-[88px] w-10">
                      <div className="absolute top-1/2 left-0 h-px w-full bg-[#b8c4df]" />
                      <div
                        className={`absolute left-1/2 w-8 -translate-x-1/2 rounded-[3px] ${
                          row.contribution >= 0
                            ? "bottom-1/2 bg-[linear-gradient(180deg,#ff9a1f,#ff5a00)]"
                            : "top-1/2 bg-[#16a34a]"
                        }`}
                        style={{ height: `${Math.max(4, magnitude)}px` }}
                      />
                    </div>
                    <span className="mt-1 font-mono text-[12px] font-black">
                      {row.category.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#d8e0f3] bg-[#fbfbff] p-4">
          <div className="flex items-start gap-3 text-[#2f2bff]">
            <BulbIcon />
            <div>
              <p className="text-[14px] font-black tracking-[0.02em] uppercase">
                Key Takeaway
              </p>
              <p className="mt-3 text-[18px] leading-[1.35] font-black text-[#071024]">
                {direction === "p-to-q"
                  ? "Missing mass where P is high drives the score."
                  : "After the flip, Q chooses which buckets get weighted."}
              </p>
              <p className="mt-3 text-[15px] leading-[1.45] font-bold text-[#30446f]">
                Offsets can be negative; the full KL total stays nonnegative.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 rounded-[8px] border border-[#d8e0f3] bg-[#fbfbff] px-4 py-3 text-[14px] font-bold text-[#2f2bff] sm:flex-row sm:items-center sm:justify-center sm:gap-8">
        <span>Missing important source mass creates positive contribution.</span>
        <span>Over-allocation can offset a bucket, but not the final KL.</span>
      </div>
    </Panel>
  );
}

function ApproximationControls({
  reference,
  approximation,
  onApproximationChange,
}: {
  reference: number[];
  approximation: number[];
  onApproximationChange: (values: number[]) => void;
}) {
  const total = distributionTotal(approximation);
  const quickChecks = [
    {
      label: "Miss A",
      values: [0.25, 0.35, 0.25, 0.15],
    },
    {
      label: "Mockup Q",
      values: initialApproximation,
    },
    {
      label: "Match P",
      values: reference,
    },
  ];
  const updateApproximation = (index: number, value: number) => {
    onApproximationChange(
      adjustApproximation(approximation, index, value),
    );
  };

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>4. Set The Approximation Q</LessonTitle>
      <p
        id="kl-approximation-help"
        className="mt-4 text-[14px] font-bold text-[#30446f]"
      >
        Adjust Q with the sliders. Values rebalance to sum to 1.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {quickChecks.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onApproximationChange(preset.values)}
            className="rounded-[8px] border border-[#d8e0f3] bg-white px-3 py-2 text-[12px] font-black text-[#30446f] transition hover:border-[#b9c4de] hover:bg-[#fbfbff]"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-4">
        {klCategories.map((category, index) => (
          <div
            key={category.id}
            className="grid grid-cols-[44px_minmax(0,1fr)_58px] items-center gap-3"
          >
            <label
              htmlFor={`kl-q-${category.id}`}
              className="font-serif text-[17px] font-black text-[#071024]"
            >
              Q<sub>{category.label}</sub>
            </label>
            <input
              id={`kl-q-${category.id}`}
              type="range"
              min="0.01"
              max="0.97"
              step="0.01"
              value={approximation[index]}
              onInput={(event) =>
                updateApproximation(index, Number(event.currentTarget.value))
              }
              className="h-2 accent-[#ff2525]"
              aria-label={`Q ${category.label} slider`}
              aria-describedby="kl-approximation-help"
            />
            <input
              type="number"
              min="0.01"
              max="0.97"
              step="0.01"
              inputMode="decimal"
              value={formatProbability(approximation[index])}
              onChange={(event) =>
                updateApproximation(index, Number(event.currentTarget.value))
              }
              className="min-w-0 rounded-[7px] border border-[#d8e0f3] bg-white px-2 py-1 text-center font-mono text-[14px] font-black text-[#071024]"
              aria-label={`Q ${category.label} exact value`}
              aria-describedby="kl-approximation-help"
            />
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#dfe6f4] pt-4">
        <span className="text-[16px] font-bold text-[#30446f]">Total</span>
        <span className="flex items-center gap-2 font-mono text-[20px] font-black text-[#071024]">
          {formatProbability(total)}
          <CheckIcon />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-[8px] border border-[#d8e0f3] bg-[#fbfbff] px-4 py-3 text-[13px] font-bold text-[#2f2bff]">
        <SparkleIcon />
        <span>Try moving mass onto A to make P || Q drop.</span>
      </div>
    </Panel>
  );
}

function DirectionPanel({
  reference,
  approximation,
  direction,
  onDirectionChange,
}: {
  reference: number[];
  approximation: number[];
  direction: KlDirection;
  onDirectionChange: (direction: KlDirection) => void;
}) {
  const forward = analyzeKlDivergence(
    klCategories,
    reference,
    approximation,
    "p-to-q",
  );
  const reverse = analyzeKlDivergence(
    klCategories,
    reference,
    approximation,
    "q-to-p",
  );
  const options: { value: KlDirection; label: string }[] = [
    {
      value: "p-to-q",
      label: "DKL(P || Q)",
    },
    {
      value: "q-to-p",
      label: "DKL(Q || P)",
    },
  ];

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>5. Flip The Direction</LessonTitle>
      <p className="mt-4 text-[14px] font-bold text-[#30446f]">
        Direction changes the weighting.
      </p>
      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-[8px] border border-[#d8e0f3] bg-white">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onDirectionChange(option.value)}
            aria-pressed={direction === option.value}
            className={`px-3 py-3 font-serif text-[18px] font-black transition ${
              direction === option.value
                ? "bg-[linear-gradient(180deg,#694bff,#4a27e8)] text-white"
                : "text-[#30446f] hover:bg-[#fbfbff]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div
          className={`rounded-[10px] border p-4 text-center ${
            direction === "p-to-q"
              ? "border-[#b9b7ff] bg-[#fbfbff]"
              : "border-[#d8e0f3] bg-white"
          }`}
        >
          <p className="font-serif text-[16px] font-black text-[#071024]">
            DKL(P || Q)
          </p>
          <p className="mt-2 font-mono text-[36px] leading-none font-black text-[#2f2bff]">
            {formatKl(forward.score)}
          </p>
          <p className="mt-1 text-[14px] font-black text-[#2f2bff]">nats</p>
        </div>
        <div
          className={`rounded-[10px] border p-4 text-center ${
            direction === "q-to-p"
              ? "border-[#b9b7ff] bg-[#fbfbff]"
              : "border-[#d8e0f3] bg-white"
          }`}
        >
          <p className="font-serif text-[16px] font-black text-[#071024]">
            DKL(Q || P)
          </p>
          <p className="mt-2 font-mono text-[36px] leading-none font-black text-[#30446f]">
            {formatKl(reverse.score)}
          </p>
          <p className="mt-1 text-[14px] font-black text-[#30446f]">nats</p>
        </div>
      </div>
      <p className="mt-4 rounded-[8px] border border-[#d8e0f3] bg-[#fbfbff] px-4 py-3 text-[13px] font-bold text-[#2f2bff]">
        Same bars, different weighting.
      </p>
    </Panel>
  );
}

function ScorePanel({
  reference,
  approximation,
  direction,
}: {
  reference: number[];
  approximation: number[];
  direction: KlDirection;
}) {
  const analysis = analyzeKlDivergence(
    klCategories,
    reference,
    approximation,
    direction,
  );

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>6. Read The Mismatch</LessonTitle>
      <div
        className="mt-4 rounded-[10px] border border-[#d8e0f3] bg-white p-4 text-center"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-[13px] font-black text-[#30446f]">
          D<sub>KL</sub>({analysis.sourceLabel} || {analysis.targetLabel}) in nats
        </p>
        <p className="mt-1 font-mono text-[48px] leading-none font-black text-[#ff2525]">
          {formatKl(analysis.score)}
        </p>
        <p className="mt-3 text-[13px] font-bold text-[#30446f]">
          {analysis.sourceLabel} supplies the weights in this direction.
        </p>
      </div>
      <div className="mt-4 rounded-[8px] border border-[#c7d2fe] bg-[#eef2ff] px-3 py-2 text-[13px] font-bold text-[#30446f]">
        <strong className="text-[#071024]">Read the exact value:</strong> 0 means
        the distributions match. Larger values mean more mismatch in this
        direction; KL has no fixed maximum.
      </div>
      <div className="mt-4 rounded-[10px] border border-[#d8e0f3] bg-[#fbfbff] p-4">
        <p className="text-[13px] font-black text-[#352cff] uppercase">
          See The Calculation
        </p>
        <div className="mt-3 rounded-[8px] border border-[#dbe2f2] bg-white p-3 text-center font-mono text-[12px] font-bold leading-[1.75] text-[#071024] sm:text-[14px]">
          <span>{analysis.formulaTerms[0]}</span>
          <span> + {analysis.formulaTerms[1]}</span>
          <br />
          <span>{analysis.formulaTerms[2]}</span>
          <span> + {analysis.formulaTerms[3]}</span>
          <br />
          <span className="text-[18px] text-[#ff2525]">
            = {formatKl(analysis.score)} nats
          </span>
        </div>
        <p className="mt-3 text-[11px] font-bold text-[#53658f]">
          If a source bucket is zero, its term is defined as 0.
        </p>
      </div>
    </Panel>
  );
}

export function KlDivergencePlayground() {
  const [activeScenarioId, setActiveScenarioId] = useState(
    initialReferenceScenarioId,
  );
  const [approximation, setApproximation] = useState(initialApproximation);
  const [direction, setDirection] = useState<KlDirection>("p-to-q");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const activeScenario =
    referenceScenarios.find((scenario) => scenario.id === activeScenarioId) ??
    referenceScenarios[0];
  const reference = activeScenario.values;

  return (
    <main className="min-h-screen bg-[#f8faff] px-4 py-6 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1536px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[42px] leading-none font-black tracking-[-0.04em] text-[#050816] sm:text-[56px]">
              KL Divergence Intuition Lab
            </h1>
            <p className="mt-3 text-[20px] leading-[1.25] font-bold text-[#263c73] sm:text-[23px]">
              Compare a reference distribution with an approximation and see
              why direction matters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsHelpOpen((isOpen) => !isOpen)}
            aria-expanded={isHelpOpen}
            aria-controls="kl-divergence-help"
            className="inline-flex items-center justify-center gap-3 rounded-[8px] border border-[#cfd6ff] bg-white/85 px-5 py-3 text-[15px] font-black text-[#2f2bff] shadow-[0_12px_28px_rgba(47,43,255,0.08)] transition hover:border-[#aeb8ff] hover:bg-white"
          >
            <HelpIcon />
            What is KL Divergence?
          </button>
        </header>

        {isHelpOpen ? (
          <aside
            id="kl-divergence-help"
            className="mt-5 rounded-[12px] border border-[#c7d2fe] bg-[#eef2ff] p-5 text-[#16264e]"
            aria-labelledby="kl-divergence-help-title"
          >
            <h2
              id="kl-divergence-help-title"
              className="text-[18px] font-black text-[#352cff]"
            >
              KL divergence in one minute
            </h2>
            <p className="mt-2 max-w-[980px] text-[15px] leading-[1.5] font-bold">
              KL divergence adds source-weighted log-ratios to compare two
              probability distributions. In D<sub>KL</sub>(P || Q), P supplies
              the weights and Q is the approximation.
            </p>
            <ul className="mt-3 grid gap-2 text-[14px] font-bold md:grid-cols-3">
              <li>0 means P and Q match.</li>
              <li>The total is nonnegative, even if one bucket is negative.</li>
              <li>KL has no fixed maximum and is not a symmetric distance.</li>
            </ul>
          </aside>
        ) : null}

        <div className="mt-6 space-y-4">
          <ScenarioSelector
            activeScenario={activeScenario}
            onSelectScenario={(scenario) => setActiveScenarioId(scenario.id)}
          />
          <FormulaPanel
            reference={reference}
            approximation={approximation}
            direction={direction}
          />
          <MismatchPanel
            reference={reference}
            approximation={approximation}
            direction={direction}
          />
          <div className="grid gap-4 xl:grid-cols-[0.9fr_0.85fr_1fr]">
            <ApproximationControls
              reference={reference}
              approximation={approximation}
              onApproximationChange={setApproximation}
            />
            <DirectionPanel
              reference={reference}
              approximation={approximation}
              direction={direction}
              onDirectionChange={setDirection}
            />
            <ScorePanel
              reference={reference}
              approximation={approximation}
              direction={direction}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
