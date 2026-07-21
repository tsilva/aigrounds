"use client";

import { useState } from "react";
import {
  analyzeAutograd,
  autogradFormulas,
  defaultFormulaId,
  formatCompact,
  formatFixed,
  getDefaultValues,
  getFormulaDefinition,
  learningRate,
  type AutogradAnalysis,
  type ChartLine,
  type FormulaDefinition,
  type FormulaId,
  type GraphEdge,
  type GraphNode,
  type ParameterKey,
} from "./autograd-graphs-engine";

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
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

function LessonTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[17px] leading-none font-black text-[#1638ff] uppercase sm:text-[19px]">
      {children}
    </h2>
  );
}

function ValueCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "blue" | "red" | "green";
}) {
  const toneClass =
    tone === "blue"
      ? "text-[#1638ff]"
      : tone === "red"
        ? "text-[#ff1d37]"
        : tone === "green"
          ? "text-[#0b9f49]"
          : "text-[#071024]";

  return (
    <div className="min-w-0 rounded-[8px] border border-[#dbe4ff] bg-white px-3 py-2 text-center">
      <p className="text-[11px] font-black text-[#6d789b] uppercase">
        {label}
      </p>
      <p className={`mt-1 truncate font-mono text-[16px] font-black ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function FormulaSelector({
  formulaId,
  onSelectFormula,
}: {
  formulaId: FormulaId;
  onSelectFormula: (id: FormulaId) => void;
}) {
  return (
    <div className="grid gap-3">
      {autogradFormulas.map((formula) => {
        const isActive = formula.id === formulaId;

        return (
          <button
            key={formula.id}
            type="button"
            onClick={() => onSelectFormula(formula.id)}
            className={`min-h-[92px] rounded-[9px] border px-4 py-3 text-left transition ${
              isActive
                ? "border-[#1638ff] bg-[#352cff] text-white shadow-[0_12px_26px_rgba(22,56,255,0.22)]"
                : "border-[#d8e0f3] bg-white text-[#071024] hover:border-[#aebdf1] hover:bg-[#f7f9ff]"
            }`}
          >
            <p className="font-mono text-[13px] font-black">
              {formula.label}
            </p>
            <p
              className={`mt-2 text-[12px] font-bold ${
                isActive ? "text-white/80" : "text-[#526183]"
              }`}
            >
              {formula.shortLabel}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function ParameterSlider({
  parameter,
  value,
  onChange,
}: {
  parameter: FormulaDefinition["parameters"][number];
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid grid-cols-[24px_1fr_78px] items-center gap-3">
      <span className="font-mono text-[14px] font-black text-[#071024]">
        {parameter.label}
      </span>
      <span className="min-w-0">
        <input
          type="range"
          min={parameter.min}
          max={parameter.max}
          step={parameter.step}
          value={value}
          onInput={(event) => onChange(Number(event.currentTarget.value))}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full accent-[#352cff]"
        />
        <span className="mt-1 flex justify-between font-mono text-[10px] font-bold text-[#667396]">
          <span>{formatCompact(parameter.min)}</span>
          <span>{formatCompact(parameter.max)}</span>
        </span>
      </span>
      <input
        aria-label={`${parameter.label} value`}
        type="number"
        min={parameter.min}
        max={parameter.max}
        step={parameter.step}
        value={value}
        onInput={(event) => onChange(Number(event.currentTarget.value))}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-w-0 rounded-[7px] border border-[#dbe4ff] bg-white px-2 py-1.5 text-center font-mono text-[13px] font-black text-[#071024] outline-none focus:border-[#1638ff] focus:ring-2 focus:ring-[#dfe4ff]"
      />
    </label>
  );
}

function GraphPanel({ analysis }: { analysis: AutogradAnalysis }) {
  const nodesById = new Map(analysis.graph.nodes.map((node) => [node.id, node]));
  const badgesByNode = new Map<string, AutogradAnalysis["graph"]["badges"]>();

  analysis.graph.badges.forEach((badge) => {
    const existing = badgesByNode.get(badge.nodeId) ?? [];
    existing.push(badge);
    badgesByNode.set(badge.nodeId, existing);
  });

  return (
    <svg
      viewBox="0 0 760 330"
      role="img"
      aria-label="Autograd computation graph with forward values and backward gradients"
      className="h-auto w-full"
    >
      <defs>
        <marker
          id="autograd-forward-arrow"
          markerHeight="8"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
        >
          <path d="M0 0 8 4 0 8Z" fill="#1638ff" />
        </marker>
        <marker
          id="autograd-backward-arrow"
          markerHeight="8"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
        >
          <path d="M0 0 8 4 0 8Z" fill="#ff1d37" />
        </marker>
      </defs>

      {analysis.graph.forwardEdges.map((edge) => (
        <GraphEdgeLine
          key={`${edge.kind}-${edge.from}-${edge.to}`}
          edge={edge}
          nodesById={nodesById}
        />
      ))}
      {analysis.graph.backwardEdges.map((edge) => (
        <GraphEdgeLine
          key={`${edge.kind}-${edge.from}-${edge.to}`}
          edge={edge}
          nodesById={nodesById}
        />
      ))}

      {analysis.graph.nodes.map((node) => (
        <GraphNodeView
          key={node.id}
          node={node}
          badges={badgesByNode.get(node.id) ?? []}
        />
      ))}

      <g transform="translate(18 302)">
        <line
          x1="0"
          y1="0"
          x2="34"
          y2="0"
          stroke="#1638ff"
          strokeWidth="3"
          markerEnd="url(#autograd-forward-arrow)"
        />
        <text x="48" y="4" className="fill-[#25365f] text-[12px] font-black">
          Forward activations
        </text>
        <line
          x1="214"
          y1="0"
          x2="248"
          y2="0"
          stroke="#ff1d37"
          strokeWidth="2.5"
          markerEnd="url(#autograd-backward-arrow)"
        />
        <text x="262" y="4" className="fill-[#25365f] text-[12px] font-black">
          Backward gradients
        </text>
      </g>
    </svg>
  );
}

function GraphEdgeLine({
  edge,
  nodesById,
}: {
  edge: GraphEdge;
  nodesById: Map<string, GraphNode>;
}) {
  const from = nodesById.get(edge.from);
  const to = nodesById.get(edge.to);

  if (!from || !to) {
    return null;
  }

  const isBackward = edge.kind === "backward";
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  const nodeRadius = isBackward ? 38 : 44;
  const offset = isBackward ? 18 : -10;
  const normalX = (-dy / distance) * offset;
  const normalY = (dx / distance) * offset;
  const startX = from.x + (dx / distance) * nodeRadius + normalX;
  const startY = from.y + (dy / distance) * nodeRadius + normalY;
  const endX = to.x - (dx / distance) * nodeRadius + normalX;
  const endY = to.y - (dy / distance) * nodeRadius + normalY;
  const labelX = (startX + endX) / 2 + normalX * 0.3;
  const labelY = (startY + endY) / 2 + normalY * 0.3 - (isBackward ? 8 : 6);

  return (
    <g>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={isBackward ? "#ff1d37" : "#1638ff"}
        strokeLinecap="round"
        strokeWidth={isBackward ? "2.2" : "2.8"}
        opacity={isBackward ? 0.72 : 0.95}
        markerEnd={
          isBackward
            ? "url(#autograd-backward-arrow)"
            : "url(#autograd-forward-arrow)"
        }
      />
      {!isBackward ? (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          className="fill-[#1638ff] text-[12px] font-black"
        >
          {edge.label}
        </text>
      ) : null}
    </g>
  );
}

function GraphNodeView({
  node,
  badges,
}: {
  node: GraphNode;
  badges: AutogradAnalysis["graph"]["badges"];
}) {
  const isOutput = node.tone === "output";
  const isConstant = node.tone === "constant";
  const stroke = isOutput ? "#20a95d" : isConstant ? "#8fa0c7" : "#6677a6";
  const labelFill = isOutput ? "#0b9f49" : "#1638ff";
  const badgeX = node.x < 140 ? node.x - 82 : node.x - 47;
  const badgeY = node.y < 120 ? node.y + 52 : node.y - 72;

  return (
    <g>
      <rect
        x={node.x - 47}
        y={node.y - 38}
        width="94"
        height="76"
        rx="12"
        fill="white"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <text
        x={node.x}
        y={node.y - 14}
        textAnchor="middle"
        className="fill-[#071024] text-[14px] font-black"
      >
        {node.label}
      </text>
      <text
        x={node.x}
        y={node.y + 7}
        textAnchor="middle"
        className="fill-[#25365f] text-[11px] font-bold"
      >
        {node.subLabel}
      </text>
      <text
        x={node.x}
        y={node.y + 28}
        textAnchor="middle"
        className={`${labelFill} text-[15px] font-black`}
      >
        {formatFixed(node.value)}
      </text>
      {badges.slice(0, 4).map((badge, index) => (
        <g key={`${badge.label}-${index}`} transform={`translate(${badgeX} ${badgeY + index * 31})`}>
          <rect
            width="86"
            height="25"
            rx="6"
            fill="#fff7f8"
            stroke="#ffc6ce"
          />
          <text
            x="43"
            y="10"
            textAnchor="middle"
            className="fill-[#ff1d37] text-[8px] font-black uppercase"
          >
            {badge.label}
          </text>
          <text
            x="43"
            y="21"
            textAnchor="middle"
            className="fill-[#ff1d37] text-[10px] font-black"
          >
            {badge.value}
          </text>
        </g>
      ))}
    </g>
  );
}

function MiniChart({ chart }: { chart: ChartLine }) {
  const width = 320;
  const height = 190;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 34;
  const xs = chart.samples.map((sample) => sample.x);
  const ys = chart.samples.map((sample) => sample.y).concat(chart.currentY);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const rawMinY = Math.min(...ys);
  const rawMaxY = Math.max(...ys);
  const yPadding = Math.max((rawMaxY - rawMinY) * 0.18, 0.8);
  const minY = rawMinY - yPadding;
  const maxY = rawMaxY + yPadding;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const xScale = (value: number) =>
    left + ((value - minX) / (maxX - minX)) * plotWidth;
  const yScale = (value: number) =>
    top + (1 - (value - minY) / (maxY - minY || 1)) * plotHeight;
  const path = chart.samples
    .map((sample, index) => {
      const command = index === 0 ? "M" : "L";

      return `${command}${xScale(sample.x).toFixed(2)} ${yScale(sample.y).toFixed(2)}`;
    })
    .join(" ");
  const currentX = xScale(chart.currentX);
  const currentY = yScale(chart.currentY);
  const ticks = [minY, (minY + maxY) / 2, maxY];

  return (
    <div className="min-w-0">
      <p className="font-mono text-[12px] font-black text-[#071024]">
        {chart.label}
      </p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${chart.label} chart`}
        className="mt-1 h-auto w-full"
      >
        <line x1={left} y1={top} x2={left} y2={height - bottom} stroke="#9aa9ce" />
        <line
          x1={left}
          y1={height - bottom}
          x2={width - right}
          y2={height - bottom}
          stroke="#9aa9ce"
        />
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              y1={yScale(tick)}
              x2={width - right}
              y2={yScale(tick)}
              stroke="#dfe6f6"
            />
            <text
              x={left - 7}
              y={yScale(tick) + 4}
              textAnchor="end"
              className="fill-[#526183] text-[10px] font-bold"
            >
              {formatCompact(tick)}
            </text>
          </g>
        ))}
        <path
          d={path}
          fill="none"
          stroke={chart.yLabel === "f" || chart.yLabel === "L" ? "#1638ff" : "#ff1d37"}
          strokeLinecap="round"
          strokeWidth="3"
        />
        <line
          x1={currentX}
          y1={top}
          x2={currentX}
          y2={height - bottom}
          stroke="#bdc8e5"
          strokeDasharray="4 4"
        />
        <circle
          cx={currentX}
          cy={currentY}
          r="5"
          fill={chart.yLabel === "f" || chart.yLabel === "L" ? "#1638ff" : "#ff1d37"}
          stroke="white"
          strokeWidth="2"
        />
        <text
          x={width - right}
          y={height - 8}
          textAnchor="end"
          className="fill-[#25365f] text-[11px] font-black"
        >
          {chart.xLabel}
        </text>
        <text
          x="12"
          y={top + 4}
          textAnchor="middle"
          className="fill-[#25365f] text-[11px] font-black"
          transform={`rotate(-90 12 ${top + 4})`}
        >
          {chart.yLabel}
        </text>
        <g transform={`translate(${Math.min(currentX + 12, width - 105)} ${Math.max(currentY - 36, top + 4)})`}>
          <rect width="94" height="42" rx="7" fill="white" stroke="#d4def6" />
          <text x="47" y="17" textAnchor="middle" className="fill-[#25365f] text-[10px] font-black">
            {chart.xLabel}={formatCompact(chart.currentX)}
          </text>
          <text x="47" y="32" textAnchor="middle" className="fill-[#071024] text-[10px] font-black">
            {chart.yLabel}={formatCompact(chart.currentY)}
          </text>
        </g>
      </svg>
    </div>
  );
}

export function AutogradGraphsPlayground() {
  const [formulaId, setFormulaId] = useState<FormulaId>(defaultFormulaId);
  const [values, setValues] = useState<Record<ParameterKey, number>>(() =>
    getDefaultValues(getFormulaDefinition(defaultFormulaId)),
  );
  const definition = getFormulaDefinition(formulaId);
  const analysis = analyzeAutograd(formulaId, values);

  function selectFormula(nextFormulaId: FormulaId) {
    const nextDefinition = getFormulaDefinition(nextFormulaId);
    setFormulaId(nextFormulaId);
    setValues(getDefaultValues(nextDefinition));
  }

  function updateValue(key: ParameterKey, nextValue: number) {
    setValues((current) => ({
      ...current,
      [key]: nextValue,
    }));
  }

  return (
    <main className="min-h-screen bg-[#f7faff] px-4 py-6 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">
        <header className="mb-5">
          <div>
            <h1 className="text-[44px] leading-none font-black tracking-[-0.02em] text-[#050814] sm:text-[56px]">
              Autograd Graphs
            </h1>
            <p className="mt-2 text-[18px] leading-7 font-bold text-[#2d4378]">
              See values flow forward through a computation graph and gradients
              flow backward.
            </p>
          </div>
        </header>

        <div className="grid gap-4">
          <Panel>
            <div className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1.35fr_0.8fr]">
              <div>
                <LessonTitle>1. Choose a formula</LessonTitle>
                <p className="mt-2 text-[14px] leading-6 font-bold text-[#25365f]">
                  Pick a function. The graph, gradients, and charts update
                  together.
                </p>
                <div className="mt-4">
                  <FormulaSelector
                    formulaId={formulaId}
                    onSelectFormula={selectFormula}
                  />
                </div>
              </div>

              <div className="rounded-[10px] border border-[#dbe4ff] bg-[#fbfcff] p-4">
                <LessonTitle>Current formula</LessonTitle>
                <div className="mt-4 rounded-[8px] border border-[#dbe4ff] bg-white px-4 py-4 font-mono text-[18px] font-black text-[#071024]">
                  {definition.expression}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {definition.parameters.map((parameter) => (
                    <ParameterSlider
                      key={parameter.key}
                      parameter={parameter}
                      value={values[parameter.key] ?? parameter.defaultValue}
                      onChange={(nextValue) =>
                        updateValue(parameter.key, nextValue)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[10px] border border-[#dbe4ff] bg-white p-4">
                <p className="text-[12px] font-black text-[#25365f]">
                  Function value
                </p>
                <p className="mt-2 font-mono text-[32px] font-black text-[#0b9f49]">
                  {formatFixed(analysis.output)}
                </p>
                <div className="mt-4 border-t border-[#dbe4ff] pt-4">
                  <p className="text-[12px] font-black text-[#6d789b] uppercase">
                    Active local derivative
                  </p>
                  <p className="mt-2 rounded-[7px] border border-[#ffd590] bg-[#fffaf0] px-3 py-2 font-mono text-[12px] font-black text-[#b36a00]">
                    {analysis.activeLocalDerivative}
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <LessonTitle>2. Trace the graph</LessonTitle>
                  <p className="mt-2 text-[14px] leading-6 font-bold text-[#25365f]">
                    Blue arrows carry forward values. Red return arrows carry
                    backward gradient messages.
                  </p>
                </div>
                <div className="rounded-[8px] border border-[#ffd590] bg-[#fffaf0] px-3 py-2 font-mono text-[12px] font-black text-[#b36a00]">
                  {analysis.activeLocalDerivative}
                </div>
              </div>
              <div className="mt-2 overflow-x-auto">
                <div className="min-w-[860px]">
                  <GraphPanel analysis={analysis} />
                </div>
              </div>
              <div className="grid gap-3 border-t border-[#dbe4ff] pt-4 sm:grid-cols-3">
                <ValueCard
                  label="output grad"
                  value="1.000"
                  tone="red"
                />
                {definition.parameters.map((parameter) => (
                  <ValueCard
                    key={parameter.key}
                    label={`d/d${parameter.key}`}
                    value={formatFixed(analysis.gradients[parameter.key] ?? 0)}
                    tone="red"
                  />
                ))}
              </div>
            </div>
          </Panel>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_2.4fr]">
            <Panel>
              <div className="p-5">
                <LessonTitle>3. Change values</LessonTitle>
                <p className="mt-2 text-[14px] leading-6 font-bold text-[#25365f]">
                  Move parameters and watch the forward value plus every
                  backward gradient update.
                </p>
                <div className="mt-5 grid gap-4">
                  {definition.parameters.map((parameter) => (
                    <ParameterSlider
                      key={parameter.key}
                      parameter={parameter}
                      value={values[parameter.key] ?? parameter.defaultValue}
                      onChange={(nextValue) =>
                        updateValue(parameter.key, nextValue)
                      }
                    />
                  ))}
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                  <ValueCard
                    label={analysis.definition.id === "squared-error" ? "loss" : "f"}
                    value={formatFixed(analysis.output)}
                    tone="green"
                  />
                  {definition.parameters.map((parameter) => (
                    <ValueCard
                      key={parameter.key}
                      label={`d/d${parameter.key}`}
                      value={formatFixed(analysis.gradients[parameter.key] ?? 0)}
                      tone="red"
                    />
                  ))}
                </div>
                <div className="mt-4 rounded-[8px] border border-[#dbe4ff] bg-[#fbfcff] p-3">
                  <p className="text-[12px] font-black text-[#071024]">
                    One-step gradient descent (lr = {learningRate.toFixed(1)})
                  </p>
                  <div className="mt-2 grid gap-1">
                    {analysis.updatePreview.map((row) => (
                      <p
                        key={row.key}
                        className="font-mono text-[12px] font-bold text-[#25365f]"
                      >
                        {row.key}_new = {formatFixed(row.before)} -{" "}
                        {learningRate.toFixed(1)} * {formatFixed(row.gradient)} ={" "}
                        <span className="text-[#1638ff]">
                          {formatFixed(row.after)}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="p-5">
                <LessonTitle>4. See the function and derivatives</LessonTitle>
                <p className="mt-2 text-[14px] leading-6 font-bold text-[#25365f]">
                  The function curve and each parameter derivative come from the
                  same graph.
                </p>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {analysis.charts.map((chart) => (
                    <MiniChart key={chart.label} chart={chart} />
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          <Panel>
            <div className="grid gap-4 p-5 xl:grid-cols-[1fr_1fr_0.38fr]">
              <div className="xl:col-span-2">
                <LessonTitle>5. Connect the chain rule</LessonTitle>
                <p className="mt-2 text-[14px] leading-6 font-bold text-[#25365f]">
                  Backward messages multiply by local derivatives. If a
                  parameter reaches the output through two paths, the paths add.
                </p>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {analysis.chainRule.map((section) => (
                    <div
                      key={section.title}
                      className="rounded-[10px] border border-[#dbe4ff] bg-[#fbfcff] p-4"
                    >
                      <p className="font-black text-[#1638ff]">
                        {section.title}
                      </p>
                      <div className="mt-3 grid gap-2">
                        {section.rows.map((row) => (
                          <div
                            key={row}
                            className="rounded-[7px] border border-[#dbe4ff] bg-white px-3 py-2 font-mono text-[12px] font-black text-[#25365f]"
                          >
                            {row}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-[8px] border border-[#bfe8cf] bg-[#f5fff8] px-3 py-3 text-center font-mono text-[15px] font-black text-[#0b9f49]">
                        {section.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[10px] border border-[#dbe4ff] bg-[#fbfcff] p-4">
                <p className="font-black text-[#1638ff] uppercase">Takeaway</p>
                <p className="mt-3 text-[14px] leading-6 font-bold text-[#25365f]">
                  Forward pass computes values using current inputs. Backward
                  pass sends gradients in the opposite direction, multiplying
                  local derivatives and cached activations along the way.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
