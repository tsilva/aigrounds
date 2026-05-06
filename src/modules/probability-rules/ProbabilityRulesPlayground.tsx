"use client";

import { useMemo, useState } from "react";
import {
  advanceSimulation,
  analyzeProbabilityRule,
  ruleLabels,
  type EventRuleId,
  type OutcomeMembership,
  type RuleView,
  type SimulationResult,
  type SimulationState,
} from "./probability-rules-engine";
import {
  eventAOptions,
  eventBOptions,
  ruleViews,
  type EventOption,
} from "./scenario";

const initialSimulation: SimulationState = {
  seed: 1309,
  rolls: 0,
  hits: 0,
};

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M9.7 9.2a2.4 2.4 0 0 1 4.7.6c0 2.3-2.4 2.1-2.4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
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

function EventButton({
  option,
  isSelected,
  onSelect,
}: {
  option: EventOption;
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
      <span className="block text-[13px] font-black uppercase">
        {option.shortLabel}
      </span>
      <span className="mt-2 block text-[16px] leading-[1.2] font-black">
        {option.label}
      </span>
      <span
        className={`mt-2 block text-[13px] leading-[1.35] ${
          isSelected ? "text-white/85" : "text-[#30446f]"
        }`}
      >
        {option.description}
      </span>
    </button>
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

function membershipTone(membership: OutcomeMembership) {
  if (membership.inA && membership.inB) {
    return {
      className:
        "border-[#8053ff] bg-[#efeaff] text-[#24115f] shadow-[inset_0_0_0_2px_rgba(128,83,255,0.18)]",
      label: "A and B",
    };
  }

  if (membership.inA) {
    return {
      className: "border-[#5d7dff] bg-[#eaf0ff] text-[#162a76]",
      label: "A",
    };
  }

  if (membership.inB) {
    return {
      className: "border-[#ff6b7a] bg-[#fff0f2] text-[#8b1024]",
      label: "B",
    };
  }

  return {
    className: "border-[#d9e1f2] bg-white text-[#66779e]",
    label: "Neither",
  };
}

function DiceGrid({ memberships }: { memberships: OutcomeMembership[] }) {
  const membershipById = new Map(
    memberships.map((membership) => [membership.outcome.id, membership]),
  );

  return (
    <div className="mt-5 min-w-0 overflow-x-auto pb-2">
      <div className="grid min-w-[520px] grid-cols-[42px_repeat(6,minmax(54px,1fr))] gap-2">
        <div className="h-9" />
        {[1, 2, 3, 4, 5, 6].map((second) => (
          <div
            key={second}
            className="grid h-9 place-items-center font-mono text-[12px] font-black text-[#52628a]"
          >
            d2={second}
          </div>
        ))}

        {[1, 2, 3, 4, 5, 6].map((first) => (
          <Row
            key={first}
            first={first}
            membershipById={membershipById}
          />
        ))}
      </div>
    </div>
  );
}

function Row({
  first,
  membershipById,
}: {
  first: number;
  membershipById: Map<string, OutcomeMembership>;
}) {
  return (
    <>
      <div className="grid h-14 place-items-center font-mono text-[12px] font-black text-[#52628a]">
        d1={first}
      </div>
      {[1, 2, 3, 4, 5, 6].map((second) => {
        const membership = membershipById.get(`${first}-${second}`);

        if (!membership) {
          return null;
        }

        const tone = membershipTone(membership);

        return (
          <div
            key={membership.outcome.id}
            className={`relative grid h-14 place-items-center rounded-[8px] border font-mono text-[13px] font-black transition ${tone.className} ${
              membership.inView ? "ring-2 ring-[#352cff] ring-offset-2" : ""
            }`}
            title={tone.label}
          >
            {first},{second}
          </div>
        );
      })}
    </>
  );
}

function RuleViewButton({
  view,
  isSelected,
  onSelect,
}: {
  view: RuleView;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`h-10 rounded-[8px] border px-3 font-mono text-[12px] font-black transition ${
        isSelected
          ? "border-[#5636f5] bg-[#352cff] text-white shadow-[0_10px_18px_rgba(53,44,255,0.18)]"
          : "border-[#d8e0f0] bg-white text-[#263a68] hover:border-[#b9c4de]"
      }`}
    >
      {ruleLabels[view]}
    </button>
  );
}

function LegendSwatch({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[12px] font-bold text-[#32466f]">
      <span className={`h-3 w-3 rounded-[3px] border ${className}`} />
      {label}
    </span>
  );
}

function SimulationPanel({
  simulation,
  onRun,
}: {
  simulation: SimulationResult;
  onRun: (count: number) => void;
}) {
  const expectedWidth = `${Math.round(simulation.expected * 100)}%`;
  const observedWidth = `${Math.round(simulation.observed * 100)}%`;

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>4. Simulate Rolls</LessonTitle>
      <div className="mt-4 flex flex-wrap gap-3">
        {[100, 1000].map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onRun(count)}
            className="h-10 rounded-[8px] border border-[#d8e0f0] bg-white px-4 font-mono text-[12px] font-black text-[#352cff] transition hover:border-[#352cff] hover:bg-[#f6f4ff]"
          >
            Run {count}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        <ProbabilityBar
          label="Expected"
          value={simulation.expected}
          width={expectedWidth}
          color="bg-[#352cff]"
        />
        <ProbabilityBar
          label="Observed"
          value={simulation.observed}
          width={observedWidth}
          color="bg-[#17a65a]"
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <FactPill label="Total rolls" value={String(simulation.rolls)} />
        <FactPill label="Current hits" value={String(simulation.hits)} />
      </div>
    </Panel>
  );
}

function ProbabilityBar({
  label,
  value,
  width,
  color,
}: {
  label: string;
  value: number;
  width: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-black text-[#071024]">{label}</p>
        <p className="font-mono text-[13px] font-black text-[#071024]">
          {value.toFixed(3)}
        </p>
      </div>
      <div className="mt-2 h-4 overflow-hidden rounded-full border border-[#dfe4f4] bg-[#f2f5fb]">
        <div className={`h-full rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

export function ProbabilityRulesPlayground() {
  const [eventA, setEventA] = useState<EventRuleId>("sum-seven");
  const [eventB, setEventB] = useState<EventRuleId>("first-even");
  const [view, setView] = useState<RuleView>("union");
  const [simulation, setSimulation] =
    useState<SimulationState>(initialSimulation);
  const analysis = useMemo(
    () => analyzeProbabilityRule(eventA, eventB, view),
    [eventA, eventB, view],
  );
  const simulationResult: SimulationResult = {
    ...simulation,
    observed: simulation.rolls === 0 ? 0 : simulation.hits / simulation.rolls,
    expected: analysis.probability,
  };

  function resetForSelection(
    nextEventA: EventRuleId,
    nextEventB: EventRuleId,
    nextView: RuleView,
  ) {
    setEventA(nextEventA);
    setEventB(nextEventB);
    setView(nextView);
    setSimulation(initialSimulation);
  }

  function runSimulation(count: number) {
    setSimulation((current) =>
      advanceSimulation(current, eventA, eventB, view, count),
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faff] px-4 py-5 text-[#071024] sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
        <header className="flex flex-col gap-5 pb-1 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[42px] leading-none font-black tracking-[-0.04em] text-[#070b1a] sm:text-[52px] lg:text-[60px]">
                Probability Rules Simulator
              </h1>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[#49679d] text-[18px] font-black text-[#49679d]">
                i
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-[20px] leading-[1.35] font-bold text-[#314571] sm:text-[24px]">
              Count outcomes first, then watch probability rules become arithmetic.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-[8px] border border-[#d8d7ff] bg-white/75 px-5 text-[15px] font-black text-[#2924ff] shadow-[0_12px_28px_rgba(71,85,195,0.08)] transition hover:border-[#aaa7ff] md:min-w-[250px]"
          >
            <HelpIcon />
            What is Probability?
          </button>
        </header>

        <Panel className="p-5 sm:p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
            <div className="min-w-0">
              <LessonTitle>1. Choose Events</LessonTitle>
              <p className="mt-4 max-w-[760px] text-[16px] leading-[1.45] text-[#16264e]">
                Every dice rule shades a region inside the same 36 possible
                outcomes. Choose A and B, then compare their regions.
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="min-w-0">
                  <p className="mb-3 text-[12px] font-black tracking-[0.08em] text-[#52628a] uppercase">
                    Event A
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
                    {eventAOptions.map((option) => (
                      <EventButton
                        key={option.id}
                        option={option}
                        isSelected={eventA === option.id}
                        onSelect={() => resetForSelection(option.id, eventB, view)}
                      />
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="mb-3 text-[12px] font-black tracking-[0.08em] text-[#52628a] uppercase">
                    Event B
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
                    {eventBOptions.map((option) => (
                      <EventButton
                        key={option.id}
                        option={option}
                        isSelected={eventB === option.id}
                        onSelect={() => resetForSelection(eventA, option.id, view)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-[12px] border border-[#dbe2f2] bg-[#fbfbff] p-4">
              <p className="text-[13px] font-black tracking-[0.02em] text-[#352cff] uppercase">
                Current Count
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <FactPill
                  label="Sample space"
                  value={`${analysis.counts.sampleSpace} outcomes`}
                />
                <FactPill label="A" value={`${analysis.counts.a} outcomes`} />
                <FactPill label="B" value={`${analysis.counts.b} outcomes`} />
                <FactPill
                  label="Overlap"
                  value={`${analysis.counts.intersection} outcomes`}
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <LessonTitle>2. See The Sample Space</LessonTitle>
              <p className="mt-4 max-w-[820px] text-[16px] leading-[1.45] text-[#16264e]">
                The highlighted cells are the outcomes currently counted by the
                selected rule.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ruleViews.map((entryView) => (
                <RuleViewButton
                  key={entryView}
                  view={entryView}
                  isSelected={entryView === view}
                  onSelect={() => resetForSelection(eventA, eventB, entryView)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <LegendSwatch
              className="border-[#5d7dff] bg-[#eaf0ff]"
              label="A"
            />
            <LegendSwatch
              className="border-[#ff6b7a] bg-[#fff0f2]"
              label="B"
            />
            <LegendSwatch
              className="border-[#8053ff] bg-[#efeaff]"
              label="A and B"
            />
            <LegendSwatch
              className="border-[#352cff] bg-white"
              label="counted now"
            />
          </div>

          <DiceGrid memberships={analysis.memberships} />
        </Panel>

        <Panel className="p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
            <div className="min-w-0">
              <LessonTitle>3. Count The Rule</LessonTitle>
              <div className="mt-4 rounded-[8px] border border-[#dbe2f2] bg-[#fbfbff] px-4 py-5 text-center font-mono text-[19px] leading-[1.45] font-black text-[#071024] sm:text-[25px]">
                {analysis.formula}
              </div>
              <div className="mt-3 rounded-[8px] border border-[#dbe2f2] bg-white px-4 py-4 text-center font-mono text-[16px] leading-[1.45] font-black text-[#352cff] sm:text-[21px]">
                {analysis.expandedFormula}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[13px] font-black tracking-[0.02em] text-[#352cff] uppercase">
                Current Probability
              </p>
              <div className="mt-4 grid gap-3">
                <FactPill label="Counted region" value={analysis.fraction} />
                <FactPill label="Decimal" value={analysis.decimal} />
                <div className="rounded-[8px] border border-[#dedcff] bg-[#f8f7ff] px-4 py-3 text-[15px] leading-[1.4] text-[#2924ff]">
                  {analysis.takeaway}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <SimulationPanel simulation={simulationResult} onRun={runSimulation} />

          <Panel className="p-5 sm:p-6">
            <LessonTitle>5. The Takeaway</LessonTitle>
            <p className="mt-4 text-[22px] leading-[1.35] font-black text-[#071024]">
              Probability is counted region size divided by total possible
              outcomes.
            </p>
            <div className="mt-5 rounded-[8px] border border-[#dfe4f4] bg-[#fbfbff] px-4 py-4 font-mono text-[15px] leading-[1.6] font-black text-[#263a68]">
              {analysis.fraction} = {analysis.decimal}
              <br />
              {ruleLabels[view]} selects {analysis.counts.view} of{" "}
              {analysis.counts.sampleSpace} outcomes.
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
