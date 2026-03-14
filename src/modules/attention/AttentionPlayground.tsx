"use client";

import { useEffect, useState } from "react";
import {
  analyzeAttentionScenario,
  type AttentionCandidateSummary,
} from "./attention-engine";
import { attentionScenarios } from "./scenarios";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatSigned(value: number) {
  const rounded = value.toFixed(2);

  return value > 0 ? `+${rounded}` : rounded;
}

function spreadLabel(normalizedEntropy: number) {
  if (normalizedEntropy < 0.35) {
    return "Tight focus";
  }

  if (normalizedEntropy < 0.68) {
    return "Competitive";
  }

  return "Diffuse";
}

function mapCellStyle(weight: number, isSelected: boolean) {
  const glow = 0.1 + weight * 0.65;

  return {
    background: `linear-gradient(180deg, rgba(14,165,233,${glow * 0.55}), rgba(59,130,246,${glow}))`,
    borderColor: isSelected
      ? "rgba(14,116,144,0.75)"
      : "rgba(148,163,184,0.35)",
    boxShadow: isSelected
      ? "0 0 0 1px rgba(14,116,144,0.35)"
      : "none",
  };
}

function tokenChipStyle(weight: number, isSelected: boolean) {
  const borderOpacity = 0.2 + weight * 0.55;
  const backgroundOpacity = 0.08 + weight * 0.42;

  return {
    borderColor: isSelected
      ? "rgba(14,116,144,0.7)"
      : `rgba(56,189,248,${borderOpacity})`,
    backgroundColor: `rgba(224,242,254,${backgroundOpacity})`,
    color: weight > 0.45 ? "#0c4a6e" : "#334155",
  };
}

function candidateBarWidth(
  candidate: AttentionCandidateSummary,
  leader: AttentionCandidateSummary | null,
) {
  if (!leader || leader.rawScore <= 0) {
    return "12%";
  }

  return `${Math.max(12, (candidate.rawScore / leader.rawScore) * 100)}%`;
}

export function AttentionPlayground() {
  const [scenarioId, setScenarioId] = useState(attentionScenarios[0]?.id ?? "");
  const scenario =
    attentionScenarios.find((entry) => entry.id === scenarioId) ??
    attentionScenarios[0];
  const [contextStrength, setContextStrength] = useState(
    scenario?.defaultContextStrength ?? 0.4,
  );
  const [sharpness, setSharpness] = useState(scenario?.defaultSharpness ?? 1.7);
  const [recencyBias, setRecencyBias] = useState(
    scenario?.defaultRecencyBias ?? 0.3,
  );
  const [selectedTokenId, setSelectedTokenId] = useState(
    scenario?.tokens[0]?.id ?? "",
  );

  useEffect(() => {
    if (!scenario) {
      return;
    }

    setContextStrength(scenario.defaultContextStrength);
    setSharpness(scenario.defaultSharpness);
    setRecencyBias(scenario.defaultRecencyBias);
    setSelectedTokenId(scenario.tokens[0]?.id ?? "");
  }, [scenarioId, scenario]);

  if (!scenario) {
    return null;
  }

  const analysis = analyzeAttentionScenario(scenario, {
    contextStrength,
    sharpness,
    recencyBias,
  });
  const baseline = analyzeAttentionScenario(scenario, {
    contextStrength: 0,
    sharpness,
    recencyBias,
  });
  const selectedToken =
    analysis.tokens.find((token) => token.id === selectedTokenId) ??
    analysis.topToken;
  const outputFlipped =
    baseline.topCandidate?.label !== analysis.topCandidate?.label;
  const sourceFlipped = baseline.topToken?.id !== analysis.topToken?.id;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
        <div className="border-b border-stone-200 px-6 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-500">
                  Single-head attention sandbox
                </p>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                  Watch one decoding step get negotiated token by token
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-stone-600">
                  The sliders do one thing: change which earlier tokens look
                  most compatible with the next-token query. Softmax then turns
                  that small preference shift into a visible winner-take-most
                  jump.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-7 text-sky-950 xl:max-w-md">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-sky-800">
                  Formula in play
                </p>
                <p className="mt-3 font-mono text-[13px] leading-6">
                  weights = softmax((query dot key) * sharpness + recency)
                </p>
                <p className="font-mono text-[13px] leading-6">
                  next token = argmax(context vector dot candidate)
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-950 p-4 text-stone-50">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
                  Scenario
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {attentionScenarios.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setScenarioId(entry.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        entry.id === scenario.id
                          ? "bg-sky-300 text-sky-950"
                          : "bg-stone-800 text-stone-200 hover:bg-stone-700"
                      }`}
                    >
                      {entry.title}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] text-sky-200">
                  {scenario.kicker}
                </p>
                <p className="mt-4 text-sm leading-7 text-stone-300">
                  {scenario.description}
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="context-strength"
                    className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500"
                  >
                    Context blend
                  </label>
                  <span className="font-mono text-sm text-stone-900">
                    {formatPercent(contextStrength)}
                  </span>
                </div>
                <input
                  id="context-strength"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={contextStrength}
                  onChange={(event) =>
                    setContextStrength(Number(event.target.value))
                  }
                  className="mt-4 w-full accent-sky-600"
                />
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Blend from <strong>{scenario.localLabel}</strong> toward{" "}
                  <strong>{scenario.contextLabel}</strong>.
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="sharpness"
                    className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500"
                  >
                    Sharpness
                  </label>
                  <span className="font-mono text-sm text-stone-900">
                    {sharpness.toFixed(1)}
                  </span>
                </div>
                <input
                  id="sharpness"
                  type="range"
                  min="0.8"
                  max="2.6"
                  step="0.1"
                  value={sharpness}
                  onChange={(event) => setSharpness(Number(event.target.value))}
                  className="mt-4 w-full accent-sky-600"
                />
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Higher sharpness lets one slightly better token absorb most of
                  the probability mass.
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="recency-bias"
                    className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500"
                  >
                    Recency bias
                  </label>
                  <span className="font-mono text-sm text-stone-900">
                    {recencyBias.toFixed(2)}
                  </span>
                </div>
                <input
                  id="recency-bias"
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.05"
                  value={recencyBias}
                  onChange={(event) =>
                    setRecencyBias(Number(event.target.value))
                  }
                  className="mt-4 w-full accent-sky-600"
                />
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Push probability toward the newest tokens even when older ones
                  are semantically stronger.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-4 sm:px-6 sm:py-6 xl:grid-cols-4">
          <div className="rounded-[1.4rem] border border-stone-200 bg-stone-950 p-4 text-stone-50">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
              Predicted next token
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-sky-300">
              {analysis.topCandidate?.label ?? "None"}
            </p>
            <p className="mt-2 font-mono text-sm text-stone-400">
              {formatPercent(analysis.topCandidate?.probability ?? 0)} win
              probability
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Strongest source token
            </p>
            <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-stone-950">
              {analysis.topToken?.label ?? "None"}
            </p>
            <p className="mt-2 font-mono text-sm text-stone-500">
              {formatPercent(analysis.topToken?.attentionWeight ?? 0)} of the
              step
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Attention spread
            </p>
            <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-stone-950">
              {spreadLabel(analysis.normalizedEntropy)}
            </p>
            <p className="mt-2 font-mono text-sm text-stone-500">
              entropy {analysis.normalizedEntropy.toFixed(2)}
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Leader gap
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-sky-700">
              {formatPercent(analysis.dominanceGap)}
            </p>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Difference between the top two attention weights.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(21rem,1fr)]">
        <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
          <div className="border-b border-stone-200 px-6 py-5">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-500">
              Attention map
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
              One query row, many competing source tokens
            </h3>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <div className="overflow-x-auto rounded-[1.5rem] border border-stone-200 bg-[linear-gradient(180deg,#f8fbff,#eef6ff)] p-4">
              <div
                className="grid min-w-max gap-3"
                style={{
                  gridTemplateColumns: `10rem repeat(${scenario.tokens.length}, minmax(5rem, 1fr))`,
                }}
              >
                <div />
                {scenario.tokens.map((token) => {
                  const tokenSummary =
                    analysis.tokens.find((entry) => entry.id === token.id) ??
                    analysis.topToken;

                  return (
                    <div
                      key={`${token.id}-header`}
                      className="px-1 text-center text-xs font-medium uppercase tracking-[0.2em] text-stone-500"
                    >
                      {tokenSummary?.label ?? token.label}
                    </div>
                  );
                })}

                <div className="flex items-center justify-center rounded-2xl border border-stone-300 bg-stone-950 px-3 py-4 text-center text-sm font-medium text-stone-50">
                  Next token query
                </div>
                {scenario.tokens.map((token) => {
                  const tokenSummary =
                    analysis.tokens.find((entry) => entry.id === token.id) ??
                    analysis.topToken;
                  const isSelected = tokenSummary?.id === selectedToken?.id;

                  return (
                    <button
                      key={token.id}
                      type="button"
                      onClick={() => setSelectedTokenId(token.id)}
                      className="rounded-2xl border px-2 py-4 text-center text-sm font-medium transition-transform hover:-translate-y-0.5"
                      style={mapCellStyle(
                        tokenSummary?.attentionWeight ?? 0,
                        isSelected,
                      )}
                    >
                      <span className="block text-sm text-slate-950">
                        {formatPercent(tokenSummary?.attentionWeight ?? 0)}
                      </span>
                      <span className="mt-2 block text-[11px] uppercase tracking-[0.18em] text-slate-700">
                        {tokenSummary?.role ?? token.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {scenario.tokens.map((token) => {
                const tokenSummary =
                  analysis.tokens.find((entry) => entry.id === token.id) ??
                  analysis.topToken;
                const isSelected = tokenSummary?.id === selectedToken?.id;

                return (
                  <button
                    key={`${token.id}-chip`}
                    type="button"
                    onClick={() => setSelectedTokenId(token.id)}
                    className="rounded-full border px-3 py-2 text-sm transition-transform hover:-translate-y-0.5"
                    style={tokenChipStyle(
                      tokenSummary?.attentionWeight ?? 0,
                      isSelected,
                    )}
                  >
                    <span className="font-medium">{token.label}</span>
                    <span className="ml-2 font-mono text-[12px]">
                      {formatPercent(tokenSummary?.attentionWeight ?? 0)}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedToken ? (
              <div className="mt-5 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                      Selected token
                    </p>
                    <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
                      {selectedToken.label}
                    </h4>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                      {selectedToken.detail}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-800">
                      Role
                    </p>
                    <p className="mt-2 font-medium">{selectedToken.role}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <div className="rounded-[1.2rem] border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Weight
                    </p>
                    <p className="mt-2 text-xl font-semibold text-stone-950">
                      {formatPercent(selectedToken.attentionWeight)}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Query match
                    </p>
                    <p className="mt-2 text-xl font-semibold text-stone-950">
                      {selectedToken.queryAlignment.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Recency bonus
                    </p>
                    <p className="mt-2 text-xl font-semibold text-stone-950">
                      {selectedToken.recencyBonus.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Context shift
                    </p>
                    <p className="mt-2 text-xl font-semibold text-stone-950">
                      {formatSigned(selectedToken.contextShift)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </article>

        <div className="space-y-6">
          <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
            <div className="border-b border-stone-200 px-6 py-5">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-500">
                Decoded candidates
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
                Context vector to next-token ranking
              </h3>
            </div>

            <div className="space-y-4 px-6 py-5">
              {analysis.candidates.map((candidate) => (
                <div
                  key={candidate.label}
                  className={`rounded-[1.4rem] border p-4 ${
                    candidate.label === analysis.topCandidate?.label
                      ? "border-sky-300 bg-sky-50"
                      : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-stone-950">
                        {candidate.label}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        {candidate.detail}
                      </p>
                    </div>
                    <p className="font-mono text-sm text-stone-500">
                      {formatPercent(candidate.probability)}
                    </p>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-white">
                    <div
                      className={`h-3 rounded-full ${
                        candidate.label === analysis.topCandidate?.label
                          ? "bg-sky-600"
                          : "bg-stone-400"
                      }`}
                      style={{
                        width: candidateBarWidth(
                          candidate,
                          analysis.topCandidate,
                        ),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-stone-950 text-stone-100 shadow-[0_24px_55px_rgba(28,25,23,0.22)]">
            <div className="px-6 py-5">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-400">
                What changed
              </p>
              <div className="mt-4 space-y-4 text-sm leading-7 text-stone-300">
                <p>
                  Baseline winner with zero context blend:{" "}
                  <strong className="text-stone-50">
                    {baseline.topCandidate?.label ?? "None"}
                  </strong>
                  .
                </p>
                <p>
                  Current strongest source:{" "}
                  <strong className="text-stone-50">
                    {analysis.topToken?.label ?? "None"}
                  </strong>
                  {analysis.runnerUpToken
                    ? ` over ${analysis.runnerUpToken.label}.`
                    : "."}
                </p>
                <p>
                  {outputFlipped
                    ? `The decoded output flipped from ${baseline.topCandidate?.label} to ${analysis.topCandidate?.label} because the query now aligns more with ${scenario.contextLabel}.`
                    : `The decoded output has not flipped yet. Recent-token momentum still keeps ${analysis.topCandidate?.label} in front.`}
                </p>
                <p>
                  {sourceFlipped
                    ? `Source control also changed: ${baseline.topToken?.label} lost the step to ${analysis.topToken?.label}.`
                    : `${analysis.topToken?.label} stayed in control, but its margin moved as the sliders changed.`}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
