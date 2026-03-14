"use client";

import { startTransition, useEffect, useState } from "react";
import {
  buildDiffusionRun,
  type DiffusionFrame,
  type DiffusionRun,
} from "./diffusion-engine";
import { diffusionSubjects } from "./subjects";

const diffusionRuns = diffusionSubjects.map(buildDiffusionRun);
const diffusionRunById = Object.fromEntries(
  diffusionRuns.map((run) => [run.preset.id, run]),
) as Record<string, DiffusionRun>;

type FramePreviewProps = {
  frame: DiffusionFrame;
  gridSize: number;
  title: string;
  caption?: string;
  className?: string;
};

function FramePreview({
  frame,
  gridSize,
  title,
  caption,
  className = "",
}: FramePreviewProps) {
  return (
    <div
      className={`overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white ${className}`}
    >
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
            {title}
          </p>
          {caption ? (
            <p className="mt-1 text-xs leading-6 text-stone-600">{caption}</p>
          ) : null}
        </div>
        <p className="font-mono text-xs text-stone-500">step {frame.step}</p>
      </div>
      <div className="bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(241,245,249,0.7))] p-4">
        <svg
          viewBox={`0 0 ${gridSize} ${gridSize}`}
          className="aspect-square w-full rounded-[1.1rem] border border-white/60 bg-stone-950/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
          role="img"
          aria-label={title}
          shapeRendering="crispEdges"
        >
          {frame.pixels.map((fill, index) => (
            <rect
              key={`${title}-${index}`}
              x={index % gridSize}
              y={Math.floor(index / gridSize)}
              width="1"
              height="1"
              fill={fill}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accentClassName,
}: {
  label: string;
  value: string;
  accentClassName: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-stone-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold tracking-[-0.04em] ${accentClassName}`}>
        {value}
      </p>
    </div>
  );
}

export function DiffusionPlayground() {
  const [selectedPresetId, setSelectedPresetId] = useState(
    diffusionRuns[0]?.preset.id ?? "",
  );
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const run = diffusionRunById[selectedPresetId] ?? diffusionRuns[0];
  const currentFrame = run.frames[step] ?? run.frames[0];
  const finalFrame = run.frames[run.totalSteps];

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setStep((currentStep) => {
        if (currentStep >= run.totalSteps) {
          setIsPlaying(false);
          return currentStep;
        }

        return currentStep + 1;
      });
    }, 220);

    return () => window.clearInterval(intervalId);
  }, [isPlaying, run.totalSteps]);

  function selectPreset(nextPresetId: string) {
    startTransition(() => {
      setSelectedPresetId(nextPresetId);
      setStep(0);
      setIsPlaying(false);
    });
  }

  function stepBackward() {
    setIsPlaying(false);
    setStep((currentStep) => Math.max(0, currentStep - 1));
  }

  function stepForward() {
    setIsPlaying(false);
    setStep((currentStep) => Math.min(run.totalSteps, currentStep + 1));
  }

  function resetRun() {
    setIsPlaying(false);
    setStep(0);
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
        <div className="border-b border-stone-200 px-6 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-500">
                  Latent image scrubber
                </p>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">
                  Watch denoising reveal structure in layers
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-stone-600">
                  This is a simplified diffusion toy, not a photoreal image
                  model. The point is the sequence: coarse layout stabilizes
                  first, recognizable parts arrive next, and texture only shows
                  up once the sampler has already committed to the scene.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-7 text-sky-950 xl:max-w-md">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-sky-700">
                  Mental model
                </p>
                <p className="mt-3">
                  Diffusion does not generate the final image in one jump. Each
                  step removes a bit of uncertainty, so low-frequency structure
                  wins before crisp edges and surface texture.
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))]">
              <div className="rounded-[1.4rem] border border-stone-200 bg-stone-950 p-4 text-stone-50">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
                  Subject preset
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {diffusionRuns.map((presetRun) => (
                    <button
                      key={presetRun.preset.id}
                      type="button"
                      onClick={() => selectPreset(presetRun.preset.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        presetRun.preset.id === run.preset.id
                          ? "bg-sky-300 text-sky-950"
                          : "bg-stone-800 text-stone-200 hover:bg-stone-700"
                      }`}
                    >
                      {presetRun.preset.title}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-stone-300">
                  {run.preset.caption}
                </p>
              </div>

              <StatCard
                label="Denoising step"
                value={`${step}/${run.totalSteps}`}
                accentClassName="text-sky-700"
              />
              <StatCard
                label="Noise left"
                value={`${currentFrame.noiseLeft}%`}
                accentClassName="text-amber-700"
              />
              <StatCard
                label="Guessability"
                value={`${currentFrame.guessability}%`}
                accentClassName="text-emerald-700"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-4 py-4 sm:px-6 sm:py-6 xl:grid-cols-[minmax(0,1.2fr)_24rem]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.9))]">
              <div className="flex flex-col gap-4 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                    Current latent state
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-950">
                    {currentFrame.phaseLabel}
                  </h3>
                </div>
                <div className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
                  Focus: {currentFrame.focusLabel}
                </div>
              </div>

              <div className="p-5">
                <svg
                  viewBox={`0 0 ${run.gridSize} ${run.gridSize}`}
                  className="aspect-square w-full rounded-[1.5rem] border border-white/60 bg-stone-950/5 shadow-[0_18px_45px_rgba(14,24,39,0.12)]"
                  role="img"
                  aria-label={`${run.preset.title} at step ${step}`}
                  shapeRendering="crispEdges"
                >
                  {currentFrame.pixels.map((fill, index) => (
                    <rect
                      key={`current-${index}`}
                      x={index % run.gridSize}
                      y={Math.floor(index / run.gridSize)}
                      width="1"
                      height="1"
                      fill={fill}
                    />
                  ))}
                </svg>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="diffusion-step"
                  className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500"
                >
                  Scrub the denoising loop
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={resetRun}
                    className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 transition-colors hover:border-stone-950"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={stepBackward}
                    className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 transition-colors hover:border-stone-950"
                  >
                    Step back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (step >= run.totalSteps) {
                        setStep(0);
                      }

                      setIsPlaying((value) => !value);
                    }}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      isPlaying
                        ? "border border-amber-300 bg-amber-100 text-amber-950"
                        : "bg-stone-950 text-stone-50 hover:bg-stone-800"
                    }`}
                  >
                    {isPlaying ? "Pause" : "Autoplay"}
                  </button>
                  <button
                    type="button"
                    onClick={stepForward}
                    className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 transition-colors hover:border-stone-950"
                  >
                    Step forward
                  </button>
                </div>
              </div>

              <input
                id="diffusion-step"
                type="range"
                min="0"
                max={run.totalSteps}
                step="1"
                value={step}
                onChange={(event) => {
                  setIsPlaying(false);
                  setStep(Number(event.target.value));
                }}
                className="mt-5 w-full accent-sky-600"
              />

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                    Structure locked
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-950">
                    {currentFrame.structureLocked}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                    Detail visible
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-950">
                    {currentFrame.detailVisible}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                    Prompt
                  </p>
                  <p className="mt-2 text-sm leading-7 text-stone-700">
                    {run.preset.prompt}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-950 p-5 text-stone-100">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
                Why this frame looks soft
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                {currentFrame.phaseLabel}
              </h3>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                {currentFrame.phaseSummary}
              </p>
            </div>

            <FramePreview
              frame={finalFrame}
              gridSize={run.gridSize}
              title="Final target"
              caption="This is the same scene after the sampler has spent all its steps."
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_55px_rgba(68,64,60,0.1)] backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
              Milestone frames
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-stone-950">
              The subject becomes readable before it becomes crisp.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-600">
            Click any checkpoint to jump there. The main change in late steps
            is polish, not composition.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {run.milestoneSteps.map((milestoneStep) => {
            const frame = run.frames[milestoneStep];
            const isActive = milestoneStep === step;

            return (
              <button
                key={milestoneStep}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStep(milestoneStep);
                }}
                className={`overflow-hidden rounded-[1.35rem] border text-left transition-transform hover:-translate-y-0.5 ${
                  isActive
                    ? "border-sky-400 bg-sky-50 shadow-[0_14px_30px_rgba(14,165,233,0.12)]"
                    : "border-stone-200 bg-stone-50/80"
                }`}
              >
                <div className="border-b border-stone-200 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                    Step {milestoneStep}
                  </p>
                  <p className="mt-1 text-sm font-medium text-stone-800">
                    {frame.phaseLabel}
                  </p>
                </div>
                <div className="p-4">
                  <svg
                    viewBox={`0 0 ${run.gridSize} ${run.gridSize}`}
                    className="aspect-square w-full rounded-[1rem] border border-white/60 bg-white"
                    role="img"
                    aria-label={`${run.preset.title} at step ${milestoneStep}`}
                    shapeRendering="crispEdges"
                  >
                    {frame.pixels.map((fill, index) => (
                      <rect
                        key={`${milestoneStep}-${index}`}
                        x={index % run.gridSize}
                        y={Math.floor(index / run.gridSize)}
                        width="1"
                        height="1"
                        fill={fill}
                      />
                    ))}
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(68,64,60,0.08)]">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
            1. Coarse frequencies first
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            Big color regions and overall pose are easier to recover than tiny
            edges, so the sampler commits to a rough scene before it has enough
            confidence to sharpen anything.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(68,64,60,0.08)]">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
            2. Every step removes uncertainty
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            Diffusion is iterative. The model predicts how to subtract a small
            slice of noise, then repeats. That repeated correction is why the
            image refines instead of materializing fully formed.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(68,64,60,0.08)]">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
            3. Late steps are mostly polish
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            Once the composition is locked, additional steps mostly clean edges,
            boost local contrast, and add fine texture. The scene stops changing
            much even though it keeps looking sharper.
          </p>
        </article>
      </section>
    </div>
  );
}
