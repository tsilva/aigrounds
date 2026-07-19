"use client";

import { useMemo, useState } from "react";
import {
  analyzeLayerNormalization,
  formatValue,
} from "./layer-normalization-engine";
import {
  defaultBeta,
  defaultGamma,
  defaultLayerTokenId,
  initialLayerTokens,
  type LayerToken,
  type LayerTokenId,
} from "./scenario";

const epsilon = 0.00001;
const featureLabels = ["x1", "x2", "x3", "x4"];

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
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

function LessonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] leading-none font-black text-[#1638ff] uppercase sm:text-[21px]">
      {children}
    </h2>
  );
}

function StatPill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "note";
}) {
  const toneClass =
    tone === "good"
      ? "border-[#a9e2bd] bg-[#f2fff6] text-[#078036]"
      : tone === "note"
        ? "border-[#c8d5f6] bg-[#f7f9ff] text-[#1638ff]"
        : "border-[#c8d5f6] bg-white text-[#071024]";

  return (
    <div
      className={`rounded-[7px] border px-3 py-2 text-center font-mono text-[13px] font-black sm:text-[14px] ${toneClass}`}
    >
      <span className="text-[#4d5c82]">{label}</span> = {value}
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 flex items-center justify-between gap-3 text-[13px] font-bold text-[#101832]">
        <span>{label}</span>
        <span className="rounded-[6px] border border-[#c8d5f6] bg-white px-2 py-1 font-mono text-[12px] font-black text-[#1638ff]">
          {formatValue(value)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full accent-[#1638ff]"
      />
      <span className="mt-1 flex justify-between font-mono text-[11px] text-[#526183]">
        <span>{formatValue(min, 0)}</span>
        <span>0</span>
        <span>{formatValue(max, 0)}</span>
      </span>
    </label>
  );
}

function SmallSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid grid-cols-[54px_minmax(0,1fr)_58px] items-center gap-2 text-[13px] font-bold text-[#101832]">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full accent-[#1638ff]"
      />
      <span className="rounded-[6px] border border-[#c8d5f6] bg-white px-2 py-1 text-center font-mono text-[12px] font-black text-[#071024]">
        {formatValue(value)}
      </span>
    </label>
  );
}

function TokenSelector({
  tokens,
  selectedTokenId,
  onSelectToken,
}: {
  tokens: LayerToken[];
  selectedTokenId: LayerTokenId;
  onSelectToken: (id: LayerTokenId) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[14px] font-bold text-[#101832]">
        Select a token row
      </p>
      <div className="grid grid-cols-3 gap-2">
        {tokens.map((token) => {
          const isActive = token.id === selectedTokenId;

          return (
            <button
              key={token.id}
              type="button"
              onClick={() => onSelectToken(token.id)}
              className={`min-h-10 rounded-[7px] border px-3 py-2 text-[14px] font-black transition ${
                isActive
                  ? "border-[#1638ff] bg-[#1638ff] text-white shadow-[0_10px_20px_rgba(22,56,255,0.18)]"
                  : "border-[#c8d5f6] bg-white text-[#172347] hover:bg-[#f7f9ff]"
              }`}
            >
              {token.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HiddenFeatureGrid({
  tokens,
  selectedTokenId,
  selectedToken,
  onSelectToken,
}: {
  tokens: LayerToken[];
  selectedTokenId: LayerTokenId;
  selectedToken: LayerToken;
  onSelectToken: (id: LayerTokenId) => void;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[8px] border border-[#c8d5f6] bg-white">
      <div className="grid grid-cols-[74px_repeat(4,minmax(48px,1fr))] border-b border-[#c8d5f6] bg-[#f7f9ff] text-center font-mono text-[12px] font-black text-[#071024]">
        <div className="px-2 py-2 text-left text-[#526183]">token</div>
        {featureLabels.map((label) => (
          <div key={label} className="border-l border-[#dbe4ff] px-2 py-2">
            {label}
          </div>
        ))}
      </div>
      {tokens.map((token) => {
        const isActive = token.id === selectedTokenId;

        return (
          <button
            key={token.id}
            type="button"
            onClick={() => onSelectToken(token.id)}
            className={`grid w-full grid-cols-[74px_repeat(4,minmax(48px,1fr))] text-center font-mono text-[13px] font-black transition ${
              isActive
                ? "bg-[#f3f5ff] text-[#1638ff] ring-2 ring-inset ring-[#1638ff]"
                : "text-[#8a96b3] hover:bg-[#fbfcff]"
            }`}
          >
            <span className="px-2 py-2 text-left font-sans text-[15px]">
              {token.label}
            </span>
            {(isActive ? selectedToken.values : token.values).map((value, index) => (
              <span
                key={`${token.id}-${index}`}
                className="border-l border-[#dbe4ff] px-2 py-2"
              >
                {formatValue(value)}
              </span>
            ))}
          </button>
        );
      })}
    </div>
  );
}

function FormulaRows({
  mean,
  variance,
  standardDeviation,
  normalizedValues,
}: {
  mean: number;
  variance: number;
  standardDeviation: number;
  normalizedValues: number[];
}) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#c8d5f6] bg-white">
      {[
        {
          label: "1 Mean",
          formula: "mu = (1 / d) sum x_i",
          value: formatValue(mean, 4),
        },
        {
          label: "2 Variance",
          formula: "var = (1 / d) sum (x_i - mu)^2",
          value: formatValue(variance, 4),
        },
        {
          label: "3 Std. deviation",
          formula: "sigma = sqrt(var + epsilon)",
          value: formatValue(standardDeviation, 4),
        },
        {
          label: "4 Normalize",
          formula: "x_hat_i = (x_i - mu) / sigma",
          value: `[${normalizedValues.map((value) => formatValue(value)).join(", ")}]`,
        },
      ].map((row) => (
        <div
          key={row.label}
          className="grid gap-2 border-b border-[#dbe4ff] px-3 py-2 last:border-b-0 sm:grid-cols-[120px_minmax(0,1fr)_110px] sm:items-center"
        >
          <div className="text-[13px] font-black text-[#101832]">
            {row.label}
          </div>
          <div className="font-mono text-[13px] font-black text-[#071024]">
            {row.formula}
          </div>
          <div className="font-mono text-[13px] font-black text-[#078036] sm:text-right">
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function BarChart({
  title,
  values,
  color,
  domain = 2.25,
}: {
  title: string;
  values: number[];
  color: string;
  domain?: number;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[14px] font-black text-[#071024]">{title}</p>
      <div className="relative h-[132px] rounded-[8px] border border-[#dbe4ff] bg-[#fbfcff] px-4 pb-7 pt-5">
        <div className="absolute inset-x-4 top-1/2 h-px bg-[#9eabc7]" />
        <div className="absolute left-2 top-[10px] font-mono text-[11px] text-[#526183]">
          {formatValue(domain, 0)}
        </div>
        <div className="absolute left-2 bottom-[30px] font-mono text-[11px] text-[#526183]">
          -{formatValue(domain, 0)}
        </div>
        <div className="grid h-full grid-cols-4 items-center gap-3 pl-4">
          {values.map((value, index) => {
            const magnitude = Math.min(50, Math.abs(value / domain) * 50);
            const isPositive = value >= 0;

            return (
              <div key={`${title}-${index}`} className="relative h-full">
                <div
                  className="absolute left-1/2 w-[58%] -translate-x-1/2 rounded-t-[4px]"
                  style={{
                    background: color,
                    height: `${magnitude}%`,
                    top: isPositive ? `${50 - magnitude}%` : "50%",
                    borderRadius: isPositive ? "4px 4px 0 0" : "0 0 4px 4px",
                  }}
                />
                <span
                  className={`absolute left-1/2 -translate-x-1/2 font-mono text-[12px] font-black text-[#071024] ${
                    isPositive ? "top-[8px]" : "bottom-[38px]"
                  }`}
                >
                  {formatValue(value)}
                </span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 font-mono text-[12px] font-black text-[#071024]">
                  {featureLabels[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AxisComparison({
  tokens,
  selectedTokenId,
}: {
  tokens: LayerToken[];
  selectedTokenId: LayerTokenId;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
      <AxisTable
        title="LayerNorm: across features in this token"
        tokens={tokens}
        selectedTokenId={selectedTokenId}
        highlight="row"
      />
      <AxisTable
        title="BatchNorm: down one feature across the batch"
        tokens={tokens}
        selectedTokenId={selectedTokenId}
        highlight="column"
      />
      <div className="rounded-[8px] border border-[#c8d5f6] bg-[#f7f9ff] p-4">
        <p className="text-[15px] font-black text-[#1638ff]">Key difference</p>
        <p className="mt-2 text-[14px] leading-relaxed text-[#172347]">
          LayerNorm uses this token&apos;s 4 values. BatchNorm uses the same
          feature across all tokens in the batch.
        </p>
      </div>
    </div>
  );
}

function AxisTable({
  title,
  tokens,
  selectedTokenId,
  highlight,
}: {
  title: string;
  tokens: LayerToken[];
  selectedTokenId: LayerTokenId;
  highlight: "row" | "column";
}) {
  const highlightedColumn = 1;

  return (
    <div className="min-w-0">
      <p className="mb-2 text-[14px] font-black text-[#071024]">{title}</p>
      <div className="overflow-hidden rounded-[8px] border border-[#c8d5f6] bg-white">
        <div className="grid grid-cols-[72px_repeat(4,minmax(44px,1fr))] bg-[#f7f9ff] text-center font-mono text-[12px] font-black text-[#071024]">
          <div className="px-2 py-2 text-left">token</div>
          {featureLabels.map((label) => (
            <div key={label} className="border-l border-[#dbe4ff] px-2 py-2">
              {label}
            </div>
          ))}
        </div>
        {tokens.map((token) => (
          <div
            key={`${highlight}-${token.id}`}
            className={`grid grid-cols-[72px_repeat(4,minmax(44px,1fr))] text-center font-mono text-[12px] font-black ${
              highlight === "row" && token.id === selectedTokenId
                ? "bg-[#f3f5ff] text-[#1638ff] ring-2 ring-inset ring-[#1638ff]"
                : "text-[#172347]"
            }`}
          >
            <div className="px-2 py-2 text-left font-sans text-[14px]">
              {token.label}
            </div>
            {token.values.map((value, index) => (
              <div
                key={`${token.id}-${index}`}
                className={`border-l border-[#dbe4ff] px-2 py-2 ${
                  highlight === "column" && index === highlightedColumn
                    ? "bg-[#f3f5ff] text-[#1638ff] ring-2 ring-inset ring-[#1638ff]"
                    : ""
                }`}
              >
                {formatValue(value)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LayerNormalizationPlayground() {
  const [tokens, setTokens] = useState(initialLayerTokens);
  const [selectedTokenId, setSelectedTokenId] =
    useState<LayerTokenId>(defaultLayerTokenId);
  const [gamma, setGamma] = useState(defaultGamma);
  const [beta, setBeta] = useState(defaultBeta);

  const selectedToken =
    tokens.find((token) => token.id === selectedTokenId) ?? tokens[0];
  const analysis = useMemo(
    () =>
      analyzeLayerNormalization({
        values: selectedToken.values,
        gamma,
        beta,
        epsilon,
      }),
    [beta, gamma, selectedToken.values],
  );

  function updateSelectedFeature(index: number, value: number) {
    setTokens((currentTokens) =>
      currentTokens.map((token) =>
        token.id === selectedTokenId
          ? {
              ...token,
              values: token.values.map((item, itemIndex) =>
                itemIndex === index ? value : item,
              ),
            }
          : token,
      ),
    );
  }

  function updateGamma(index: number, value: number) {
    setGamma((currentGamma) =>
      currentGamma.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  function updateBeta(index: number, value: number) {
    setBeta((currentBeta) =>
      currentBeta.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfcff] px-3 py-4 text-[#071024] sm:px-5">
      <div className="mx-auto max-w-[1536px]">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:pl-2 lg:pl-6">
          <div>
            <h1 className="min-w-0 break-words text-[38px] leading-[1] font-black tracking-[-0.055em] text-[#030713] sm:text-[52px]">
              Layer Normalization Lab
            </h1>
            <p className="mt-2 max-w-[58rem] text-[18px] leading-tight font-medium text-[#30446f] sm:text-[22px]">
              Normalize each token&apos;s hidden features using only its own values.
            </p>
          </div>
          <button
            type="button"
            className="self-start rounded-[8px] border border-[#c8d5f6] bg-white px-4 py-2 text-[14px] font-black text-[#1638ff]"
          >
            What is Layer Normalization?
          </button>
        </header>

        <div className="grid gap-3 sm:gap-4">
          <Panel className="p-5 sm:p-6">
            <LessonTitle>1. Choose The Token & Hidden Features</LessonTitle>
            <div className="mt-4 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_minmax(320px,520px)_260px] xl:items-center">
              <div className="space-y-4">
                <TokenSelector
                  tokens={tokens}
                  selectedTokenId={selectedTokenId}
                  onSelectToken={setSelectedTokenId}
                />
                <div className="rounded-[8px] border border-[#c8d5f6] bg-[#f7f9ff] p-3 text-[13px] font-bold text-[#30446f]">
                  Drag a feature value. The formula, z-score bars, and output
                  bars update from this one token row.
                </div>
              </div>
              <HiddenFeatureGrid
                tokens={tokens}
                selectedTokenId={selectedTokenId}
                selectedToken={selectedToken}
                onSelectToken={setSelectedTokenId}
              />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {selectedToken.values.map((value, index) => (
                  <SliderControl
                    key={featureLabels[index]}
                    label={featureLabels[index]}
                    value={value}
                    min={-2}
                    max={2}
                    step={0.1}
                    onChange={(nextValue) => updateSelectedFeature(index, nextValue)}
                  />
                ))}
              </div>
              <div className="rounded-[8px] border border-[#c8d5f6] bg-white p-4">
                <p className="text-[15px] font-black text-[#1638ff]">
                  Current selection
                </p>
                <p className="mt-3 text-[14px] font-bold text-[#172347]">
                  Token:{" "}
                  <span className="font-mono text-[#071024]">
                    {selectedToken.label}
                  </span>
                </p>
                <p className="mt-2 break-words font-mono text-[13px] font-black text-[#071024]">
                  x = [{selectedToken.values.map((value) => formatValue(value)).join(", ")}]
                </p>
                <p className="mt-2 font-mono text-[13px] font-black text-[#071024]">
                  d = {selectedToken.values.length}
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <LessonTitle>2. Watch The Formula Normalize Per Token</LessonTitle>
            <div className="mt-4 grid gap-6 xl:grid-cols-[470px_minmax(0,1fr)_220px] xl:items-center">
              <FormulaRows
                mean={analysis.mean}
                variance={analysis.variance}
                standardDeviation={analysis.standardDeviation}
                normalizedValues={analysis.normalizedValues}
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <BarChart
                  title="Raw features x"
                  values={analysis.values}
                  color="#4b2cff"
                />
                <BarChart
                  title="Normalized z-scores x_hat"
                  values={analysis.normalizedValues}
                  color="#12a24a"
                />
              </div>
              <div className="grid gap-2">
                <StatPill
                  label="mean(x_hat)"
                  value={`≈ ${formatValue(analysis.normalizedMean, 4)}`}
                  tone="good"
                />
                <StatPill
                  label="var(x_hat)"
                  value={`≈ ${formatValue(analysis.normalizedVariance, 4)}`}
                  tone="good"
                />
                <StatPill label="epsilon" value={formatValue(epsilon, 5)} />
              </div>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <LessonTitle>3. Scale And Shift With Learned Parameters</LessonTitle>
            <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(320px,480px)_minmax(0,1fr)_230px] xl:items-center">
              <div className="grid gap-3 sm:grid-cols-2">
                {featureLabels.map((label, index) => (
                  <div
                    key={`${label}-affine`}
                    className="rounded-[8px] border border-[#c8d5f6] bg-[#fbfcff] p-3"
                  >
                    <p className="mb-2 font-mono text-[13px] font-black text-[#1638ff]">
                      {label}
                    </p>
                    <SmallSlider
                      label="gamma"
                      value={gamma[index]}
                      min={0.4}
                      max={1.8}
                      step={0.05}
                      onChange={(nextValue) => updateGamma(index, nextValue)}
                    />
                    <div className="mt-3">
                      <SmallSlider
                        label="beta"
                        value={beta[index]}
                        min={-1}
                        max={1}
                        step={0.05}
                        onChange={(nextValue) => updateBeta(index, nextValue)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <BarChart
                title="Output after LayerNorm: y_i = gamma_i * x_hat_i + beta_i"
                values={analysis.outputValues}
                color="#f0182d"
                domain={2.25}
              />
              <div className="grid gap-2">
                <StatPill
                  label="y"
                  value={`[${analysis.outputValues
                    .map((value) => formatValue(value))
                    .join(", ")}]`}
                  tone="note"
                />
                <p className="rounded-[8px] border border-[#c8d5f6] bg-[#f7f9ff] px-4 py-3 text-[14px] font-bold leading-relaxed text-[#30446f]">
                  gamma and beta may change scale again. Normalization first
                  makes the token stable; learned parameters restore useful
                  feature sizes.
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <LessonTitle>4. Compare The Axis: Who Contributes To The Stats?</LessonTitle>
            <div className="mt-4">
              <AxisComparison tokens={tokens} selectedTokenId={selectedTokenId} />
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <LessonTitle>5. Takeaway</LessonTitle>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
              <p className="text-[16px] leading-relaxed font-medium text-[#172347]">
                Each token gets its own mean and variance across hidden features.
                LayerNorm stabilizes activation scale before learned gamma and
                beta restore the feature sizes the model needs.
              </p>
              <div className="rounded-[8px] border border-[#9ee5b5] bg-[#f2fff6] px-4 py-3 text-center font-mono text-[15px] font-black text-[#078036]">
                Per-token stats -&gt; stable training
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
