"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPlaygroundUpdateLabel } from "@/lib/playground-update-label";
import { canonicalLessonSlug, getLearningPath, learningPaths, lessonHref } from "@/lib/curriculum";
import { useLearningProgress } from "@/lib/learning-progress";
import { ReadinessCheck } from "@/components/curriculum/readiness-check";

export type HomePlaygroundCard = {
  step: number;
  slug: string;
  title: string;
  tag: string;
  outcome: string;
  duration: string;
  level: string;
  concepts: string[];
  status: "live" | "coming-soon";
  href?: string;
  lastUpdated: string | null;
  coreStep: number;
  paths: string[];
  chapters: { slug: string; title: string }[];
  reference: boolean;
  recallGoals: Record<string, string>;
};

type HomePageProps = {
  playgrounds: HomePlaygroundCard[];
  version: string;
};

export function HomePage({ playgrounds, version }: HomePageProps) {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"curriculum" | "updated">("curriculum");
  const [now, setNow] = useState<number | null>(null);
  const [pathId, setPathId] = useState("core");
  const progress = useLearningProgress();
  const selectedPath = getLearningPath(pathId);
  const lastLesson = playgrounds.find(item => item.slug === canonicalLessonSlug(progress.last?.slug ?? "") && item.status === "live");
  const resumeSlug = lastLesson ? progress.last!.slug : undefined;

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const initialRefresh = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refresh, 60_000);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
  }, []);

  const visiblePlaygrounds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filteredPlaygrounds = playgrounds.filter((playground) => {
      if (!normalizedQuery && selectedPath && !selectedPath.lessons.includes(playground.slug)) return false;
      if (!normalizedQuery && pathId === "extras" && !playground.reference) return false;
      const searchableText = [
        playground.title,
        playground.slug,
        playground.tag,
        playground.outcome,
        playground.duration,
        playground.level,
        playground.status,
        ...playground.concepts,
        ...playground.chapters.map(chapter => chapter.title),
        ...playground.paths.map(id => getLearningPath(id)?.title ?? id),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });

    return filteredPlaygrounds.sort((a, b) => {
      if (sortOrder === "updated") {
        if (a.status !== b.status) return a.status === "live" ? -1 : 1;

        const dateDifference =
          (b.lastUpdated ? Date.parse(b.lastUpdated) : 0) -
          (a.lastUpdated ? Date.parse(a.lastUpdated) : 0);

        if (dateDifference !== 0) return dateDifference;
      }

      if (!normalizedQuery && selectedPath) return selectedPath.lessons.indexOf(a.slug) - selectedPath.lessons.indexOf(b.slug);
      return a.step - b.step;
    });
  }, [playgrounds, query, sortOrder, selectedPath, pathId]);

  return (
    <main className="min-h-screen bg-[#f7faff] px-4 py-5 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl flex-col gap-8">
        <header className="relative flex flex-col gap-5 border-b border-blue-100 pb-6 md:flex-row md:items-end md:justify-between">
          <a
            href="https://github.com/tsilva/aigrounds"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open AI Grounds on GitHub"
            className="absolute top-0 right-0 flex size-11 items-center justify-center rounded-lg border border-blue-100 bg-white text-slate-700 shadow-[0_12px_30px_rgba(79,70,229,0.08)] transition hover:border-indigo-200 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="currentColor"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2.01c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14v3.04c0 .31.21.67.79.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          </a>

          <div className="min-w-0 pr-14 md:pr-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600">
              AI Grounds
            </p>
            <h1 className="mt-2 text-5xl leading-none font-semibold text-slate-950 sm:text-6xl">
              AI Grounds
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Start with the AI core, follow a specialist path, or explore an
              idea you need today. Learn by predicting, trying and explaining.
            </p>
          </div>

          <label className="w-full max-w-md md:self-end">
            <span className="sr-only">Search playgrounds</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search playgrounds"
              className="h-12 w-full rounded-xl border border-blue-200 bg-white px-4 font-mono text-sm text-slate-900 shadow-[0_12px_30px_rgba(79,70,229,0.08)] outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </label>
        </header>

        <section aria-label="Start or continue learning" className="grid gap-4 rounded-xl border border-indigo-100 bg-white p-5 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Start here</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Twenty recommended steps from understanding data to a working neural network. Familiar concepts can be skipped.</p>
            <Link href={lessonHref("mean-median-mode", "core")} className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white!">Start the AI core →</Link>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Continue</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{lastLesson ? `Return to ${lastLesson.title}.` : "Your place is saved in this browser as you explore. No account needed."}</p>
            {resumeSlug && <Link href={lessonHref(resumeSlug, progress.last?.path)} className="mt-3 inline-block font-semibold text-indigo-700! underline! underline-offset-2">Resume your last chapter →</Link>}
            <p className="mt-2 text-xs text-slate-500">{Object.keys(progress.transfers).length} chapter transfer checks explained · {progress.reviewed.length} marked reviewed</p>
          </div>
        </section>

        <section aria-label="Choose a learning path">
          <label className="text-sm font-semibold text-slate-700">Learning path
            <select value={pathId} onChange={event => setPathId(event.target.value)} className="ml-3 max-w-full rounded-lg border border-blue-200 bg-white px-3 py-2">
              {learningPaths.map(path => <option key={path.id} value={path.id}>{path.title}</option>)}
              <option value="all">Browse all lessons</option>
              <option value="extras">Explore & reference</option>
            </select>
          </label>
          <p className="mt-3 text-sm leading-6 text-slate-600">{query.trim() ? "Searching across all lessons, chapters and paths." : selectedPath?.summary ?? (pathId === "extras" ? "Browse the concept atlas and related ideas outside the main curriculum." : "All lessons in learning order. Specialist paths share foundations; chapters retain their original links.")}</p>
          {selectedPath && !query.trim() && <ReadinessCheck key={selectedPath.id} pathId={selectedPath.id} />}
        </section>

        {now !== null && Object.entries(progress.transfers).some(([, time]) => now - time >= 86_400_000) && <section aria-label="Recall practice" className="rounded-xl border border-blue-100 bg-white p-5">
          <h2 className="text-lg font-semibold">Recall an earlier idea</h2>
          <p className="mt-1 text-sm text-slate-600">Explain one idea from memory before reopening its experiment.</p>
          {Object.entries(progress.transfers).filter(([, time]) => now - time >= 86_400_000).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([slug]) => {
            const lesson = playgrounds.find(item => item.slug === canonicalLessonSlug(slug));
            if (!lesson) return null;
            const title = lesson.chapters.find(chapter => chapter.slug === slug)?.title ?? lesson.title;
            return <div key={slug} className="mt-3 border-t border-blue-100 pt-3 text-sm">
              <p className="font-semibold">{title}</p>
              <p className="mt-1">From memory: {lesson.recallGoals[slug] ?? "Explain what you changed, what changed as a result, and why."}</p>
              <Link href={lessonHref(slug)} className="mt-2 inline-block text-indigo-700! underline! underline-offset-2">Revisit the experiment →</Link>
            </div>;
          })}
        </section>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {visiblePlaygrounds.length} {pathId === "extras" && !query.trim() ? "explore entries" : visiblePlaygrounds.length === 1 ? "lesson" : "lessons"} · {visiblePlaygrounds.filter(item => item.status === "coming-soon").length} coming soon
          </p>
          <div role="group" aria-label="Sort playgrounds" className="flex items-center gap-1 rounded-xl border border-blue-200 bg-white p-1">
            {([
              ["curriculum", "Curriculum order"],
              ["updated", "Last updated"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={sortOrder === value}
                onClick={() => setSortOrder(value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                  sortOrder === value
                    ? "bg-indigo-50 text-indigo-700!"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <section aria-label="Playgrounds" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiblePlaygrounds.map((playground) => (
            <PlaygroundTile key={playground.slug} playground={playground} now={now} pathId={query.trim() ? undefined : selectedPath?.id} progress={progress} />
          ))}
        </section>

        {visiblePlaygrounds.length === 0 ? (
          <div className="rounded-xl border border-dashed border-blue-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
            No playgrounds match <span className="font-mono">{query}</span>.
          </div>
        ) : null}

        <footer className="mt-auto border-t border-blue-100 pt-5 font-mono text-xs text-slate-500">
          v{version}
        </footer>
      </div>
    </main>
  );
}

function PlaygroundTile({ playground, now, pathId, progress }: { playground: HomePlaygroundCard; now: number | null; pathId?: string; progress: ReturnType<typeof useLearningProgress> }) {
  const isComingSoon = playground.status === "coming-soon";
  const chapters = playground.chapters.length ? playground.chapters.map(chapter => chapter.slug) : [playground.slug];
  const checked = chapters.filter(slug => progress.transfers[slug]).length;
  const reviewedCount = chapters.filter(slug => progress.reviewed.includes(slug)).length;
  const localStep = pathId ? getLearningPath(pathId)!.lessons.indexOf(playground.slug) + 1 : playground.step;
  const updateLabel = playground.lastUpdated
    ? formatPlaygroundUpdateLabel(playground.lastUpdated, now)
    : null;
  const baseTileClassName =
    "group flex min-h-56 flex-col rounded-xl border p-5";
  const liveTileClassName =
    "group flex min-h-56 flex-col rounded-xl border border-blue-100 bg-white p-5 shadow-[0_16px_40px_rgba(37,99,235,0.08)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_20px_48px_rgba(37,99,235,0.12)]";
  const comingSoonTileClassName = `${baseTileClassName} cursor-default border-slate-200 bg-slate-50/80 shadow-none`;
  const levelClassName = isComingSoon
    ? "font-mono text-xs font-medium uppercase tracking-[0.18em] text-slate-300"
    : "font-mono text-xs font-medium uppercase tracking-[0.18em] text-slate-400";
  const titleClassName = isComingSoon
    ? "mt-4 text-2xl leading-tight font-semibold text-slate-500"
    : "mt-4 text-2xl leading-tight font-semibold text-slate-950";
  const stepClassName = isComingSoon
    ? "shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs font-medium text-slate-400"
    : "shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 font-mono text-xs font-medium text-indigo-700!";
  const tagClassName = isComingSoon
    ? "text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
    : "text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600";
  const outcomeClassName = isComingSoon
    ? "mt-3 text-sm leading-6 text-slate-400"
    : "mt-3 text-sm leading-6 text-slate-600";
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={levelClassName}>
            {pathId ? `step ${String(localStep).padStart(2, "0")}` : playground.level}
          </p>
          <h2 className={titleClassName}>
            {playground.title}
          </h2>
        </div>
        {!playground.reference && <span className={stepClassName}>{String(localStep).padStart(2, "0")}</span>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <p className={tagClassName}>
          {playground.tag}
        </p>
        {isComingSoon ? (
          <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-amber-900">
            coming soon
          </span>
        ) : null}
      </div>
      <p className={outcomeClassName}>
        {playground.outcome}.
      </p>
      <p className="mt-3 text-xs text-slate-500">{playground.duration}</p>
      {checked > 0 ? <p className="mt-2 text-xs font-medium text-indigo-700!">{checked}/{chapters.length} transfer checks explained</p> : reviewedCount > 0 ? <p className="mt-2 text-xs text-slate-500">{chapters.length > 1 ? `${reviewedCount}/${chapters.length} chapters marked reviewed` : "Marked reviewed"}</p> : chapters.some(slug => progress.visited.includes(slug)) ? <p className="mt-2 text-xs text-slate-500">Visited</p> : null}
      {!isComingSoon ? (
        <p className="mt-auto pt-4 font-mono text-xs text-slate-500">
          {playground.lastUpdated && updateLabel ? (
            <>
              Updated{" "}
              <time dateTime={playground.lastUpdated} title={new Date(playground.lastUpdated).toUTCString()}>
                {updateLabel}
              </time>
            </>
          ) : "Update date unavailable"}
        </p>
      ) : null}
    </>
  );

  if (playground.href) {
    return (
      <Link
        href={lessonHref(playground.slug, pathId)}
        prefetch={false}
        className={liveTileClassName}
      >
        {content}
      </Link>
    );
  }

  return <article className={comingSoonTileClassName}>{content}</article>;
}
