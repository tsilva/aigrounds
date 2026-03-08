"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { analyzeBm25Search } from "./bm25-engine";
import { bm25Documents, defaultQuery, queryPresets } from "./corpus";

function formatScore(value: number) {
  return value.toFixed(2);
}

function formatRatio(value: number) {
  return `${value.toFixed(2)}x`;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, terms: string[]) {
  if (terms.length === 0) {
    return text;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegex).join("|")})`, "gi");
  const segments = text.split(pattern);

  return segments.map((segment, index) => {
    if (terms.some((term) => term.toLowerCase() === segment.toLowerCase())) {
      return (
        <mark
          key={`${segment}-${index}`}
          className="rounded bg-emerald-200/80 px-1 text-stone-950"
        >
          {segment}
        </mark>
      );
    }

    return <span key={`${segment}-${index}`}>{segment}</span>;
  });
}

function truncate(text: string, length: number) {
  if (text.length <= length) {
    return text;
  }

  return `${text.slice(0, length).trimEnd()}...`;
}

function scoreWidth(score: number, maxScore: number) {
  if (score <= 0 || maxScore <= 0) {
    return "0%";
  }

  return `${Math.max(8, (score / maxScore) * 100)}%`;
}

function contributionWidth(contribution: number, maxContribution: number) {
  if (contribution <= 0 || maxContribution <= 0) {
    return "0%";
  }

  return `${Math.max(10, (contribution / maxContribution) * 100)}%`;
}

export function Bm25Playground() {
  const [query, setQuery] = useState(defaultQuery);
  const [k1, setK1] = useState(1.2);
  const [b, setB] = useState(0.75);
  const [inspectedDocumentId, setInspectedDocumentId] = useState(
    bm25Documents[0]?.id ?? "",
  );
  const deferredQuery = useDeferredValue(query);
  const analysis = analyzeBm25Search(bm25Documents, deferredQuery, { k1, b });
  const topDocument = analysis.rankedDocuments[0] ?? null;
  const maxScore = topDocument?.score ?? 0;
  const inspectedDocument =
    analysis.rankedDocuments.find(
      (document) => document.document.id === inspectedDocumentId,
    ) ?? topDocument;
  const strongestTerm =
    [...analysis.queryTermInsights]
      .filter((term) => term.documentFrequency > 0)
      .sort((left, right) => right.inverseDocumentFrequency - left.inverseDocumentFrequency)[0] ??
    null;
  const missingTerms = analysis.queryTermInsights.filter(
    (term) => term.documentFrequency === 0,
  );
  const matchedDocumentCount = analysis.rankedDocuments.filter(
    (document) => document.score > 0,
  ).length;

  useEffect(() => {
    if (topDocument) {
      setInspectedDocumentId(topDocument.document.id);
    }
  }, [topDocument?.document.id]);

  const maxContribution = Math.max(
    0,
    ...(inspectedDocument?.termBreakdown.map((term) => term.contribution) ?? []),
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
        <div className="border-b border-stone-200 px-6 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-500">
                  Retrieval sandbox
                </p>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                  Tune keyword ranking in public
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-stone-600">
                  BM25 sits in the first retrieval stage for a reason: rare
                  terms punch above their weight, repeated terms saturate, and
                  long documents get normalized before they can brute-force a
                  win.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-7 text-emerald-950 xl:max-w-md">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-emerald-800">
                  Formula in play
                </p>
                <p className="mt-3 font-mono text-[13px] leading-6">
                  score = sum(idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b *
                  docLen / avgDocLen)))
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-950 p-4 text-stone-50">
                <label
                  htmlFor="bm25-query"
                  className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400"
                >
                  Query
                </label>
                <input
                  id="bm25-query"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try: hybrid retrieval ranking"
                  className="mt-3 w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-base text-stone-50 outline-none transition-colors placeholder:text-stone-500 focus:border-emerald-400"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {queryPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setQuery(preset.query)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        query === preset.query
                          ? "bg-emerald-300 text-emerald-950"
                          : "bg-stone-800 text-stone-200 hover:bg-stone-700"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="k1"
                    className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500"
                  >
                    k1: term saturation
                  </label>
                  <span className="font-mono text-sm text-stone-900">
                    {k1.toFixed(1)}
                  </span>
                </div>
                <input
                  id="k1"
                  type="range"
                  min="0.2"
                  max="2.2"
                  step="0.1"
                  value={k1}
                  onChange={(event) => setK1(Number(event.target.value))}
                  className="mt-4 w-full accent-emerald-600"
                />
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Raise `k1` to keep rewarding repeated matches. Lower it to
                  make extra occurrences flatten out sooner.
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="b"
                    className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500"
                  >
                    b: length penalty
                  </label>
                  <span className="font-mono text-sm text-stone-900">
                    {b.toFixed(2)}
                  </span>
                </div>
                <input
                  id="b"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={b}
                  onChange={(event) => setB(Number(event.target.value))}
                  className="mt-4 w-full accent-emerald-600"
                />
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Raise `b` to penalize long documents more aggressively. Set it
                  near zero to mostly ignore length.
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                  Preset intent
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  {queryPresets.find((preset) => preset.query === query)?.description ??
                    "Type your own query to see how BM25 reacts term by term."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-4 sm:px-6 sm:py-6 xl:grid-cols-4">
          <div className="rounded-[1.4rem] border border-stone-200 bg-stone-950 p-4 text-stone-50">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
              Top document
            </p>
            <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-emerald-300">
              {topDocument?.document.title ?? "No match"}
            </p>
            <p className="mt-2 font-mono text-sm text-stone-400">
              score {formatScore(topDocument?.score ?? 0)}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Strongest query term
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
              {strongestTerm?.term ?? "None"}
            </p>
            <p className="mt-2 font-mono text-sm text-stone-500">
              idf {formatScore(strongestTerm?.inverseDocumentFrequency ?? 0)}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Matching docs
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-sky-700">
              {matchedDocumentCount}/{analysis.corpusSize}
            </p>
            <p className="mt-2 text-sm text-stone-500">
              BM25 only gives score where at least one query term appears.
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Average length
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-950">
              {analysis.averageDocumentLength.toFixed(1)}
            </p>
            <p className="mt-2 text-sm text-stone-600">
              tokens across this mini corpus
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
          <div className="border-b border-stone-200 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Ranked documents
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
              Candidate list after BM25
            </h3>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            {analysis.rankedDocuments.map((rankedDocument, index) => (
              <button
                key={rankedDocument.document.id}
                type="button"
                onClick={() => setInspectedDocumentId(rankedDocument.document.id)}
                className={`w-full rounded-[1.5rem] border p-5 text-left transition-colors ${
                  rankedDocument.document.id === inspectedDocument?.document.id
                    ? "border-emerald-300 bg-emerald-50/80"
                    : "border-stone-200 bg-stone-50/70 hover:border-stone-300"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                      Rank {index + 1}
                    </p>
                    <h4 className="text-2xl font-semibold tracking-[-0.04em] text-stone-950">
                      {rankedDocument.document.title}
                    </h4>
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
                      {rankedDocument.document.kicker}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                      BM25 score
                    </p>
                    <p className="mt-2 font-mono text-2xl text-stone-950">
                      {formatScore(rankedDocument.score)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e,#34d399)]"
                    style={{ width: scoreWidth(rankedDocument.score, maxScore) }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {rankedDocument.matchedTerms.length > 0 ? (
                    rankedDocument.matchedTerms.map((term) => (
                      <span
                        key={`${rankedDocument.document.id}-${term}`}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700"
                      >
                        {term}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-500">
                      No matching terms
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm leading-7 text-stone-700">
                  {highlightText(
                    truncate(rankedDocument.document.text, 210),
                    analysis.queryTerms,
                  )}
                </p>

                <div className="mt-4 flex flex-wrap gap-6 text-sm text-stone-600">
                  <p>
                    Length:{" "}
                    <span className="font-mono text-stone-900">
                      {rankedDocument.documentLength}
                    </span>
                  </p>
                  <p>
                    Length ratio:{" "}
                    <span className="font-mono text-stone-900">
                      {formatRatio(rankedDocument.lengthRatio)}
                    </span>
                  </p>
                  <p>
                    Matched terms:{" "}
                    <span className="font-mono text-stone-900">
                      {rankedDocument.matchedTerms.length}
                    </span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
            <div className="border-b border-stone-200 px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                Score breakdown
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
                Why this document landed where it did
              </h3>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-950 p-5 text-stone-50">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
                  Inspected document
                </p>
                <h4 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-emerald-300">
                  {inspectedDocument?.document.title ?? "No document selected"}
                </h4>
                <p className="mt-2 text-sm leading-7 text-stone-300">
                  {inspectedDocument?.document.kicker ??
                    "Pick a ranked document to inspect its term-by-term score."}
                </p>
                <p className="mt-4 font-mono text-sm text-stone-300">
                  Total score: {formatScore(inspectedDocument?.score ?? 0)}
                </p>
              </div>

              <div className="space-y-3">
                {(inspectedDocument?.termBreakdown ?? []).map((termScore) => (
                  <div
                    key={`${inspectedDocument?.document.id}-${termScore.term}`}
                    className="rounded-[1.35rem] border border-stone-200 bg-stone-50/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-lg font-semibold tracking-[-0.03em] text-stone-950">
                        {termScore.term}
                      </p>
                      <p className="font-mono text-sm text-stone-700">
                        +{formatScore(termScore.contribution)}
                      </p>
                    </div>

                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#14b8a6,#99f6e4)]"
                        style={{
                          width: contributionWidth(
                            termScore.contribution,
                            maxContribution,
                          ),
                        }}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <p className="text-sm text-stone-600">
                        tf <span className="font-mono text-stone-900">{termScore.termFrequency}</span>
                        {" · "}
                        idf{" "}
                        <span className="font-mono text-stone-900">
                          {formatScore(termScore.inverseDocumentFrequency)}
                        </span>
                      </p>
                      <p className="text-sm text-stone-600">
                        saturation{" "}
                        <span className="font-mono text-stone-900">
                          {formatScore(termScore.saturation)}
                        </span>
                        {" · "}
                        df{" "}
                        <span className="font-mono text-stone-900">
                          {termScore.documentFrequency}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.35rem] border border-stone-200 bg-stone-50 p-4 text-sm leading-7 text-stone-700">
                <p>
                  This document is{" "}
                  <span className="font-mono text-stone-950">
                    {formatRatio(inspectedDocument?.lengthRatio ?? 0)}
                  </span>{" "}
                  the average corpus length, so its denominator multiplier is{" "}
                  <span className="font-mono text-stone-950">
                    {formatScore(
                      inspectedDocument?.termBreakdown[0]?.lengthNormalization ?? 0,
                    )}
                  </span>
                  .
                </p>
                <p className="mt-3">
                  Higher `b` raises that multiplier for long documents and
                  lowers it for short ones. Higher `k1` makes repeated term
                  hits keep paying off instead of saturating quickly.
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
            <div className="border-b border-stone-200 px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
                Query diagnostics
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
                What the corpus thinks of your terms
              </h3>
            </div>

            <div className="space-y-4 p-5">
              {analysis.queryTerms.length > 0 ? (
                analysis.queryTermInsights.map((term) => (
                  <div
                    key={term.term}
                    className="rounded-[1.35rem] border border-stone-200 bg-stone-50/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-lg font-semibold tracking-[-0.03em] text-stone-950">
                        {term.term}
                      </p>
                      <p className="font-mono text-sm text-stone-700">
                        idf {formatScore(term.inverseDocumentFrequency)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-600">
                      Appears in{" "}
                      <span className="font-mono text-stone-900">
                        {term.documentFrequency}
                      </span>{" "}
                      of{" "}
                      <span className="font-mono text-stone-900">
                        {analysis.corpusSize}
                      </span>{" "}
                      documents. Lower document frequency means more leverage.
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-7 text-stone-600">
                  Enter at least one term to compute document frequency and
                  inverse document frequency.
                </div>
              )}

              {missingTerms.length > 0 ? (
                <div className="rounded-[1.35rem] border border-amber-300 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
                  Terms with zero document frequency still score zero because no
                  document contains them. BM25 can only reward evidence that
                  exists in the corpus.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
