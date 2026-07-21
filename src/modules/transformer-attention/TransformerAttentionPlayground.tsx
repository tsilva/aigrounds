"use client";

import { type CSSProperties, useMemo, useState } from "react";
import {
  analyzeTransformerAttention,
  formatScore,
  formatVectorValue,
  formatWeight,
  type AttentionAnalysis,
} from "./transformer-attention-engine";
import {
  attentionDimensions,
  attentionScenarios,
  initialSharpness,
  type AttentionScenario,
  type AttentionScenarioId,
  type AttentionToken,
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

function ScenarioAndQueryPanel({
  scenario,
  queryToken,
  onScenarioChange,
  onQueryTokenChange,
}: {
  scenario: AttentionScenario;
  queryToken: AttentionToken;
  onScenarioChange: (scenarioId: AttentionScenarioId) => void;
  onQueryTokenChange: (tokenId: string) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="min-w-0">
          <LessonTitle>1. Choose The Query Token</LessonTitle>
          <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
            A token asks a question with its query. Keys compete to answer, and
            the winning values flow into the next representation.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {attentionScenarios.map((item) => {
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
            Current Sentence
          </p>
          <p className="mt-3 font-mono text-[15px] leading-7 font-bold text-[#071024]">
            {scenario.sentence}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {scenario.tokens.map((token) => {
              const isSelected = token.id === queryToken.id;

              return (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => onQueryTokenChange(token.id)}
                  className={`rounded-[9px] border px-3 py-2 font-mono text-[14px] font-black transition ${
                    isSelected
                      ? "border-[#352cff] bg-[#352cff] text-white shadow-[0_10px_20px_rgba(53,44,255,0.18)]"
                      : "border-[#d8e0f0] bg-white text-[#16264e] hover:border-[#9ba9cb]"
                  }`}
                >
                  {token.label}
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FactPill label="Query token" value={queryToken.label} />
            <FactPill label="Token role" value={queryToken.role} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function QueryKeyPanel({ analysis }: { analysis: AttentionAnalysis }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          <LessonTitle>2. Watch Q Meet K</LessonTitle>
          <p className="mt-4 text-[16px] leading-[1.45] text-[#16264e]">
            The query compares with every key. Bigger dot products become bigger
            softmax weights.
          </p>
          <div className="mt-5 rounded-[10px] border border-[#dce3f4] bg-[#fbfbff] p-5 text-center font-mono text-[18px] font-black text-[#071024] sm:text-[24px]">
            score<sub>i</sub> = (q · k<sub>i</sub>) / sqrt(d)
          </div>
          <div className="mt-4 rounded-[10px] border border-[#dce3f4] bg-[#f7f9ff] p-4 font-mono text-[13px] leading-6 text-[#263a68]">
            q = {analysis.queryToken.label}; keys = all tokens
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-[12px] border border-[#dbe2f2]">
          <div className="grid grid-cols-[1fr_0.7fr_0.8fr] bg-[#f5f7ff] px-4 py-3 text-[11px] font-black tracking-[0.04em] text-[#607198] uppercase">
            <span>Token key</span>
            <span>Score</span>
            <span>Weight</span>
          </div>
          <div className="divide-y divide-[#dfe6f5]">
            {analysis.weights.map((entry) => (
              <div
                key={entry.token.id}
                className="grid grid-cols-[1fr_0.7fr_0.8fr] items-center gap-3 px-4 py-3"
              >
                <span className="min-w-0 truncate font-mono text-[14px] font-black text-[#071024]">
                  {entry.token.label}
                </span>
                <span className="font-mono text-[13px] text-[#31456f]">
                  {formatScore(entry.rawScore)}
                </span>
                <div className="min-w-0">
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#e7ecf6]">
                    <div
                      className="h-full rounded-full bg-[#352cff]"
                      style={{ width: `${Math.max(entry.weight * 100, 2)}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[12px] font-bold text-[#071024]">
                    {formatWeight(entry.weight)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function AttentionMixerPanel({
  analysis,
  sharpness,
  onSharpnessChange,
}: {
  analysis: AttentionAnalysis;
  sharpness: number;
  onSharpnessChange: (value: number) => void;
}) {
  const sliderFill = ((sharpness - 0.6) / 2.6) * 100;

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <LessonTitle>3. Attention Mixer</LessonTitle>
          <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
            Softmax turns scores into a weighted lookup. Sharper focus makes the
            strongest key take more of the mix.
          </p>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-3 xl:w-[560px]">
          <FactPill label="Top key" value={analysis.topToken.label} />
          <FactPill label="Top weight" value={formatWeight(analysis.topWeight)} />
          <FactPill
            label="Entropy"
            value={formatVectorValue(analysis.normalizedEntropy)}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <AttentionArcDiagram analysis={analysis} />
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-black tracking-[0.03em] text-[#352cff] uppercase">
                Focus Sharpness
              </p>
              <p className="mt-1 text-[13px] leading-5 text-[#30446f]">
                Low spreads attention; high makes one key dominate.
              </p>
            </div>
            <span className="rounded-[8px] border border-[#dfe4f4] bg-[#fbfbff] px-3 py-2 font-mono text-[14px] font-black text-[#071024]">
              {sharpness.toFixed(1)}x
            </span>
          </div>
          <input
            aria-label="Attention focus sharpness"
            type="range"
            min="0.6"
            max="3.2"
            step="0.1"
            value={sharpness}
            onChange={(event) => onSharpnessChange(Number(event.target.value))}
            className="mt-5 h-3 w-full appearance-none rounded-full outline-none"
            style={{
              background: `linear-gradient(90deg,#352cff ${sliderFill}%,#e2e8f0 ${sliderFill}%)`,
            }}
          />
          <div className="mt-2 flex justify-between font-mono text-[11px] font-bold text-[#7180a5]">
            <span>spread</span>
            <span>sharp</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Low", value: 0.6 },
              { label: "Mid", value: initialSharpness },
              { label: "High", value: 3.2 },
            ].map((preset) => {
              const isActive = Math.abs(sharpness - preset.value) < 0.05;

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onSharpnessChange(preset.value)}
                  className={`rounded-[8px] border px-2 py-2 font-mono text-[12px] font-black transition ${
                    isActive
                      ? "border-[#352cff] bg-[#352cff] text-white"
                      : "border-[#d8e0f0] bg-[#fbfbff] text-[#263a68] hover:border-[#9ba9cb]"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="mt-5 rounded-[10px] border border-[#dbe2f2] bg-[#f7f9ff] p-4 text-[14px] leading-6 text-[#17264e]">
            <span className="font-black text-[#071024]">
              {analysis.queryToken.label}
            </span>{" "}
            sends the strongest attention to{" "}
            <span className="font-black text-[#352cff]">
              {analysis.topToken.label}
            </span>
            .
          </div>
        </div>
      </div>
    </Panel>
  );
}

function AttentionArcDiagram({ analysis }: { analysis: AttentionAnalysis }) {
  const count = analysis.weights.length;
  const queryIndex = Math.max(
    0,
    analysis.weights.findIndex(
      (entry) => entry.token.id === analysis.queryToken.id,
    ),
  );
  const width = 960;
  const height = 210;
  const leftPadding = 60;
  const rightPadding = 60;
  const usableWidth = width - leftPadding - rightPadding;
  const y = 158;
  const positions = analysis.weights.map((_, index) => ({
    x: leftPadding + (usableWidth * index) / Math.max(1, count - 1),
    y,
  }));
  const queryPosition = positions[queryIndex] ?? positions[0] ?? { x: 0, y };

  return (
    <div className="min-w-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Attention from ${analysis.queryToken.label} to all tokens`}
        className="h-auto w-full overflow-visible"
      >
        <line
          x1={leftPadding - 10}
          x2={width - rightPadding + 10}
          y1={y}
          y2={y}
          stroke="#d7dff0"
          strokeWidth="2"
        />
        {analysis.weights.map((entry, index) => {
          const position = positions[index] ?? queryPosition;
          const distance = Math.abs(position.x - queryPosition.x);
          const controlY = y - 42 - Math.min(76, distance * 0.18);
          const strokeWidth = 2 + entry.weight * 24;
          const opacity = 0.25 + entry.weight * 0.75;
          const path =
            index === queryIndex
              ? `M ${position.x - 20} ${y - 8} C ${position.x - 36} ${y - 66}, ${position.x + 36} ${y - 66}, ${position.x + 20} ${y - 8}`
              : `M ${queryPosition.x} ${y - 12} Q ${(queryPosition.x + position.x) / 2} ${controlY} ${position.x} ${y - 12}`;

          return (
            <path
              key={entry.token.id}
              d={path}
              fill="none"
              stroke={entry.token.id === analysis.topToken.id ? "#352cff" : "#78a4f7"}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          );
        })}
        {analysis.weights.map((entry, index) => {
          const position = positions[index] ?? queryPosition;
          const isQuery = entry.token.id === analysis.queryToken.id;
          const isTop = entry.token.id === analysis.topToken.id;

          return (
            <g key={entry.token.id}>
              <circle
                cx={position.x}
                cy={y}
                r={isQuery ? 24 : 20}
                fill={isQuery ? "#352cff" : isTop ? "#eef2ff" : "#ffffff"}
                stroke={isTop ? "#352cff" : "#b9c5dd"}
                strokeWidth={isTop ? 3 : 2}
              />
              <text
                x={position.x}
                y={y + 5}
                textAnchor="middle"
                className="fill-[#071024] font-mono text-[16px] font-black"
                style={isQuery ? { fill: "#ffffff" } : undefined}
              >
                {entry.token.label}
              </text>
              <text
                x={position.x}
                y={y + 48}
                textAnchor="middle"
                className="fill-[#30446f] font-mono text-[13px] font-bold"
              >
                {formatWeight(entry.weight)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function RepresentationPanel({ analysis }: { analysis: AttentionAnalysis }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0">
          <LessonTitle>4. See The New Representation</LessonTitle>
          <p className="mt-4 text-[16px] leading-[1.45] text-[#16264e]">
            Values are what get copied into the output. Each bar is the weighted
            mix that the selected token carries forward.
          </p>
          <div className="mt-5 rounded-[10px] border border-[#dce3f4] bg-[#fbfbff] p-5 text-center font-mono text-[17px] font-black text-[#071024] sm:text-[23px]">
            output = Σ attention<sub>i</sub> × value<sub>i</sub>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {attentionDimensions.map((dimension) => (
              <FactPill
                key={dimension.id}
                label={dimension.label}
                value={formatVectorValue(analysis.outputVector[dimension.id])}
              />
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
          <p className="text-[13px] font-black tracking-[0.03em] text-[#352cff] uppercase">
            Mixed Value Vector
          </p>
          <div className="mt-4 space-y-4">
            {attentionDimensions.map((dimension) => {
              const value = analysis.outputVector[dimension.id];

              return (
                <div key={dimension.id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[14px] font-black text-[#071024]">
                      {dimension.label}
                    </span>
                    <span className="font-mono text-[13px] font-black text-[#071024]">
                      {formatVectorValue(value)}
                    </span>
                  </div>
                  <div className="mt-2 h-5 overflow-hidden rounded-full bg-[#e8edf7]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, value * 100)}%`,
                        backgroundColor: dimension.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-[10px] border border-[#cdd9ff] bg-[#f5f4ff] p-4 text-[15px] leading-6 text-[#1c2e5a]">
            <span className="font-black text-[#352cff]">
              {analysis.summary}
            </span>{" "}
            The next layer receives that blended vector, not just the original
            token.
          </div>
        </div>
      </div>
    </Panel>
  );
}

function TakeawayPanel({ analysis }: { analysis: AttentionAnalysis }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_260px] lg:items-center">
        <div>
          <LessonTitle>5. The Takeaway</LessonTitle>
        </div>
        <p className="text-[22px] leading-[1.25] font-black text-[#071024] sm:text-[28px]">
          Attention is a weighted lookup: query chooses, keys compete, values get
          mixed.
        </p>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <FactPill label="Query" value={analysis.queryToken.label} />
          <FactPill label="Winning key" value={analysis.topToken.label} />
          <FactPill label="Output leans" value={analysis.dominantLabel} />
        </div>
      </div>
    </Panel>
  );
}

export function TransformerAttentionPlayground() {
  const [scenarioId, setScenarioId] =
    useState<AttentionScenarioId>("river-bank");
  const [queryTokenId, setQueryTokenId] = useState("bank");
  const [sharpness, setSharpness] = useState(initialSharpness);
  const scenario =
    attentionScenarios.find((item) => item.id === scenarioId) ??
    attentionScenarios[0]!;
  const analysis = useMemo(
    () => analyzeTransformerAttention(scenario, queryTokenId, sharpness),
    [queryTokenId, scenario, sharpness],
  );

  function handleScenarioChange(nextScenarioId: AttentionScenarioId) {
    const nextScenario =
      attentionScenarios.find((item) => item.id === nextScenarioId) ??
      attentionScenarios[0]!;

    setScenarioId(nextScenarioId);
    setQueryTokenId(nextScenario.defaultQueryId);
  }

  return (
    <main className="min-h-screen bg-[#f8fbff] px-4 py-5 text-[#071024] sm:px-6 lg:px-10">
      <div
        className="mx-auto flex w-full max-w-[1536px] flex-col gap-4"
        style={{ "--attention-accent": "#352cff" } as CSSProperties}
      >
        <header className="pt-1 pb-2">
          <div className="min-w-0 sm:pl-6">
            <h1 className="text-[42px] leading-none font-black tracking-[-0.04em] text-[#071024] sm:text-[58px]">
              Transformer Attention
            </h1>
            <p className="mt-3 max-w-3xl text-[20px] leading-[1.35] font-semibold text-[#2d3f70] sm:text-[23px]">
              Watch one token choose context, then mix values into its next
              representation.
            </p>
          </div>
        </header>

        <ScenarioAndQueryPanel
          scenario={scenario}
          queryToken={analysis.queryToken}
          onScenarioChange={handleScenarioChange}
          onQueryTokenChange={setQueryTokenId}
        />
        <QueryKeyPanel analysis={analysis} />
        <AttentionMixerPanel
          analysis={analysis}
          sharpness={sharpness}
          onSharpnessChange={setSharpness}
        />
        <RepresentationPanel analysis={analysis} />
        <TakeawayPanel analysis={analysis} />
      </div>
    </main>
  );
}
