"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
};

type HomePageProps = {
  playgrounds: HomePlaygroundCard[];
  version: string;
};

export function HomePage({ playgrounds, version }: HomePageProps) {
  const [query, setQuery] = useState("");

  const visiblePlaygrounds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return playgrounds;
    }

    return playgrounds.filter((playground) => {
      const searchableText = [
        playground.title,
        playground.slug,
        playground.tag,
        playground.outcome,
        playground.duration,
        playground.level,
        playground.status,
        ...playground.concepts,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [playgrounds, query]);

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
              Learn AI concepts through small interactive playgrounds, ordered
              from the foundations to the systems they unlock.
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

        <section aria-label="Playgrounds" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiblePlaygrounds.map((playground) => (
            <PlaygroundTile key={playground.slug} playground={playground} />
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

function PlaygroundTile({ playground }: { playground: HomePlaygroundCard }) {
  const tileClassName =
    "group flex min-h-72 flex-col rounded-xl border border-blue-100 bg-white p-5 shadow-[0_16px_40px_rgba(37,99,235,0.08)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_20px_48px_rgba(37,99,235,0.12)]";
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {playground.level}
          </p>
          <h2 className="mt-4 text-2xl leading-tight font-semibold text-slate-950">
            {playground.title}
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 font-mono text-xs font-medium text-indigo-700">
          {String(playground.step).padStart(2, "0")}
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
        {playground.tag}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {playground.outcome}.
      </p>

      <div className="mt-auto flex items-end justify-between gap-4 pt-8">
        <div className="space-y-2 font-mono text-xs text-slate-500">
          <p>{playground.duration}</p>
          <p>{playground.concepts.length} concepts</p>
        </div>
        <span
          className={
            playground.status === "live"
              ? "rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition group-hover:bg-indigo-700"
              : "rounded-lg border border-blue-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500"
          }
        >
          {playground.status === "live" ? "Open" : "Soon"}
        </span>
      </div>
    </>
  );

  if (playground.href) {
    return (
      <Link href={playground.href} className={tileClassName}>
        {content}
      </Link>
    );
  }

  return <article className={tileClassName}>{content}</article>;
}
