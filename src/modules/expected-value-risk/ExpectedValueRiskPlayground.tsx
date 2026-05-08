"use client";

import { type CSSProperties, useMemo, useState } from "react";
import {
  analyzeBets,
  updateBet,
  type BetAnalysis,
  type BetId,
  type BetInput,
  type ComparisonAnalysis,
} from "./expected-value-risk-engine";
import { expectedValuePresets, roundOptions } from "./scenario";

function formatMoney(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const amount = Math.abs(value).toFixed(0);

  return `${sign}$${amount}`;
}

function formatDecimal(value: number) {
  return value.toFixed(2);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
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
      className={`rounded-[14px] border border-[#d8e0f3] bg-white/95 shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
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

function SliderControl({
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  tone = "#352cff",
  onChange,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  tone?: string;
  onChange: (value: number) => void;
}) {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <label className="block min-w-0 rounded-[10px] border border-[#dbe2f2] bg-[#fbfbff] px-4 py-3">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-black text-[#071024]">{label}</span>
        <span className="font-mono text-[13px] font-black" style={{ color: tone }}>
          {valueLabel}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dce1ec] accent-[#352cff] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#352cff] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#352cff]"
        style={
          {
            background: `linear-gradient(90deg, ${tone} 0%, ${tone} ${progress}%, #dce1ec ${progress}%, #dce1ec 100%)`,
          } as CSSProperties
        }
      />
    </label>
  );
}

function PresetButton({
  label,
  description,
  isSelected,
  onSelect,
}: {
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-w-0 rounded-[10px] border p-4 text-left transition ${
        isSelected
          ? "border-[#5636f5] bg-[linear-gradient(180deg,#694bff,#4a27e8)] text-white shadow-[0_14px_24px_rgba(70,39,232,0.2)]"
          : "border-[#d8e0f0] bg-white text-[#0d1429] hover:border-[#b9c4de] hover:bg-[#fbfaff]"
      }`}
    >
      <span className="block text-[13px] leading-tight font-black">{label}</span>
      <span
        className={`mt-2 block text-[12px] leading-[1.3] ${
          isSelected ? "text-white/85" : "text-[#30446f]"
        }`}
      >
        {description}
      </span>
    </button>
  );
}

function BetEditor({
  bet,
  analysis,
  onChange,
}: {
  bet: BetInput;
  analysis: BetAnalysis;
  onChange: (patch: Partial<Pick<BetInput, "probability" | "winAmount" | "lossAmount">>) => void;
}) {
  return (
    <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[17px] leading-tight font-black text-[#071024]">
            {bet.label}
          </p>
          <p className="mt-1 text-[13px] text-[#30446f]">
            Tune chance, upside, and downside.
          </p>
        </div>
        <div className="rounded-[8px] border border-[#dfe4f4] bg-[#fbfbff] px-3 py-2 text-right">
          <p className="text-[11px] font-black text-[#7180a5] uppercase">EV</p>
          <p
            className="font-mono text-[16px] font-black"
            style={{ color: analysis.expectedValue >= 0 ? "#16a34a" : "#ff2525" }}
          >
            {formatMoney(analysis.expectedValue)}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <SliderControl
          label="Win probability"
          valueLabel={formatPercent(bet.probability)}
          min={0.05}
          max={0.95}
          step={0.01}
          value={bet.probability}
          tone="#352cff"
          onChange={(probability) => onChange({ probability })}
        />
        <SliderControl
          label="Win amount"
          valueLabel={formatMoney(bet.winAmount)}
          min={5}
          max={240}
          step={1}
          value={bet.winAmount}
          tone="#16a34a"
          onChange={(winAmount) => onChange({ winAmount })}
        />
        <SliderControl
          label="Loss amount"
          valueLabel={formatMoney(bet.lossAmount)}
          min={-180}
          max={-5}
          step={1}
          value={bet.lossAmount}
          tone="#ff2525"
          onChange={(lossAmount) => onChange({ lossAmount })}
        />
      </div>
    </div>
  );
}

function BuildBetsPanel({
  bets,
  analysis,
  selectedPreset,
  onSelectPreset,
  onUpdateBet,
}: {
  bets: BetInput[];
  analysis: ComparisonAnalysis;
  selectedPreset: string;
  onSelectPreset: (presetId: string) => void;
  onUpdateBet: (
    betId: BetId,
    patch: Partial<Pick<BetInput, "probability" | "winAmount" | "lossAmount">>,
  ) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>1. Build Two Bets</LessonTitle>
      <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
        Expected value is the average outcome you would expect over many repeats.
        Risk is how wide the individual outcomes can swing around that average.
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {expectedValuePresets.map((preset) => (
          <PresetButton
            key={preset.id}
            label={preset.label}
            description={preset.description}
            isSelected={selectedPreset === preset.id}
            onSelect={() => onSelectPreset(preset.id)}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {bets.map((bet) => {
          const betAnalysis = analysis.bets.find((entry) => entry.id === bet.id);

          if (!betAnalysis) {
            return null;
          }

          return (
            <BetEditor
              key={bet.id}
              bet={bet}
              analysis={betAnalysis}
              onChange={(patch) => onUpdateBet(bet.id, patch)}
            />
          );
        })}
      </div>
    </Panel>
  );
}

function FormulaPanel({ analysis }: { analysis: ComparisonAnalysis }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="min-w-0">
          <LessonTitle>2. Weight Each Outcome</LessonTitle>
          <p className="mt-4 text-[16px] leading-[1.45] text-[#071024]">
            Every outcome contributes its value multiplied by its probability.
          </p>
          <div className="mt-4 rounded-[8px] border border-[#dbe2f2] bg-[#fbfbff] px-4 py-4 text-center font-serif text-[24px] leading-[1.3] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:text-[30px]">
            EV = p(win) × win + p(loss) × loss
          </div>
          <div className="mt-4 grid gap-3">
            {analysis.bets.map((bet) => (
              <FormulaLine key={bet.id} bet={bet} />
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <LessonTitle>Average Versus Ride</LessonTitle>
          <div className="mt-4 overflow-hidden rounded-[10px] border border-[#dfe4f4]">
            <div className="grid grid-cols-[0.85fr_1fr_1fr_1fr] bg-[#f7f8ff] text-[11px] font-black tracking-[0.03em] text-[#52628a] uppercase">
              <span className="p-3">Bet</span>
              <span className="p-3">EV</span>
              <span className="p-3">Risk</span>
              <span className="p-3">Break-even p</span>
            </div>
            {analysis.bets.map((bet) => (
              <div
                key={bet.id}
                className="grid grid-cols-[0.85fr_1fr_1fr_1fr] border-t border-[#dfe4f4] bg-white text-[13px] leading-[1.3]"
              >
                <span className="p-3 font-black text-[#071024]">
                  {bet.shortLabel}
                </span>
                <span className="p-3 font-mono text-[#263a68]">
                  {formatMoney(bet.expectedValue)}
                </span>
                <span className="p-3 font-mono text-[#263a68]">
                  σ {formatDecimal(bet.standardDeviation)}
                </span>
                <span className="p-3 font-mono text-[#263a68]">
                  {formatPercent(bet.breakEvenProbability)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[8px] border border-[#dedcff] bg-[#f8f7ff] px-5 py-3 text-[15px] leading-[1.35] text-[#2924ff]">
            The largest prize does not decide the best bet. Probability decides
            how much that prize counts.
          </div>
        </div>
      </div>
    </Panel>
  );
}

function FormulaLine({ bet }: { bet: BetAnalysis }) {
  return (
    <div className="rounded-[8px] border border-[#dfe4f4] bg-white px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[14px] font-black text-[#071024]">{bet.label}</p>
        <p
          className="font-mono text-[18px] font-black"
          style={{ color: bet.expectedValue >= 0 ? "#16a34a" : "#ff2525" }}
        >
          EV = {formatMoney(bet.expectedValue)}
        </p>
      </div>
      <p className="mt-2 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-[#263a68]">
        {formatDecimal(bet.probability)} × {formatMoney(bet.winAmount)} +{" "}
        {formatDecimal(1 - bet.probability)} × {formatMoney(bet.lossAmount)}
      </p>
    </div>
  );
}

function CompareRiskPanel({ analysis }: { analysis: ComparisonAnalysis }) {
  return (
    <Panel className="px-5 py-6 sm:px-8">
      <LessonTitle>3. Compare EV And Risk</LessonTitle>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-5">
          {analysis.bets.map((bet) => (
            <RiskLine key={bet.id} bet={bet} domain={analysis.domain} />
          ))}
        </div>
        <div className="grid content-start gap-3">
          <FactPill
            label="Higher expected value"
            value={
              analysis.bets.find((bet) => bet.id === analysis.bestExpectedValue)
                ?.label ?? ""
            }
          />
          <FactPill
            label="Lower risk"
            value={
              analysis.bets.find((bet) => bet.id === analysis.lowestRisk)?.label ??
              ""
            }
          />
          <FactPill
            label="Widest swing"
            value={
              analysis.bets.find((bet) => bet.id === analysis.widestSwing)?.label ??
              ""
            }
          />
        </div>
      </div>
    </Panel>
  );
}

function FactPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#dfe4f4] bg-[#fbfbff] px-4 py-3">
      <p className="text-[11px] font-black tracking-[0.03em] text-[#7180a5] uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-[16px] font-black text-[#071024]">
        {value}
      </p>
    </div>
  );
}

function RiskLine({
  bet,
  domain,
}: {
  bet: BetAnalysis;
  domain: ComparisonAnalysis["domain"];
}) {
  const range = domain.max - domain.min;
  const lossPosition = ((bet.lossAmount - domain.min) / range) * 100;
  const winPosition = ((bet.winAmount - domain.min) / range) * 100;
  const evPosition = ((bet.expectedValue - domain.min) / range) * 100;

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-[16px] font-black text-[#071024]">{bet.label}</p>
          <p className="mt-1 text-[13px] text-[#30446f]">
            Win {formatMoney(bet.winAmount)} or lose{" "}
            {formatMoney(bet.lossAmount)}
          </p>
        </div>
        <p className="font-mono text-[14px] font-black text-[#f59e0b]">
          σ {formatDecimal(bet.standardDeviation)}
        </p>
      </div>
      <div className="relative h-[82px] rounded-[10px] border border-[#dbe2f2] bg-[#fbfbff] px-4">
        <div className="absolute right-4 left-4 top-[42px] h-px bg-[#98a6c5]" />
        <div
          className="absolute top-[36px] h-3 rounded-full"
          style={{
            left: `calc(${lossPosition}% + ${16 - lossPosition * 0.32}px)`,
            width: `calc(${winPosition - lossPosition}% - ${(winPosition - lossPosition) * 0.32}px)`,
            background: `linear-gradient(90deg,#ff2525,${bet.mutedColor},${bet.color})`,
          }}
        />
        <OutcomeMarker
          label="loss"
          value={formatMoney(bet.lossAmount)}
          position={lossPosition}
          color="#ff2525"
        />
        <OutcomeMarker
          label="EV"
          value={formatMoney(bet.expectedValue)}
          position={evPosition}
          color="#352cff"
          isPrimary
        />
        <OutcomeMarker
          label="win"
          value={formatMoney(bet.winAmount)}
          position={winPosition}
          color="#16a34a"
        />
      </div>
    </div>
  );
}

function OutcomeMarker({
  label,
  value,
  position,
  color,
  isPrimary = false,
}: {
  label: string;
  value: string;
  position: number;
  color: string;
  isPrimary?: boolean;
}) {
  return (
    <div
      className="absolute top-[21px] -translate-x-1/2 text-center"
      style={{ left: `calc(${position}% + ${16 - position * 0.32}px)` }}
    >
      <p
        className={`font-mono leading-none font-black ${
          isPrimary ? "text-[16px]" : "text-[13px]"
        }`}
        style={{ color }}
      >
        {value}
      </p>
      <span
        className={`mx-auto mt-2 block rounded-full border-2 bg-white ${
          isPrimary ? "h-5 w-5" : "h-4 w-4"
        }`}
        style={{ borderColor: color }}
      />
      <p className="mt-2 text-[10px] font-black tracking-[0.05em] text-[#7180a5] uppercase">
        {label}
      </p>
    </div>
  );
}

function SimulatorPanel({
  analysis,
  rounds,
  onChangeRounds,
}: {
  analysis: ComparisonAnalysis;
  rounds: number;
  onChangeRounds: (rounds: (typeof roundOptions)[number]) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <LessonTitle>4. Run The Long Game</LessonTitle>
          <p className="mt-4 max-w-[720px] text-[16px] leading-[1.45] text-[#16264e]">
            Short runs bounce around. As repeats pile up, the running average
            starts drifting toward expected value.
          </p>
        </div>
        <div className="flex rounded-[10px] border border-[#d8e0f0] bg-white p-1">
          {roundOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChangeRounds(option)}
              className={`h-9 rounded-[8px] px-3 font-mono text-[12px] font-black transition ${
                rounds === option
                  ? "bg-[#352cff] text-white shadow-[0_8px_14px_rgba(53,44,255,0.18)]"
                  : "text-[#263a68] hover:bg-[#f6f4ff]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {analysis.bets.map((bet) => (
          <OutcomeStrip key={bet.id} bet={bet} />
        ))}
      </div>
    </Panel>
  );
}

function OutcomeStrip({ bet }: { bet: BetAnalysis }) {
  return (
    <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[16px] font-black text-[#071024]">{bet.label}</p>
          <p className="mt-1 text-[13px] text-[#30446f]">
            {bet.wins} wins, {bet.losses} losses
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black text-[#7180a5] uppercase">
            Sim avg
          </p>
          <p className="font-mono text-[16px] font-black text-[#352cff]">
            {formatMoney(bet.simulatedAverage)}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(8px,1fr))] gap-[3px]">
        {bet.outcomes.map((outcome) => (
          <span
            key={outcome.id}
            className="h-7 rounded-[3px]"
            title={`Round ${outcome.round}: ${formatMoney(outcome.value)}`}
            style={{
              background: outcome.isWin
                ? `linear-gradient(180deg,${bet.mutedColor},${bet.color})`
                : "linear-gradient(180deg,#ff9b9b,#ff2525)",
            }}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <FactPill label="Expected average" value={formatMoney(bet.expectedValue)} />
        <FactPill label="Simulated total" value={formatMoney(bet.simulatedTotal)} />
      </div>
    </div>
  );
}

function TakeawayPanel({ analysis }: { analysis: ComparisonAnalysis }) {
  const best = analysis.bets.find((bet) => bet.id === analysis.bestExpectedValue);
  const riskiest = analysis.bets.find((bet) => bet.id === analysis.widestSwing);

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>5. The Takeaway</LessonTitle>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <p className="text-[19px] leading-[1.35] font-black text-[#071024]">
          Expected value tells the long-run average. Risk tells how rough the
          ride can be before the average has time to show up.
        </p>
        <div className="rounded-[10px] border border-[#dedcff] bg-[#f8f7ff] px-5 py-4 text-[15px] leading-[1.4] text-[#2924ff]">
          {best?.label} has the higher EV here. {riskiest?.label} has the wider
          swing, so it can win the average while still producing bigger short-run
          shocks.
        </div>
      </div>
    </Panel>
  );
}

export function ExpectedValueRiskPlayground() {
  const [selectedPreset, setSelectedPreset] = useState(expectedValuePresets[0].id);
  const [bets, setBets] = useState<BetInput[]>(expectedValuePresets[0].bets);
  const [rounds, setRounds] = useState<(typeof roundOptions)[number]>(60);
  const analysis = useMemo(() => analyzeBets(bets, rounds), [bets, rounds]);

  function selectPreset(presetId: string) {
    const preset = expectedValuePresets.find((entry) => entry.id === presetId);

    if (!preset) {
      return;
    }

    setSelectedPreset(preset.id);
    setBets(preset.bets);
  }

  function updateBetInput(
    betId: BetId,
    patch: Partial<Pick<BetInput, "probability" | "winAmount" | "lossAmount">>,
  ) {
    setSelectedPreset("custom");
    setBets((current) => updateBet(current, betId, patch));
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfcff] px-3 py-4 text-[#071024] sm:px-5">
      <div className="mx-auto max-w-[1536px]">
        <header className="mb-4 pl-0 sm:pl-6">
          <h1 className="min-w-0 break-words text-[38px] leading-[1] font-black tracking-[-0.055em] text-[#030713] sm:text-[44px]">
            Expected Value & Risk Lab
          </h1>
          <p className="mt-2 max-w-[58rem] text-[18px] leading-tight font-medium text-[#30446f] sm:text-[22px]">
            Compare long-run average payoff with the swings you feel along the way.
          </p>
        </header>

        <div className="grid gap-4">
          <BuildBetsPanel
            bets={bets}
            analysis={analysis}
            selectedPreset={selectedPreset}
            onSelectPreset={selectPreset}
            onUpdateBet={updateBetInput}
          />
          <FormulaPanel analysis={analysis} />
          <CompareRiskPanel analysis={analysis} />
          <SimulatorPanel
            analysis={analysis}
            rounds={rounds}
            onChangeRounds={setRounds}
          />
          <TakeawayPanel analysis={analysis} />
        </div>
      </div>
    </main>
  );
}
