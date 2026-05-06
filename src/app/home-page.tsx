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
        <header className="flex flex-col gap-5 border-b border-blue-100 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
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
