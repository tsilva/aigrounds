"use client";

import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import {
  analyzeConvolution,
  clampIndex,
  makeFormulaTerms,
  type ConvolutionState,
  type KernelOption,
  type Matrix,
} from "./convolution-filter-engine";
import { baseImage, kernelOptions } from "./scenario";

const kernelSize = 3;

function formatValue(value: number) {
  if (Math.abs(value - Math.round(value)) < 0.0001) {
    return String(Math.round(value));
  }

  return value.toFixed(2);
}

function getKernelDisplayValue(value: number) {
  if (Math.abs(value - 1 / 9) < 0.0001) {
    return "1/9";
  }

  return formatValue(value);
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-[12px] border border-[#c7d5fb] bg-white shadow-[0_18px_42px_rgba(26,38,80,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  children,
  number,
}: {
  children: ReactNode;
  number: number;
}) {
  return (
    <div className="flex items-center gap-3 text-[#1d25ff]">
      <span className="grid size-8 place-items-center rounded-[8px] bg-[#1d25ff] text-[17px] font-black text-white">
        {number}
      </span>
      <h2 className="text-[20px] leading-none font-black uppercase">
        {children}
      </h2>
    </div>
  );
}

function InfoIcon() {
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
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function ResetIcon() {
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
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
    </svg>
  );
}

function MatrixGrid({
  matrix,
  cellSize = 42,
  className = "",
  getCellClassName,
  getDisplayValue = formatValue,
  onCellEnter,
  onCellPointerDown,
}: {
  matrix: Matrix;
  cellSize?: number;
  className?: string;
  getCellClassName?: (row: number, col: number, value: number) => string;
  getDisplayValue?: (value: number) => string;
  onCellEnter?: (row: number, col: number) => void;
  onCellPointerDown?: (row: number, col: number) => void;
}) {
  const style = {
    "--cell-size": `${cellSize}px`,
    gridTemplateColumns: `repeat(${matrix[0]?.length ?? 0}, var(--cell-size))`,
  } as CSSProperties;

  return (
    <div
      className={`grid w-max overflow-hidden rounded-[8px] border border-[#c8d4ec] bg-white ${className}`}
      style={style}
    >
      {matrix.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const content = (
            <span className="relative z-10">{getDisplayValue(value)}</span>
          );
          const cellClassName = getCellClassName?.(
            rowIndex,
            colIndex,
            value,
          );
          const edgeClassName = [
            colIndex === row.length - 1 ? "border-r-0" : "",
            rowIndex === matrix.length - 1 ? "border-b-0" : "",
          ].join(" ");
          const classNames = `grid place-items-center border-r border-b border-[#c8d4ec] font-mono text-[16px] font-bold tabular-nums ${edgeClassName} ${cellClassName ?? ""}`;

          if (onCellPointerDown || onCellEnter) {
            return (
              <button
                type="button"
                key={`${rowIndex}-${colIndex}`}
                className={`${classNames} h-[var(--cell-size)] w-[var(--cell-size)] text-[#071024] focus:outline-none focus:ring-2 focus:ring-[#1d25ff]`}
                onPointerDown={() => onCellPointerDown?.(rowIndex, colIndex)}
                onPointerEnter={() => onCellEnter?.(rowIndex, colIndex)}
              >
                {content}
              </button>
            );
          }

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${classNames} h-[var(--cell-size)] w-[var(--cell-size)] text-[#071024]`}
            >
              {content}
            </div>
          );
        }),
      )}
    </div>
  );
}

function KernelGrid({ kernel }: { kernel: Matrix }) {
  return (
    <MatrixGrid
      matrix={kernel}
      cellSize={58}
      getDisplayValue={getKernelDisplayValue}
      getCellClassName={(_, col, value) => {
        if (value > 0 && col === 2) {
          return "text-[#f01818]";
        }

        if (value < 0) {
          return "text-[#001fe5]";
        }

        return "";
      }}
    />
  );
}

function SegmentedButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-[8px] border px-5 text-[15px] font-black transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
        active
          ? "border-[#1d25ff] bg-[#1d25ff] text-white shadow-[0_10px_22px_rgba(29,37,255,0.18)]"
          : "border-[#cbd7f4] bg-white text-[#111a44] hover:border-[#8097ff]"
      }`}
    >
      {children}
    </button>
  );
}

function StepperButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-[8px] border border-[#cbd7f4] bg-white text-[18px] font-black text-[#1d25ff] transition hover:border-[#1d25ff] focus:outline-none focus:ring-4 focus:ring-blue-100"
    >
      {children}
    </button>
  );
}

function isInCurrentPatch(
  row: number,
  col: number,
  topLeftRow: number,
  topLeftCol: number,
) {
  return (
    row >= topLeftRow &&
    row < topLeftRow + kernelSize &&
    col >= topLeftCol &&
    col < topLeftCol + kernelSize
  );
}

function FilterPanel({
  activeFilter,
  onSelectFilter,
}: {
  activeFilter: KernelOption;
  onSelectFilter: (filterId: KernelOption["id"]) => void;
}) {
  return (
    <Panel className="p-5">
      <SectionTitle number={1}>Pick the filter</SectionTitle>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(220px,0.72fr)] lg:items-center">
        <div className="min-w-0">
          <p className="text-[15px] leading-6 text-[#172452]">
            Choose a 3x3 kernel. Red weights add signal; blue weights subtract
            it.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {kernelOptions.map((filter) => (
              <SegmentedButton
                key={filter.id}
                active={filter.id === activeFilter.id}
                onClick={() => onSelectFilter(filter.id)}
              >
                {filter.shortLabel}
              </SegmentedButton>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[12px] font-black text-[#00166d] uppercase">
            Selected kernel K
          </p>
          <KernelGrid kernel={activeFilter.kernel} />
        </div>
        <div className="rounded-[10px] border border-[#d8e2f6] bg-[#f9fbff] p-4 text-[15px] leading-7 text-[#101b47]">
          {activeFilter.description}
        </div>
      </div>
    </Panel>
  );
}

function SlidePanel({
  analysis,
  image,
  isDragging,
  onCellEnter,
  onCellPointerDown,
  onSetDragging,
  onSetPadding,
  onSetPosition,
  onSetStride,
  padding,
  stride,
}: {
  analysis: ReturnType<typeof analyzeConvolution>;
  image: Matrix;
  isDragging: boolean;
  onCellEnter: (row: number, col: number) => void;
  onCellPointerDown: (row: number, col: number) => void;
  onSetDragging: (isDragging: boolean) => void;
  onSetPadding: (padding: number) => void;
  onSetPosition: (row: number, col: number) => void;
  onSetStride: (stride: number) => void;
  padding: number;
  stride: number;
}) {
  return (
    <Panel className="p-5">
      <SectionTitle number={2}>Slide over the image</SectionTitle>
      <p className="mt-4 text-[15px] leading-6 text-[#172452]">
        Drag the padded grid or use the arrows. Stride and padding change which
        windows get sampled.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[14px] font-black text-[#111a44]">
          Stride
          <div className="grid grid-cols-2 overflow-hidden rounded-[8px] border border-[#cbd7f4]">
            {[1, 2].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onSetStride(value)}
                className={`h-10 w-11 font-black ${
                  stride === value ? "bg-[#1d25ff] text-white" : "bg-white"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[14px] font-black text-[#111a44]">
          Padding
          <div className="grid grid-cols-2 overflow-hidden rounded-[8px] border border-[#cbd7f4]">
            {[0, 1].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onSetPadding(value)}
                className={`h-10 w-11 font-black ${
                  padding === value ? "bg-[#1d25ff] text-white" : "bg-white"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-[8px] border border-[#cbd7f4] bg-[#f9fbff] px-4 py-2 font-mono text-[16px] font-black text-[#001fe5]">
          output {analysis.outputSize} x {analysis.outputSize}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[auto_auto_minmax(130px,1fr)] xl:items-start">
        <div>
          <p className="mb-2 text-[12px] font-black text-[#00166d] uppercase">
            Input image (5x5)
          </p>
          <MatrixGrid matrix={image} cellSize={44} />
        </div>
        <div
          onPointerLeave={() => onSetDragging(false)}
          onPointerUp={() => onSetDragging(false)}
        >
          <p className="mb-2 text-[12px] font-black text-[#00166d] uppercase">
            Padded image ({analysis.paddedImage.length}x
            {analysis.paddedImage.length})
          </p>
          <MatrixGrid
            matrix={analysis.paddedImage}
            cellSize={38}
            getCellClassName={(row, col, value) => {
              const classes = [];

              if (value === 0 && padding > 0) {
                classes.push("bg-[#fff4ce]");
              }

              if (
                isInCurrentPatch(
                  row,
                  col,
                  analysis.topLeftRow,
                  analysis.topLeftCol,
                )
              ) {
                classes.push("ring-2 ring-inset ring-[#1d25ff]");
              }

              return classes.join(" ");
            }}
            onCellPointerDown={(row, col) => {
              onSetDragging(true);
              onCellPointerDown(row, col);
            }}
            onCellEnter={(row, col) => {
              if (isDragging) {
                onCellEnter(row, col);
              }
            }}
          />
        </div>
        <div className="grid gap-4">
          <div>
            <p className="mb-2 text-[12px] font-black text-[#00166d] uppercase">
              Current cell
            </p>
            <div className="w-max rounded-[8px] border border-[#cbd7f4] bg-[#f9fbff] px-4 py-2 font-mono text-[16px] font-black text-[#071024]">
              y[{analysis.topLeftRow / stride},{analysis.topLeftCol / stride}]
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StepperButton
              label="Move window left"
              onClick={() =>
                onSetPosition(
                  analysis.topLeftRow / stride,
                  analysis.topLeftCol / stride - 1,
                )
              }
            >
              ←
            </StepperButton>
            <StepperButton
              label="Move window up"
              onClick={() =>
                onSetPosition(
                  analysis.topLeftRow / stride - 1,
                  analysis.topLeftCol / stride,
                )
              }
            >
              ↑
            </StepperButton>
            <StepperButton
              label="Move window down"
              onClick={() =>
                onSetPosition(
                  analysis.topLeftRow / stride + 1,
                  analysis.topLeftCol / stride,
                )
              }
            >
              ↓
            </StepperButton>
            <StepperButton
              label="Move window right"
              onClick={() =>
                onSetPosition(
                  analysis.topLeftRow / stride,
                  analysis.topLeftCol / stride + 1,
                )
              }
            >
              →
            </StepperButton>
          </div>
          <p className="text-[14px] leading-6 text-[#172452]">
            The top-left corner moves by the stride. Each visited position
            writes one output cell.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function ComputePanel({
  analysis,
  kernel,
  outputColIndex,
  outputRowIndex,
}: {
  analysis: ReturnType<typeof analyzeConvolution>;
  kernel: Matrix;
  outputColIndex: number;
  outputRowIndex: number;
}) {
  return (
    <Panel className="p-5">
      <SectionTitle number={3}>Compute one cell</SectionTitle>
      <div className="mt-6 grid gap-5 xl:grid-cols-[auto_auto_auto_auto_auto] xl:items-center">
        <div>
          <p className="mb-2 text-[12px] font-black text-[#00166d] uppercase">
            Current patch
          </p>
          <MatrixGrid
            matrix={analysis.currentPatch}
            cellSize={50}
            getCellClassName={(_, __, value) =>
              value === 0 ? "bg-[#fff4ce]" : ""
            }
          />
        </div>
        <div className="hidden text-[34px] font-black text-[#6d789b] xl:block">
          x
        </div>
        <div>
          <p className="mb-2 text-[12px] font-black text-[#00166d] uppercase">
            Kernel K
          </p>
          <KernelGrid kernel={kernel} />
        </div>
        <div className="hidden text-[34px] font-black text-[#6d789b] xl:block">
          =
        </div>
        <div>
          <p className="mb-2 text-[12px] font-black text-[#00166d] uppercase">
            Product
          </p>
          <MatrixGrid
            matrix={analysis.elementProducts}
            cellSize={50}
            getCellClassName={(_, col, value) =>
              value > 0 && col === 2 ? "text-[#f01818]" : ""
            }
          />
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="overflow-x-auto rounded-[8px] border border-[#d6def5] bg-[#f7f9ff] px-4 py-3 font-mono text-[14px] font-bold whitespace-nowrap text-[#071024]">
          y[{outputRowIndex},{outputColIndex}] ={" "}
          {makeFormulaTerms(analysis.flattenedProducts).join(" + ")} ={" "}
          <span className="text-[#001fe5]">{formatValue(analysis.sum)}</span>
        </div>
        <div className="rounded-[9px] border border-[#ffc5c5] bg-[#fff3f3] px-6 py-3 text-center text-[#f01818]">
          <div className="text-[12px] font-black uppercase">Current sum</div>
          <div className="font-mono text-[34px] leading-none font-black">
            {formatValue(analysis.sum)}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function OutputPanel({
  analysis,
  rowIndex,
  colIndex,
}: {
  analysis: ReturnType<typeof analyzeConvolution>;
  rowIndex: number;
  colIndex: number;
}) {
  return (
    <Panel className="p-5">
      <SectionTitle number={4}>Watch the output fill</SectionTitle>
      <div className="mt-6 grid gap-8 xl:grid-cols-[auto_minmax(180px,0.45fr)_minmax(300px,0.8fr)] xl:items-center xl:justify-center">
        <div>
          <p className="mb-2 text-[12px] font-black text-[#00166d] uppercase">
            Output feature map ({analysis.outputSize}x{analysis.outputSize})
          </p>
          <MatrixGrid
            matrix={analysis.output}
            cellSize={54}
            getCellClassName={(row, col) =>
              row === rowIndex && col === colIndex
                ? "bg-[#e8f7e8] ring-4 ring-inset ring-[#1d25ff] text-[#001fe5]"
                : "bg-[#e8f7e8]"
            }
          />
        </div>
        <div className="grid gap-3 text-[14px] font-semibold text-[#18224a]">
          <div>
            <span className="mr-3 inline-block size-5 align-middle ring-4 ring-[#1d25ff]" />
            Current cell
          </div>
          <div>
            <span className="mr-3 inline-block size-5 border border-[#b9c6df] bg-[#e8f7e8] align-middle" />
            Completed
          </div>
          <div>
            <span className="mr-3 inline-block size-5 border border-[#b9c6df] bg-white align-middle" />
            Not visited yet
          </div>
          <div>
            <span className="mr-3 inline-block size-5 border border-[#b9c6df] bg-[#fff4ce] align-middle" />
            Padded zero
          </div>
        </div>
        <div className="border-t border-[#d9e2f5] pt-5 text-[17px] leading-8 text-[#07133c] xl:border-t-0 xl:border-l xl:pt-0 xl:pl-8">
          <div className="mb-2 text-[18px] font-black text-[#0f8a34] uppercase">
            Takeaway
          </div>
          <p>Kernel weights decide what each neighborhood becomes.</p>
          <p>Stride skips windows.</p>
          <p>Padding lets borders participate.</p>
        </div>
      </div>
    </Panel>
  );
}

export function ConvolutionFilterLabPlayground() {
  const [state, setState] = useState<ConvolutionState>({
    colIndex: 0,
    filterId: "edge",
    padding: 1,
    rowIndex: 0,
    stride: 1,
  });
  const [showHelp, setShowHelp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const activeFilter =
    kernelOptions.find((filter) => filter.id === state.filterId) ??
    kernelOptions[0];
  const analysis = useMemo(
    () => analyzeConvolution(baseImage, activeFilter.kernel, state),
    [activeFilter.kernel, state],
  );
  const clampedRow = clampIndex(state.rowIndex, analysis.outputSize);
  const clampedCol = clampIndex(state.colIndex, analysis.outputSize);

  function updateState(nextState: Partial<ConvolutionState>) {
    setState((current) => {
      const merged = { ...current, ...nextState };
      const preview = analyzeConvolution(baseImage, activeFilter.kernel, merged);

      return {
        ...merged,
        colIndex: clampIndex(merged.colIndex, preview.outputSize),
        rowIndex: clampIndex(merged.rowIndex, preview.outputSize),
      };
    });
  }

  function setPosition(rowIndex: number, colIndex: number) {
    updateState({ rowIndex, colIndex });
  }

  function setPositionFromPaddedCell(row: number, col: number) {
    const nextRow = Math.round(row / state.stride);
    const nextCol = Math.round(col / state.stride);

    setPosition(nextRow, nextCol);
  }

  function resetLab() {
    setState({
      colIndex: 0,
      filterId: "edge",
      padding: 1,
      rowIndex: 0,
      stride: 1,
    });
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f7f9fd] px-4 py-5 text-[#071024] sm:px-6 lg:px-8 2xl:pr-56">
      <div className="mx-auto w-full max-w-[358px] sm:max-w-[1500px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="max-w-full text-[30px] leading-[1.02] font-black break-words text-[#050912] sm:text-[56px] lg:text-[64px]">
              Convolution Filter Lab
            </h1>
            <p className="mt-3 max-w-4xl text-[16px] leading-[1.45] font-semibold text-[#001bc6] sm:text-[20px]">
              Drag a 3x3 kernel across a tiny image and watch output cells fill.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp((value) => !value)}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-[9px] border border-[#bfd0ff] bg-white px-6 text-[15px] font-black text-[#0a3df0] shadow-[0_8px_24px_rgba(26,38,80,0.05)] transition hover:border-[#7898ff] focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <InfoIcon />
            AI Guide
          </button>
        </header>

        {showHelp ? (
          <div className="mt-5 rounded-[10px] border border-[#d8e0f3] bg-white px-5 py-4 text-[15px] leading-7 text-[#16264e] shadow-[0_18px_42px_rgba(26,38,80,0.05)]">
            A convolution filter slides a small kernel over an image. Each
            output cell is the sum of patch values multiplied by kernel weights.
            Stride decides how far the window jumps. Padding adds border values
            so edge neighborhoods can still be measured.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <FilterPanel
            activeFilter={activeFilter}
            onSelectFilter={(filterId) => updateState({ filterId })}
          />
          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
            <SlidePanel
              analysis={analysis}
              image={baseImage}
              isDragging={isDragging}
              onCellEnter={setPositionFromPaddedCell}
              onCellPointerDown={setPositionFromPaddedCell}
              onSetDragging={setIsDragging}
              onSetPadding={(padding) => updateState({ padding })}
              onSetPosition={setPosition}
              onSetStride={(stride) => updateState({ stride })}
              padding={state.padding}
              stride={state.stride}
            />
            <ComputePanel
              analysis={analysis}
              kernel={activeFilter.kernel}
              outputColIndex={clampedCol}
              outputRowIndex={clampedRow}
            />
          </div>
          <OutputPanel
            analysis={analysis}
            rowIndex={clampedRow}
            colIndex={clampedCol}
          />
          <div className="flex flex-col gap-3 rounded-[10px] border border-[#c7d5fb] bg-white px-5 py-4 text-[15px] leading-7 text-[#172452] shadow-[0_18px_42px_rgba(26,38,80,0.05)] sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="font-black text-[#1d25ff]">
                What&apos;s happening:
              </span>{" "}
              y[{clampedRow},{clampedCol}] is computed from the highlighted
              patch, the selected kernel, and the product table.
            </div>
            <button
              type="button"
              onClick={resetLab}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[8px] border border-[#bfd0ff] bg-white px-5 text-[14px] font-black text-[#1d25ff] transition hover:border-[#7898ff] focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <ResetIcon />
              Reset lab
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
