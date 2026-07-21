"use client";

import { useMemo, useState } from "react";
import {
  analyzeBpe,
  formatMerge,
  formatPair,
  formatReduction,
  formatTokens,
  type BpeAnalysis,
  type MergeStep,
  type PairCount,
} from "./byte-pair-encoding-engine";
import {
  bpeScenarios,
  initialMergeSteps,
  maxMergeSteps,
  type BpeScenario,
  type BpeScenarioId,
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
      className={`min-w-0 rounded-[14px] border border-[#d8e0f3] bg-white/92 shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
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

function FactPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[8px] border border-[#dfe4f4] bg-white px-3 py-2">
      <p className="text-[11px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-[13px] font-bold text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function ScenarioPanel({
  scenario,
  analysis,
  onScenarioChange,
}: {
  scenario: BpeScenario;
  analysis: BpeAnalysis;
  onScenarioChange: (scenarioId: BpeScenarioId) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Choose The Training Text</LessonTitle>
          <p className="mt-4 text-[16px] leading-[1.45] text-[#16264e]">
            BPE starts with tiny symbols, then learns which adjacent pieces keep
            appearing together.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {bpeScenarios.map((item) => {
              const isSelected = item.id === scenario.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onScenarioChange(item.id)}
                  className={`min-w-0 rounded-[10px] border p-4 text-left transition ${
                    isSelected
                      ? "border-[#5636f5] bg-[linear-gradient(180deg,#684cff,#4826df)] text-white shadow-[0_14px_24px_rgba(70,39,232,0.2)]"
                      : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de] hover:bg-[#fbfaff]"
                  }`}
                >
                  <span className="block text-[12px] font-black uppercase tracking-[0.04em]">
                    {item.shortLabel}
                  </span>
                  <span className="mt-2 block text-[18px] leading-[1.2] font-black">
                    {item.label}
                  </span>
                  <span
                    className={`mt-2 block text-[13px] leading-[1.35] ${
                      isSelected ? "text-white/85" : "text-[#30446f]"
                    }`}
                  >
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black tracking-[0.02em] text-[#352cff] uppercase">
            Corpus ({scenario.trainingText.split(/\s+/).length} training words)
          </p>
          <pre className="mt-3 min-h-[76px] overflow-x-auto rounded-[9px] border border-[#dbe2f2] bg-white px-4 py-3 font-mono text-[15px] leading-7 font-black text-[#071024]">
            {scenario.trainingText}
          </pre>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FactPill label="Starting symbols" value="characters + </w>" />
            <FactPill
              label="Training words"
              value={String(scenario.trainingText.split(/\s+/).length)}
            />
            <FactPill label="Goal" value="learn reusable merges" />
            <FactPill
              label="Current budget"
              value={`${analysis.activeMerges.length} merges`}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function MergeBudgetPanel({
  analysis,
  mergeCount,
  onMergeCountChange,
}: {
  analysis: BpeAnalysis;
  mergeCount: number;
  onMergeCountChange: (mergeCount: number) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="min-w-0">
          <LessonTitle>2. Spend Merge Budget</LessonTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="min-w-0">
              <span className="text-[13px] font-bold text-[#1a2b55]">
                Merge steps
              </span>
              <div className="mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <span className="font-mono text-[14px] font-black text-[#071024]">
                  0
                </span>
                <input
                  type="range"
                  min="0"
                  max={maxMergeSteps}
                  step="1"
                  value={mergeCount}
                  onChange={(event) =>
                    onMergeCountChange(Number(event.target.value))
                  }
                  className="accent-[#5636f5]"
                />
                <span className="font-mono text-[14px] font-black text-[#071024]">
                  {maxMergeSteps}
                </span>
              </div>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onMergeCountChange(Math.max(0, mergeCount - 1))}
                className="grid h-11 w-14 place-items-center rounded-[9px] border border-[#d8e0f3] bg-white text-[20px] font-black text-[#071024] transition hover:border-[#9ba9cb]"
                aria-label="Step back one merge"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() =>
                  onMergeCountChange(Math.min(maxMergeSteps, mergeCount + 1))
                }
                className="grid h-11 w-14 place-items-center rounded-[9px] border border-[#d8e0f3] bg-white text-[20px] font-black text-[#071024] transition hover:border-[#9ba9cb]"
                aria-label="Step forward one merge"
              >
                &rarr;
              </button>
            </div>
          </div>

          <p className="mt-5 text-[13px] font-black tracking-[0.02em] text-[#50608a] uppercase">
            Merge timeline
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {analysis.mergeSteps.slice(0, maxMergeSteps).map((step) => (
              <MergeCard
                key={step.index}
                step={step}
                isActive={step.index <= mergeCount}
              />
            ))}
          </div>
          <div className="mt-4 rounded-[9px] border border-[#dbe7ff] bg-[#f5f9ff] px-4 py-3 text-[14px] font-bold text-[#1f3769]">
            BPE only merges adjacent pairs already seen in the corpus.
          </div>
        </div>

        <CandidateTable candidates={analysis.nextCandidates} />
      </div>
    </Panel>
  );
}

function MergeCard({
  step,
  isActive,
}: {
  step: MergeStep;
  isActive: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-[10px] border px-3 py-3 ${
        isActive
          ? "border-[#22a35a] bg-[#fbfffc] text-[#071024]"
          : "border-[#dfe4f2] bg-[#f8f9fd] text-[#647192]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-black ${
            isActive ? "bg-[#139c52] text-white" : "bg-[#aab4c7] text-white"
          }`}
        >
          {step.index}
        </span>
        <span className="min-w-0 truncate font-mono text-[13px] font-black">
          {formatMerge(step)}
        </span>
      </div>
      <p className="mt-2 text-[12px] font-bold text-[#53658f]">
        Seen {step.count}x before merge
      </p>
    </div>
  );
}

function CandidateTable({ candidates }: { candidates: PairCount[] }) {
  return (
    <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <h3 className="text-[17px] font-black text-[#071024]">
        Next pair candidates
      </h3>
      <div className="mt-3 overflow-hidden rounded-[10px] border border-[#dbe2f2] bg-white">
        <div className="grid grid-cols-[minmax(0,1fr)_46px_96px] bg-[#f5f7ff] px-3 py-2 text-[11px] font-black tracking-[0.04em] text-[#607198] uppercase sm:grid-cols-[1fr_80px_110px]">
          <span>Pair</span>
          <span>Freq</span>
          <span>Strength</span>
        </div>
        {candidates.map((candidate) => (
          <div
            key={formatPair(candidate.pair)}
            className={`grid grid-cols-[minmax(0,1fr)_46px_96px] items-center gap-2 border-t border-[#e2e8f6] px-3 py-3 sm:grid-cols-[1fr_80px_110px] ${
              candidate.isTop ? "bg-[#f4f1ff]" : "bg-white"
            }`}
          >
            <span className="min-w-0 break-words font-mono text-[13px] font-black text-[#071024]">
              {formatPair(candidate.pair)}
            </span>
            <span className="font-mono text-[13px] font-black text-[#071024]">
              {candidate.count}
            </span>
            <StrengthBars count={candidate.count} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] font-bold text-[#53658f]">
        Highlighted rows are tied for the highest next frequency.
      </p>
    </div>
  );
}

function StrengthBars({ count }: { count: number }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className={`h-1.5 w-5 rounded-full ${
            bar <= count ? "bg-[#5636f5]" : "bg-[#cfd6e6]"
          }`}
        />
      ))}
    </div>
  );
}

function TokenReplacementPanel({ analysis }: { analysis: BpeAnalysis }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <LessonTitle>3. Watch Tokens Replace Text</LessonTitle>
          <TokenRow
            label="0 merges"
            tokens={analysis.beforeInspection.tokens}
            learnedTokens={[]}
          />
          <div className="my-3 text-center text-[24px] font-black text-[#31456f]">
            &darr;
          </div>
          <TokenRow
            label={`${analysis.activeMerges.length} merges`}
            tokens={analysis.afterInspection.tokens}
            learnedTokens={analysis.activeMerges.map((merge) => merge.token)}
          />
          <div className="mt-5 rounded-[9px] border border-[#dbe2f2] bg-[#fbfbff] px-4 py-3 text-center font-mono text-[15px] font-black text-[#071024]">
            merge(a, b) creates token{" "}
            <span className="text-[#352cff]">ab</span>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <MetricBlock
            label="Token count"
            value={`${analysis.beforeInspection.count} -> ${analysis.afterInspection.count}`}
            accent="green"
          />
          <MetricBlock
            label="Vocabulary size"
            value={`${analysis.initialVocabularySize} -> ${analysis.vocabularySize}`}
            accent="blue"
          />
          <MetricBlock
            label="Compression"
            value={`${formatReduction(analysis.tokenReduction)} fewer tokens`}
            accent="green"
          />
        </div>
      </div>
    </Panel>
  );
}

function TokenRow({
  label,
  tokens,
  learnedTokens,
}: {
  label: string;
  tokens: string[];
  learnedTokens: string[];
}) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-[86px_1fr] sm:items-center">
      <span className="text-[13px] font-black text-[#31456f]">{label}</span>
      <div className="flex min-w-0 flex-wrap gap-2">
        {tokens.map((token, index) => {
          const isLearned = learnedTokens.includes(token) && token !== "</w>";

          return (
            <span
              key={`${token}-${index}`}
              className={`rounded-[6px] border px-2.5 py-2 font-mono text-[13px] font-black ${
                isLearned
                  ? "border-[#11a05a] bg-[#ecfdf3] text-[#064d2b]"
                  : "border-[#d3dbeb] bg-white text-[#071024]"
              }`}
            >
              {token}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function MetricBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "blue" | "green";
}) {
  const accentClass = accent === "green" ? "text-[#0aa052]" : "text-[#352cff]";

  return (
    <div className="rounded-[10px] border border-[#dfe4f4] bg-white px-4 py-3">
      <p className="text-[12px] font-black tracking-[0.04em] text-[#7180a5] uppercase">
        {label}
      </p>
      <p className={`mt-1 font-mono text-[20px] font-black ${accentClass}`}>
        {value}
      </p>
    </div>
  );
}

function ComparePanel({ analysis }: { analysis: BpeAnalysis }) {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>4. Compare Texts</LessonTitle>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#dce4f6] text-[11px] font-black tracking-[0.04em] text-[#607198] uppercase">
              <th className="py-3 pr-4">Text</th>
              <th className="px-4 py-3">Tokenized after merges</th>
              <th className="px-4 py-3">Token count</th>
              <th className="py-3 pl-4">Reduction</th>
            </tr>
          </thead>
          <tbody>
            {analysis.compareAnalyses.map((entry) => (
              <tr
                key={entry.example.text}
                className="border-b border-[#edf1fa] last:border-b-0"
              >
                <td className="py-3 pr-4 align-top font-mono text-[13px] font-black text-[#071024]">
                  {entry.example.text}
                  <p className="mt-1 max-w-[210px] font-sans text-[12px] leading-5 font-semibold text-[#607198]">
                    {entry.example.note}
                  </p>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex max-w-[420px] flex-wrap gap-1.5">
                    {entry.after.tokens.map((token, index) => (
                      <span
                        key={`${entry.example.text}-${token}-${index}`}
                        className="rounded-[5px] border border-[#d5ddec] bg-white px-2 py-1.5 font-mono text-[12px] font-black text-[#071024]"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 align-top font-mono text-[13px] font-black text-[#071024]">
                  {entry.before.count} {"->"} {entry.after.count}
                </td>
                <td className="py-3 pl-4 align-top">
                  <div className="grid grid-cols-[44px_1fr] items-center gap-3">
                    <span className="font-mono text-[13px] font-black text-[#0aa052]">
                      {formatReduction(entry.reduction)}
                    </span>
                    <div className="h-2 overflow-hidden rounded-full bg-[#d7deeb]">
                      <div
                        className="h-full rounded-full bg-[#0aa052]"
                        style={{
                          width: `${Math.max(entry.reduction * 100, 3)}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 rounded-[9px] border border-[#c9ecd8] bg-[#effbf4] px-4 py-3 text-[15px] font-bold text-[#0a6336]">
        Frequent patterns become cheap; rare strings still split.
      </div>
    </Panel>
  );
}

function TradeoffPanel({ analysis }: { analysis: BpeAnalysis }) {
  const tokenValues = analysis.tradeoff.map((point) => point.tokenCount);
  const vocabValues = analysis.tradeoff.map((point) => point.vocabularySize);
  const minToken = Math.min(...tokenValues);
  const maxToken = Math.max(...tokenValues);
  const minVocab = Math.min(...vocabValues);
  const maxVocab = Math.max(...vocabValues);

  function x(index: number) {
    return 58 + index * 135;
  }

  function yToken(value: number) {
    return scale(value, minToken, maxToken, 188, 38);
  }

  function yVocab(value: number) {
    return scale(value, minVocab, maxVocab, 188, 38);
  }

  const tokenPath = analysis.tradeoff
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${yToken(point.tokenCount)}`)
    .join(" ");
  const vocabPath = analysis.tradeoff
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${x(index)} ${yVocab(point.vocabularySize)}`,
    )
    .join(" ");

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <div className="min-w-0">
          <LessonTitle>5. The Tradeoff</LessonTitle>
          <div className="mt-4 overflow-hidden">
            <svg
              viewBox="0 0 660 240"
              role="img"
              aria-label="Token count falls while vocabulary size rises as merge steps increase"
              className="w-full"
            >
              {[0, 1, 2, 3].map((line) => {
                const y = 38 + line * 50;

                return (
                  <line
                    key={line}
                    x1="48"
                    x2="610"
                    y1={y}
                    y2={y}
                    stroke="#dce4f3"
                    strokeDasharray="3 4"
                  />
                );
              })}
              <line x1="48" x2="610" y1="188" y2="188" stroke="#91a0bf" />
              <path d={tokenPath} fill="none" stroke="#0aa052" strokeWidth="3" />
              <path d={vocabPath} fill="none" stroke="#5636f5" strokeWidth="3" />
              {analysis.tradeoff.map((point, index) => (
                <g key={point.mergeCount}>
                  <circle
                    cx={x(index)}
                    cy={yToken(point.tokenCount)}
                    r="5"
                    fill="#0aa052"
                  />
                  <circle
                    cx={x(index)}
                    cy={yVocab(point.vocabularySize)}
                    r="5"
                    fill="#5636f5"
                  />
                  <text
                    x={x(index)}
                    y="214"
                    textAnchor="middle"
                    className="fill-[#071024] font-mono text-[13px] font-bold"
                  >
                    {point.mergeCount}
                  </text>
                  <text
                    x={x(index)}
                    y={yToken(point.tokenCount) - 10}
                    textAnchor="middle"
                    className="fill-[#0aa052] font-mono text-[13px] font-black"
                  >
                    {point.tokenCount}
                  </text>
                  <text
                    x={x(index)}
                    y={yVocab(point.vocabularySize) + 22}
                    textAnchor="middle"
                    className="fill-[#5636f5] font-mono text-[13px] font-black"
                  >
                    {point.vocabularySize}
                  </text>
                </g>
              ))}
              <text
                x="330"
                y="235"
                textAnchor="middle"
                className="fill-[#31456f] text-[13px] font-bold"
              >
                Merge steps
              </text>
              <text x="48" y="22" className="fill-[#0aa052] text-[13px] font-black">
                Token count
              </text>
              <text
                x="500"
                y="22"
                className="fill-[#5636f5] text-[13px] font-black"
              >
                Vocabulary size
              </text>
            </svg>
          </div>
        </div>

        <div className="grid content-center gap-4">
          <div className="rounded-[12px] border border-[#d8ddff] bg-[#f7f5ff] p-5">
            <p className="text-[18px] leading-[1.35] font-black text-[#352cff]">
              Takeaway: BPE compresses by turning common neighboring pieces into
              tokens, one merge at a time.
            </p>
          </div>
          <div className="rounded-[10px] border border-[#dbe2f2] bg-white p-4 font-mono text-[13px] leading-6 font-bold text-[#263a68]">
            {formatTokens(analysis.activeMerges.map((merge) => merge.token))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function BytePairEncodingPlayground() {
  const [scenarioId, setScenarioId] = useState<BpeScenarioId>("repetition");
  const [mergeCount, setMergeCount] = useState(initialMergeSteps);
  const scenario = useMemo(
    () =>
      bpeScenarios.find((item) => item.id === scenarioId) ?? bpeScenarios[0],
    [scenarioId],
  );
  const analysis = useMemo(
    () => analyzeBpe(scenario, mergeCount),
    [scenario, mergeCount],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8faff] px-4 py-6 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-[1536px]">
        <header className="mb-5">
          <div>
            <h1 className="text-[42px] leading-[0.95] font-black tracking-[-0.04em] text-[#050713] sm:text-[56px]">
              Byte Pair Encoding Lab
            </h1>
            <p className="mt-3 max-w-[780px] text-[20px] leading-[1.35] font-bold text-[#324574]">
              Merge frequent neighbors and watch text turn into reusable
              tokens.
            </p>
          </div>
        </header>

        <div className="grid min-w-0 gap-4">
          <ScenarioPanel
            scenario={scenario}
            analysis={analysis}
            onScenarioChange={(nextScenarioId) => {
              setScenarioId(nextScenarioId);
              setMergeCount(initialMergeSteps);
            }}
          />
          <MergeBudgetPanel
            analysis={analysis}
            mergeCount={mergeCount}
            onMergeCountChange={setMergeCount}
          />
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <TokenReplacementPanel analysis={analysis} />
            <ComparePanel analysis={analysis} />
          </div>
          <TradeoffPanel analysis={analysis} />
        </div>
      </div>
    </main>
  );
}

function scale(
  value: number,
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
) {
  if (domainMax === domainMin) {
    return (rangeMin + rangeMax) / 2;
  }

  return (
    rangeMin +
    ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin)
  );
}
