"use client";

import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import {
  analyzeProduct,
  formatShape,
  formatTerm,
  getDotProductTerms,
  type CellPosition,
  type Matrix,
} from "./matrix-multiplication-engine";
import {
  incompatibleExample,
  matrixShapePresets,
  type MatrixShapePreset,
} from "./scenario";

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
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

function LessonTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[18px] leading-none font-black text-[#0648d9] uppercase">
      {children}
    </h2>
  );
}

function InfoIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v7" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.4 2.5 2.5L16.5 9" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function formatCellName(cell: CellPosition) {
  return `C[${cell.row + 1},${cell.col + 1}]`;
}

function formatEquationForCell({
  left,
  right,
  cell,
}: {
  left: Matrix;
  right: Matrix;
  cell: CellPosition;
}) {
  const terms = getDotProductTerms({ left, right, cell });
  const total = terms.at(-1)?.runningTotal ?? 0;

  return `${formatCellName(cell)}: ${terms
    .map((term) => formatTerm(term.left, term.right))
    .join(" + ")} = ${total}`;
}

function ShapeSummary({
  analysis,
}: {
  analysis: ReturnType<typeof analyzeProduct>;
}) {
  const leftInner = analysis.leftShape[1];
  const rightInner = analysis.rightShape[0];

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#d8e0f3] bg-[#fbfcff]">
      <div className="grid divide-y divide-[#d8e0f3] text-center text-[#071024] sm:grid-cols-[1fr_auto_1fr_1.15fr_1fr] sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3">
          <p className="text-[13px] font-bold text-[#1b2c5d]">A shape</p>
          <p className="mt-1 font-mono text-[28px] font-black">
            {formatShape(analysis.leftShape)}
          </p>
          <p className="font-serif text-[14px] text-[#223869]">(m x n)</p>
        </div>
        <div className="hidden items-center px-3 font-mono text-[26px] sm:flex">
          x
        </div>
        <div className="px-4 py-3">
          <p className="text-[13px] font-bold text-[#1b2c5d]">B shape</p>
          <p className="mt-1 font-mono text-[28px] font-black">
            {formatShape(analysis.rightShape)}
          </p>
          <p className="font-serif text-[14px] text-[#223869]">(n x p)</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[13px] font-bold text-[#1b2c5d]">
            Shared inner dimension
          </p>
          <p className="mt-1 font-mono text-[26px] font-black text-[#0f8b42]">
            {leftInner} = {rightInner}
          </p>
          <p className="font-serif text-[14px] text-[#223869]">(n)</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[13px] font-bold text-[#1b2c5d]">
            Output C shape
          </p>
          <p className="mt-1 font-mono text-[28px] font-black">
            {analysis.outputShape ? formatShape(analysis.outputShape) : "-"}
          </p>
          <p className="font-serif text-[14px] text-[#223869]">(m x p)</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-[#d8e0f3] px-4 py-3 text-[15px] font-semibold text-[#087137]">
        <CheckIcon />
        compatible: {leftInner} multiply-adds per output cell
      </div>
    </div>
  );
}

function ShapeSelector({
  activePreset,
  onSelectPreset,
}: {
  activePreset: MatrixShapePreset;
  onSelectPreset: (preset: MatrixShapePreset) => void;
}) {
  const analysis = analyzeProduct(activePreset.left, activePreset.right);

  return (
    <Panel className="p-5 sm:p-6">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.5fr)_minmax(220px,0.55fr)] 2xl:items-center">
        <div className="min-w-0">
          <LessonTitle>1. Set The Shapes</LessonTitle>
          <p className="mt-4 text-[15px] leading-[1.45] text-[#16264e]">
            Choose compatible shapes:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
            {matrixShapePresets.map((preset) => {
              const isSelected = preset.id === activePreset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`min-h-12 rounded-[9px] border px-4 text-center font-mono text-[15px] font-black transition ${
                    isSelected
                      ? "border-[#075ee7] bg-[#075ee7] text-white shadow-[0_12px_22px_rgba(7,94,231,0.18)]"
                      : "border-[#d8e0f3] bg-white text-[#071024] hover:border-[#aebdea] hover:bg-[#f8fbff]"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <ShapeSummary analysis={analysis} />

        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[#16264e]">
            Try an incompatible shape:
          </p>
          <div className="mt-3 flex min-h-12 items-center justify-center gap-3 rounded-[9px] border border-[#ffb2a8] bg-[#fffafa] px-4 font-mono text-[16px] font-black text-[#c11d13]">
            {formatShape(incompatibleExample.leftShape)} x{" "}
            {formatShape(incompatibleExample.rightShape)}
            <LockIcon />
          </div>
          <p className="mt-3 text-[14px] font-semibold text-[#d42117]">
            blocked: inner sizes {incompatibleExample.leftShape[1]} and{" "}
            {incompatibleExample.rightShape[0]} differ
          </p>
        </div>
      </div>
    </Panel>
  );
}

function MatrixGrid({
  label,
  matrix,
  role,
  selectedCell,
  selectedRow,
  selectedCol,
  onSelectCell,
}: {
  label: string;
  matrix: Matrix;
  role: "left" | "right" | "product";
  selectedCell?: CellPosition;
  selectedRow?: number;
  selectedCol?: number;
  onSelectCell?: (cell: CellPosition) => void;
}) {
  const columns = matrix[0]?.length ?? 0;
  const columnLabels = Array.from({ length: columns }, (_, index) => index);

  return (
    <div className="min-w-0">
      <p className="text-center text-[15px] font-black text-[#071024]">
        {label}
      </p>
      <div
        className="mt-3 grid items-center gap-x-1 gap-y-1"
        style={
          {
            gridTemplateColumns: `34px repeat(${columns}, minmax(48px, 1fr))`,
          } as CSSProperties
        }
      >
        <div />
        {columnLabels.map((columnIndex) => (
          <div
            key={columnIndex}
            className={`text-center font-serif text-[13px] italic ${
              role === "right" && selectedCol === columnIndex
                ? "text-[#f59e0b]"
                : "text-[#172b5e]"
            }`}
          >
            {role === "right" || role === "product"
              ? `j = ${columnIndex + 1}`
              : `k = ${columnIndex + 1}`}
          </div>
        ))}
        {matrix.map((row, rowIndex) => (
          row.map((value, columnIndex) => {
            const isSelected =
              selectedCell?.row === rowIndex && selectedCell.col === columnIndex;
            const highlightsSelectedRow =
              role === "left" && selectedRow === rowIndex;
            const highlightsSelectedCol =
              role === "right" && selectedCol === columnIndex;
            const rowLabel =
              columnIndex === 0 ? (
                <div
                  className={`pr-2 text-right font-serif text-[14px] italic ${
                    (role === "left" || role === "product") &&
                    selectedRow === rowIndex
                      ? "font-bold text-[#075ee7]"
                      : "text-[#172b5e]"
                  }`}
                >
                  {role === "left" || role === "product"
                    ? `i = ${rowIndex + 1}`
                    : `k = ${rowIndex + 1}`}
                </div>
              ) : null;
            const cellClassName = [
              "grid min-h-14 place-items-center border border-[#bdc9df] px-3 font-mono text-[22px] font-black transition",
              highlightsSelectedRow
                ? "border-[#4f8cf7] bg-[#eaf2ff] text-[#071024]"
                : "",
              highlightsSelectedCol
                ? "border-[#f3aa34] bg-[#fff5df] text-[#071024]"
                : "",
              isSelected
                ? "border-[#069247] bg-[#e9f9ef] text-[#087137] ring-2 ring-[#069247]"
                : "",
              role === "product" && !isSelected
                ? value < 0
                  ? "bg-[#fff0ed] text-[#071024]"
                  : value > 0
                    ? "bg-[#effbf3] text-[#071024]"
                    : "bg-white text-[#071024]"
                : highlightsSelectedRow || highlightsSelectedCol || isSelected
                  ? ""
                  : "bg-white",
            ].join(" ");
            const contents = onSelectCell ? (
              <button
                type="button"
                onClick={() => onSelectCell({ row: rowIndex, col: columnIndex })}
                className={`${cellClassName} w-full hover:border-[#069247] focus:outline-none focus:ring-4 focus:ring-green-100`}
                aria-label={`Select ${formatCellName({
                  row: rowIndex,
                  col: columnIndex,
                })}`}
              >
                {value}
              </button>
            ) : (
              <div className={cellClassName}>{value}</div>
            );

            return (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className="contents"
              >
                {rowLabel}
                {contents}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}

function MatrixSelectionPanel({
  preset,
  product,
  selectedCell,
  onSelectCell,
}: {
  preset: MatrixShapePreset;
  product: Matrix;
  selectedCell: CellPosition;
  onSelectCell: (cell: CellPosition) => void;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>2. Pick One Output Cell</LessonTitle>
      <p className="mt-4 text-[15px] leading-[1.45] text-[#16264e]">
        Select a cell in C. The matching row of A and column of B light up.
      </p>

      <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(240px,0.95fr)_auto_minmax(220px,0.8fr)_auto_minmax(220px,0.85fr)] lg:items-center">
        <MatrixGrid
          label={`Matrix A (${formatShape(analyzeProduct(preset.left, preset.right).leftShape)})`}
          matrix={preset.left}
          role="left"
          selectedRow={selectedCell.row}
        />
        <div className="hidden text-center font-mono text-[28px] font-black text-[#071024] lg:block">
          x
        </div>
        <MatrixGrid
          label={`Matrix B (${formatShape(analyzeProduct(preset.left, preset.right).rightShape)})`}
          matrix={preset.right}
          role="right"
          selectedCol={selectedCell.col}
        />
        <div className="hidden text-center font-mono text-[28px] font-black text-[#071024] lg:block">
          =
        </div>
        <div className="min-w-0">
          <MatrixGrid
            label={`Matrix C = A x B (${product.length}x${product[0]?.length ?? 0})`}
            matrix={product}
            role="product"
            selectedCell={selectedCell}
            selectedRow={selectedCell.row}
            selectedCol={selectedCell.col}
            onSelectCell={onSelectCell}
          />
          <div className="mt-3 rounded-[9px] border border-[#bce4ca] bg-[#f1fff6] px-3 py-2 text-[13px] leading-[1.35] font-semibold text-[#075f32]">
            Selected cell:{" "}
            <span className="font-mono text-[#071024]">
              {formatCellName(selectedCell)}
            </span>{" "}
            = row {selectedCell.row + 1} dot column {selectedCell.col + 1}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-[8px] border border-[#d8e0f3] bg-[#fbfcff] px-4 py-3 text-[15px] font-semibold text-[#142755]">
        <InfoIcon className="size-5 shrink-0 text-[#075ee7]" />
        {formatCellName(selectedCell)} = row {selectedCell.row + 1} of A dot
        column {selectedCell.col + 1} of B
      </div>
    </Panel>
  );
}

function DotProductPanel({
  cell,
  terms,
  activeStep,
  onSelectStep,
}: {
  cell: CellPosition;
  terms: ReturnType<typeof getDotProductTerms>;
  activeStep: number;
  onSelectStep: (step: number) => void;
}) {
  const finalTotal = terms.at(-1)?.runningTotal ?? 0;
  const formula = `${formatCellName(cell)} = ${terms
    .map((term) => formatTerm(term.left, term.right))
    .join(" + ")} = ${finalTotal}`;

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>3. Watch The Dot Product</LessonTitle>
      <p className="mt-4 text-[15px] leading-[1.45] text-[#16264e]">
        Compute {formatCellName(cell)} step by step.
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        {terms.map((term) => {
          const isActive = term.index === activeStep;

          return (
            <button
              key={term.index}
              type="button"
              onClick={() => onSelectStep(term.index)}
              className="group flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span
                className={`grid size-9 place-items-center rounded-full border font-mono text-[15px] font-black transition ${
                  isActive
                    ? "border-[#075ee7] bg-[#075ee7] text-white"
                    : "border-[#aeb8cc] bg-white text-[#172b5e] group-hover:border-[#075ee7]"
                }`}
              >
                {term.index + 1}
              </span>
              <span
                className={`font-serif text-[13px] italic ${
                  isActive ? "font-bold text-[#075ee7]" : "text-[#172b5e]"
                }`}
              >
                k = {term.index + 1}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-[15px] text-[#16264e]">
        Multiply A[{cell.row + 1},k] by B[k,{cell.col + 1}] and add to the
        running sum.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {terms.map((term) => {
          const isActive = term.index === activeStep;

          return (
            <button
              key={term.index}
              type="button"
              onClick={() => onSelectStep(term.index)}
              className={`rounded-[8px] border px-3 py-3 text-center transition ${
                isActive
                  ? "border-[#f59e0b] bg-[#fff8ed] text-[#071024] shadow-[0_10px_22px_rgba(245,158,11,0.12)]"
                  : "border-[#d8e0f3] bg-white text-[#16264e] hover:border-[#b9c4de]"
              }`}
            >
              <span className="block font-mono text-[17px] font-black">
                {formatTerm(term.left, term.right)} = {term.product}
              </span>
              <span
                className={`mt-1 block font-serif text-[13px] italic ${
                  isActive ? "text-[#d97706]" : "text-[#52658e]"
                }`}
              >
                k = {term.index + 1}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-[15px] font-semibold text-[#16264e]">
          Running sum:
        </span>
        {terms.map((term, index) => (
          <div key={term.index} className="flex items-center gap-3">
            {index > 0 ? (
              <span className="font-mono text-[18px] text-[#172b5e]">-&gt;</span>
            ) : null}
            <span
              className={`min-w-16 rounded-[8px] border px-4 py-2 text-center font-mono text-[18px] font-black ${
                term.index === activeStep
                  ? "border-[#f59e0b] bg-[#fff8ed] text-[#d97706]"
                  : index === terms.length - 1
                    ? "border-[#b8e7c8] bg-[#f0fff5] text-[#087137]"
                    : "border-[#d8e0f3] bg-white text-[#071024]"
              }`}
            >
              {term.runningTotal}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[8px] border border-[#8bd9a8] bg-[#f4fff8] px-4 py-3 text-center font-mono text-[16px] font-black text-[#071024] sm:text-[18px]">
        {formula}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-[8px] border border-[#d8e0f3] bg-[#fbfcff] px-4 py-2 text-[14px] font-semibold text-[#075ee7]">
        <InfoIcon className="size-5 shrink-0" />
        k walks across the row and down the column together.
      </div>
    </Panel>
  );
}

function FullProductPanel({
  left,
  right,
  product,
  selectedCell,
  onSelectCell,
}: {
  left: Matrix;
  right: Matrix;
  product: Matrix;
  selectedCell: CellPosition;
  onSelectCell: (cell: CellPosition) => void;
}) {
  const cells = product.flatMap((row, rowIndex) =>
    row.map((_, colIndex) => ({ row: rowIndex, col: colIndex })),
  );

  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>4. See The Full Product</LessonTitle>
      <p className="mt-4 text-[15px] leading-[1.45] text-[#16264e]">
        Each cell is a row-column dot product.
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(190px,0.6fr)_minmax(0,1fr)] lg:items-start">
        <MatrixGrid
          label={`C = A x B (${product.length}x${product[0]?.length ?? 0})`}
          matrix={product}
          role="product"
          selectedCell={selectedCell}
          selectedRow={selectedCell.row}
          selectedCol={selectedCell.col}
          onSelectCell={onSelectCell}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {cells.map((cell) => {
            const isSelected =
              selectedCell.row === cell.row && selectedCell.col === cell.col;

            return (
              <button
                key={`${cell.row}-${cell.col}`}
                type="button"
                onClick={() => onSelectCell(cell)}
                className={`min-w-0 rounded-[8px] border px-3 py-3 text-left font-mono text-[13px] font-bold leading-[1.35] transition ${
                  isSelected
                    ? "border-[#069247] bg-[#f1fff6] text-[#071024]"
                    : product[cell.row][cell.col] < 0
                      ? "border-[#ffc3bc] bg-[#fffafa] text-[#071024] hover:border-[#f5988e]"
                      : "border-[#d8e0f3] bg-white text-[#071024] hover:border-[#b9c4de]"
                }`}
              >
                {formatEquationForCell({ left, right, cell })}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-[8px] border border-[#d8e0f3] bg-[#fbfcff] px-4 py-3 text-[15px] font-semibold text-[#142755]">
        <InfoIcon className="size-5 shrink-0 text-[#075ee7]" />
        {product.length * (product[0]?.length ?? 0)} output cells means{" "}
        {product.length * (product[0]?.length ?? 0)} row-column dot products.
      </div>
    </Panel>
  );
}

function RulePanel() {
  return (
    <Panel className="p-5 sm:p-6">
      <LessonTitle>5. The Rule</LessonTitle>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:items-center">
        <div>
          <p className="text-[15px] font-semibold text-[#16264e]">
            Matrix multiplication rule:
          </p>
          <div className="mt-3 rounded-[9px] border border-[#d8e0f3] bg-[#fbfcff] px-4 py-5 text-center font-serif text-[28px] text-[#071024] sm:text-[34px]">
            (AB)<sub className="text-[14px]">ij</sub> ={" "}
            <span className="inline-flex flex-col items-center px-1 align-middle leading-none">
              <sup className="text-[12px]">n</sup>
              <span className="text-[34px] leading-[0.8]">Σ</span>
              <sub className="text-[12px]">k=1</sub>
            </span>{" "}
            A
            <sub className="text-[14px]">ik</sub> B
            <sub className="text-[14px]">kj</sub>
          </div>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[#16264e]">
            Dimension rule:
          </p>
          <div className="mt-3 rounded-[9px] border border-[#d8e0f3] bg-white px-4 py-5">
            <div className="flex flex-wrap items-center justify-center gap-3 font-serif text-[25px] text-[#071024] sm:text-[30px]">
              <span className="rounded-[8px] border border-[#d8e0f3] px-4 py-2">
                (m x <span className="text-[#087137]">n</span>)
              </span>
              <span className="font-mono text-[20px]">x</span>
              <span className="rounded-[8px] border border-[#d8e0f3] px-4 py-2">
                (<span className="text-[#087137]">n</span> x p)
              </span>
              <span className="font-mono text-[20px]">-&gt;</span>
              <span className="rounded-[8px] border border-[#d8e0f3] px-4 py-2">
                (m x p)
              </span>
            </div>
            <div className="mx-auto mt-4 w-fit rounded-[8px] border border-[#bfe9cc] bg-[#f3fff7] px-4 py-2 text-center text-[14px] font-semibold text-[#087137]">
              shared n: number of terms
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-[9px] border border-[#a8dfbb] bg-[#f2fff7] px-4 py-3 text-[15px] font-semibold text-[#087137]">
        <CheckIcon />
        Rows choose i. Columns choose j. The shared dimension tells how many
        products get added.
      </div>
    </Panel>
  );
}

export function MatrixMultiplicationPlayground() {
  const [activePresetId, setActivePresetId] = useState(matrixShapePresets[0].id);
  const [selectedCell, setSelectedCell] = useState<CellPosition>(
    matrixShapePresets[0].defaultCell,
  );
  const [activeStep, setActiveStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);

  const activePreset =
    matrixShapePresets.find((preset) => preset.id === activePresetId) ??
    matrixShapePresets[0];

  const analysis = useMemo(
    () => analyzeProduct(activePreset.left, activePreset.right),
    [activePreset],
  );
  const product = analysis.product ?? [];
  const terms = useMemo(
    () =>
      getDotProductTerms({
        left: activePreset.left,
        right: activePreset.right,
        cell: selectedCell,
      }),
    [activePreset, selectedCell],
  );
  const clampedStep = Math.min(activeStep, Math.max(terms.length - 1, 0));

  function handlePresetSelect(preset: MatrixShapePreset) {
    setActivePresetId(preset.id);
    setSelectedCell(preset.defaultCell);
    setActiveStep(Math.min(1, Math.max(preset.left[0].length - 1, 0)));
  }

  function handleCellSelect(cell: CellPosition) {
    setSelectedCell(cell);
    setActiveStep(Math.min(activeStep, Math.max(terms.length - 1, 0)));
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] px-4 py-5 text-[#071024] sm:px-6 lg:px-8 2xl:pr-56">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[44px] leading-[0.95] font-black tracking-[-0.05em] text-[#050912] sm:text-[56px] lg:text-[64px]">
              Matrix Multiplication Lab
            </h1>
            <p className="mt-3 max-w-3xl text-[18px] leading-[1.35] font-semibold text-[#17366f] sm:text-[20px]">
              Every cell in the product comes from a row of A dotted with a
              column of B.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp((value) => !value)}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-[9px] border border-[#bfd0ff] bg-white px-6 text-[15px] font-black text-[#0a3df0] shadow-[0_8px_24px_rgba(26,38,80,0.05)] transition hover:border-[#7898ff] focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <InfoIcon />
            What is Matmul?
          </button>
        </header>

        {showHelp ? (
          <div className="mt-5 rounded-[10px] border border-[#d8e0f3] bg-white px-5 py-4 text-[15px] leading-[1.55] text-[#16264e] shadow-[0_18px_42px_rgba(26,38,80,0.05)]">
            Matmul is matrix multiplication. It combines rows from the left
            matrix with columns from the right matrix. The inner sizes must
            match because each output cell needs paired values to multiply and
            add.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <ShapeSelector
            activePreset={activePreset}
            onSelectPreset={handlePresetSelect}
          />
          {analysis.product ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.9fr)]">
              <MatrixSelectionPanel
                preset={activePreset}
                product={product}
                selectedCell={selectedCell}
                onSelectCell={handleCellSelect}
              />
              <DotProductPanel
                cell={selectedCell}
                terms={terms}
                activeStep={clampedStep}
                onSelectStep={setActiveStep}
              />
            </div>
          ) : null}
          {analysis.product ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
              <FullProductPanel
                left={activePreset.left}
                right={activePreset.right}
                product={product}
                selectedCell={selectedCell}
                onSelectCell={handleCellSelect}
              />
              <RulePanel />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
