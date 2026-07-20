"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useDeferredValue,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  atlasConceptById,
  atlasConcepts,
  atlasDomainById,
  atlasDomains,
  atlasSources,
  defaultAtlasConceptId,
  type AtlasConcept,
  type AtlasDomainId,
} from "./ai-concept-atlas-data";
import {
  buildAtlasView,
  getConceptTrail,
  searchAtlas,
} from "./ai-concept-atlas-engine";

const ConceptAtlasMap = dynamic(
  () =>
    import("./ConceptAtlasMap").then((module) => module.ConceptAtlasMap),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        className="grid h-[650px] min-h-[520px] place-items-center rounded-[12px] bg-[#fbfcff] text-[13px] font-bold text-[#53617e] lg:h-[720px]"
      >
        Preparing the interactive concept map…
      </div>
    ),
  },
);

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function FocusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    >
      <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" />
    </svg>
  );
}

function RelationToggle({
  checked,
  label,
  lineClass,
  onChange,
}: {
  checked: boolean;
  label: string;
  lineClass: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[9px] border px-3 text-[12px] font-black transition focus-within:ring-4 focus-within:ring-indigo-100 ${
        checked
          ? "border-[#9cadff] bg-[#f5f7ff] text-[#1730ac]"
          : "border-[#d7dfef] bg-white text-[#53617e]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span aria-hidden="true" className={`block w-7 ${lineClass}`} />
      {label}
    </label>
  );
}

function SearchBox({
  query,
  results,
  onQueryChange,
  onSelect,
}: {
  query: string;
  results: AtlasConcept[];
  onQueryChange: (query: string) => void;
  onSelect: (concept: AtlasConcept) => void;
}) {
  const [focused, setFocused] = useState(false);
  const showResults = focused && query.trim().length > 0;

  return (
    <div
      className="relative z-30 min-w-0 flex-1 lg:max-w-[330px]"
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
    >
      <label htmlFor="atlas-search" className="sr-only">
        Search the AI concept atlas
      </label>
      <div className="flex h-11 items-center gap-2 rounded-[9px] border border-[#cfd9ed] bg-white px-3 text-[#54617e] shadow-[0_5px_16px_rgba(26,38,80,0.04)] focus-within:border-[#2447ff] focus-within:ring-4 focus-within:ring-indigo-100">
        <SearchIcon />
        <input
          id="atlas-search"
          type="search"
          role="combobox"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Search ${atlasConcepts.length}+ concepts...`}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showResults}
          aria-controls="atlas-search-results"
          className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-[#071024] outline-none placeholder:text-[#7b88a6]"
        />
      </div>
      {showResults ? (
        <ul
          id="atlas-search-results"
          role="listbox"
          aria-label="Concept search results"
          className="absolute top-[calc(100%+8px)] left-0 max-h-[360px] w-full overflow-y-auto rounded-[12px] border border-[#cfd9ed] bg-white p-2 shadow-[0_22px_45px_rgba(26,38,80,0.16)]"
        >
          {results.length ? (
            results.map((concept) => {
              const domain =
                concept.domainId === "root"
                  ? undefined
                  : atlasDomainById.get(concept.domainId);
              return (
                <li key={concept.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => {
                      onSelect(concept);
                      setFocused(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left hover:bg-[#f5f7ff] focus:bg-[#f5f7ff] focus:outline-none"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-black text-[#071024]">
                        {concept.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] font-semibold text-[#6c7894]">
                        {domain?.label ?? "Atlas root"}
                      </span>
                    </span>
                    <span className="rounded-full border border-[#d9e1f0] px-2 py-1 font-mono text-[9px] font-bold tracking-wide text-[#65728e] uppercase">
                      {concept.kind}
                    </span>
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-3 py-5 text-center text-[13px] font-semibold text-[#65728e]">
              No matching concept. Try a shorter term.
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
}

function DetailPanel({
  selected,
  prerequisiteIds,
  unlockIds,
  exploredCount,
  onSelect,
  onTracePath,
}: {
  selected: AtlasConcept;
  prerequisiteIds: string[];
  unlockIds: string[];
  exploredCount: number;
  onSelect: (conceptId: string) => void;
  onTracePath: () => void;
}) {
  const domain =
    selected.domainId === "root"
      ? undefined
      : atlasDomainById.get(selected.domainId);
  const learningSequence = prerequisiteIds
    .slice(-4)
    .map((id) => atlasConceptById.get(id))
    .filter((concept): concept is AtlasConcept => Boolean(concept));
  const unlocks = unlockIds
    .slice(0, 5)
    .map((id) => atlasConceptById.get(id))
    .filter((concept): concept is AtlasConcept => Boolean(concept));
  const trail = getConceptTrail(selected.id);
  const progress = Math.max(
    2,
    Math.min(100, (exploredCount / atlasConcepts.length) * 100),
  );

  return (
    <aside className="min-w-0 rounded-[14px] border border-[#d8e0f3] bg-white p-5 shadow-[0_18px_42px_rgba(26,38,80,0.06)] lg:p-6">
      <nav aria-label="Selected concept location">
        <ol className="flex flex-wrap gap-x-1.5 gap-y-1 font-mono text-[9px] font-bold tracking-[0.08em] text-[#7180a5] uppercase">
          {trail.map((concept, index) => (
            <li key={concept.id} className="flex items-center gap-1.5">
              {index ? <span aria-hidden="true">/</span> : null}
              <button
                type="button"
                onClick={() => onSelect(concept.id)}
                className="rounded-sm hover:text-[#2447ff] focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {concept.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <p className="mt-5 text-[11px] font-black tracking-[0.08em] text-[#1534dc] uppercase">
        Selected concept
      </p>
      <h2 className="mt-2 text-[34px] leading-[1] font-black text-black">
        {selected.label}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className="rounded-[7px] border px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide uppercase"
          style={
            {
              borderColor: domain?.color ?? "#2447ff",
              color: domain?.color ?? "#2447ff",
              backgroundColor: domain?.softColor ?? "#eef2ff",
            } as CSSProperties
          }
        >
          {domain?.shortLabel ?? "AI"}
        </span>
        <span className="rounded-[7px] border border-[#cfd8ed] bg-[#f8faff] px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-[#556381] uppercase">
          {selected.difficulty}
        </span>
      </div>

      <p className="mt-5 text-[15px] leading-[1.55] font-semibold text-[#172443]">
        {selected.description}
      </p>

      <section className="mt-6 border-t border-[#e1e6f1] pt-5">
        <h3 className="text-[11px] font-black tracking-[0.08em] text-[#1534dc] uppercase">
          Why it matters
        </h3>
        <p className="mt-2 text-[14px] leading-[1.5] font-semibold text-[#31405f]">
          {selected.whyItMatters}
        </p>
      </section>

      <section className="mt-6 border-t border-[#e1e6f1] pt-5">
        <h3 className="text-[11px] font-black tracking-[0.08em] text-[#1534dc] uppercase">
          Learn this first
        </h3>
        {learningSequence.length ? (
          <ol className="mt-3 grid gap-2.5">
            {learningSequence.map((concept, index) => (
              <li key={concept.id}>
                <button
                  type="button"
                  onClick={() => onSelect(concept.id)}
                  className="group flex w-full items-center gap-3 rounded-[8px] text-left focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e8edff] font-mono text-[11px] font-black text-[#173ee8] group-hover:bg-[#2447ff] group-hover:text-white">
                    {index + 1}
                  </span>
                  <span className="text-[13px] font-bold text-[#172443] group-hover:text-[#173ee8]">
                    {concept.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-[13px] font-semibold text-[#65728e]">
            This is an entry point; no earlier atlas concept is required.
          </p>
        )}
      </section>

      <section className="mt-6 border-t border-[#e1e6f1] pt-5">
        <h3 className="text-[11px] font-black tracking-[0.08em] text-[#1534dc] uppercase">
          Unlocks next
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {unlocks.length ? (
            unlocks.map((concept) => (
              <button
                key={concept.id}
                type="button"
                onClick={() => onSelect(concept.id)}
                className="rounded-[7px] border border-[#c9d3e9] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#30446f] hover:border-[#8298ee] hover:text-[#173ee8] focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                {concept.label}
              </button>
            ))
          ) : (
            <span className="text-[13px] font-semibold text-[#65728e]">
              Explore related concepts from the map.
            </span>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-2.5">
        <button
          type="button"
          onClick={onTracePath}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(180deg,#2447ff,#3524d6)] px-4 text-[13px] font-black text-white shadow-[0_12px_24px_rgba(36,71,255,0.2)] hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        >
          <FocusIcon />
          Trace this learning path
        </button>
        {selected.playgroundSlug ? (
          <Link
            href={`/playgrounds/${selected.playgroundSlug}`}
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#9cadff] bg-white px-4 text-[13px] font-black text-[#1730ac] hover:bg-[#f5f7ff] focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            Open playground
          </Link>
        ) : (
          <div className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#d8e0ef] bg-[#f8faff] px-4 text-[12px] font-bold text-[#6c7894]">
            No dedicated playground yet
          </div>
        )}
      </div>

      <section className="mt-5 rounded-[10px] border border-[#dce4f4] bg-[#fbfcff] p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="font-mono text-[10px] font-black tracking-[0.08em] text-[#1534dc] uppercase">
              Map coverage
            </h3>
            <p className="mt-1 text-[12px] font-bold text-[#30446f]">
              {exploredCount} of {atlasConcepts.length} concepts explored
            </p>
          </div>
          <span className="font-mono text-[10px] font-bold text-[#7180a5]">
            {Math.round((exploredCount / atlasConcepts.length) * 100)}%
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e4e9f3]">
          <div
            className="h-full rounded-full bg-[#2447ff] transition-[width] motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>
    </aside>
  );
}

export function AiConceptAtlasPlayground() {
  const [selectedId, setSelectedId] = useState(defaultAtlasConceptId);
  const [domainFilter, setDomainFilter] = useState<AtlasDomainId | "all">(
    "all",
  );
  const [showPrerequisites, setShowPrerequisites] = useState(true);
  const [showRelated, setShowRelated] = useState(true);
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const [fitRequest, setFitRequest] = useState(0);
  const [explored, setExplored] = useState<Set<string>>(
    () => new Set([defaultAtlasConceptId]),
  );
  const deferredQuery = useDeferredValue(query);
  const searchResults = useMemo(
    () => searchAtlas(deferredQuery),
    [deferredQuery],
  );
  const view = useMemo(
    () =>
      buildAtlasView({
        selectedId,
        domainFilter,
        showPrerequisites,
        showRelated,
      }),
    [domainFilter, selectedId, showPrerequisites, showRelated],
  );

  function selectConcept(conceptId: string, focus = true) {
    const concept = atlasConceptById.get(conceptId);
    if (!concept) return;
    setSelectedId(conceptId);
    setExplored((current) => {
      if (current.has(conceptId)) return current;
      const next = new Set(current);
      next.add(conceptId);
      return next;
    });
    if (
      domainFilter !== "all" &&
      concept.domainId !== "root" &&
      concept.domainId !== domainFilter
    ) {
      setDomainFilter("all");
    }
    if (focus) setFocusRequest((current) => current + 1);
  }

  function selectSearchResult(concept: AtlasConcept) {
    setQuery(concept.label);
    setDomainFilter("all");
    selectConcept(concept.id);
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f8faff] px-4 py-8 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-5">
        <header className="flex flex-col gap-4 pt-12 sm:pt-16 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[44px] leading-[0.95] font-black text-black sm:text-[64px] lg:text-[76px]">
              The AI Concept Atlas
            </h1>
            <p className="mt-4 max-w-3xl text-[18px] leading-[1.45] font-bold text-[#14275d]">
              See how the ideas connect — and what to learn next.
            </p>
          </div>
          <button
            type="button"
            aria-expanded={helpOpen}
            aria-controls="atlas-help"
            onClick={() => setHelpOpen((current) => !current)}
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-[8px] border border-[#b8c5ff] bg-white px-4 text-[13px] font-black text-[#1534dc] shadow-[0_8px_20px_rgba(26,38,80,0.05)] hover:bg-[#f5f7ff] focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <span className="grid size-5 place-items-center rounded-full border border-[#1534dc] font-mono text-[12px]">
              ?
            </span>
            How to use the atlas
          </button>
        </header>

        {helpOpen ? (
          <section
            id="atlas-help"
            className="grid gap-5 rounded-[14px] border border-[#cfd9ed] bg-white p-5 shadow-[0_14px_34px_rgba(26,38,80,0.06)] lg:grid-cols-[1fr_0.8fr] lg:p-6"
          >
            <div>
              <h2 className="text-[18px] font-black text-[#1534dc]">
                Navigate from question to learning path
              </h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["1", "Find", "Search or choose a domain."],
                  ["2", "Focus", "Select a concept to expand its branch."],
                  ["3", "Follow", "Trace prerequisites and what unlocks next."],
                ].map(([number, title, copy]) => (
                  <li
                    key={number}
                    className="rounded-[10px] border border-[#dce4f4] bg-[#fbfcff] p-4"
                  >
                    <span className="font-mono text-[11px] font-black text-[#2447ff]">
                      {number}
                    </span>
                    <strong className="ml-2 text-[13px] text-[#071024]">
                      {title}
                    </strong>
                    <p className="mt-2 text-[12px] leading-[1.45] font-semibold text-[#53617e]">
                      {copy}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-[10px] border border-[#dce4f4] bg-[#fbfcff] p-4">
              <h3 className="font-mono text-[10px] font-black tracking-[0.08em] text-[#1534dc] uppercase">
                Taxonomy references
              </h3>
              <p className="mt-2 text-[12px] leading-[1.5] font-semibold text-[#53617e]">
                The atlas is a curated, extensible learning map—not a claim that
                the field has a final boundary.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {atlasSources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-[7px] border border-[#c9d3e9] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#30446f] hover:border-[#8298ee] hover:text-[#173ee8] focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section
          aria-label="Atlas navigation controls"
          className="rounded-[14px] border border-[#d8e0f3] bg-white p-3 shadow-[0_12px_30px_rgba(26,38,80,0.05)]"
        >
          <div className="flex flex-col gap-3">
            <SearchBox
              query={query}
              results={searchResults}
              onQueryChange={setQuery}
              onSelect={selectSearchResult}
            />
            <div
              role="group"
              aria-label="Filter the atlas by domain"
              className="flex min-w-0 flex-1 flex-wrap gap-2"
            >
              <button
                type="button"
                aria-pressed={domainFilter === "all"}
                onClick={() => {
                  setDomainFilter("all");
                  setFitRequest((current) => current + 1);
                }}
                className={`min-h-11 shrink-0 rounded-[8px] border px-3 text-[11px] font-black focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                  domainFilter === "all"
                    ? "border-[#2447ff] bg-[#2447ff] text-white"
                    : "border-[#d5deee] bg-white text-[#43516f] hover:border-[#9cadff]"
                }`}
              >
                All
              </button>
              {atlasDomains.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  aria-pressed={domainFilter === domain.id}
                  onClick={() => {
                    setDomainFilter(domain.id);
                    selectConcept(domain.id);
                  }}
                  className={`min-h-11 shrink-0 rounded-[8px] border px-3 text-[11px] font-black focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                    domainFilter === domain.id
                      ? "text-white"
                      : "bg-white text-[#43516f] hover:bg-[#f8faff]"
                  }`}
                  style={{
                    borderColor: domain.color,
                    backgroundColor:
                      domainFilter === domain.id ? domain.color : undefined,
                  }}
                >
                  {domain.shortLabel}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <RelationToggle
                checked={showPrerequisites}
                label="Prerequisites"
                lineClass="border-t-2 border-[#2447ff]"
                onChange={setShowPrerequisites}
              />
              <RelationToggle
                checked={showRelated}
                label="Related"
                lineClass="border-t-2 border-dotted border-[#7180a5]"
                onChange={setShowRelated}
              />
              <button
                type="button"
                onClick={() => setFitRequest((current) => current + 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-[9px] border border-[#d5deee] bg-white px-3 text-[12px] font-black text-[#43516f] hover:border-[#9cadff] hover:text-[#173ee8] focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                <FocusIcon />
                Fit map
              </button>
            </div>
          </div>
        </section>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
          <section className="min-w-0 overflow-hidden rounded-[14px] border border-[#d8e0f3] bg-white shadow-[0_18px_42px_rgba(26,38,80,0.06)]">
            <div className="flex flex-col gap-3 border-b border-[#dce4f4] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 truncate font-mono text-[10px] font-bold tracking-[0.08em] text-[#53617e] uppercase">
                Path to: {view.selected.label} · {view.prerequisiteIds.length}{" "}
                prerequisite{view.prerequisiteIds.length === 1 ? "" : "s"}
              </p>
              <div
                aria-label="Map relation legend"
                className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-[#65728e]"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="w-7 border-t-2 border-[#2447ff]" />
                  requires
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-7 border-t-2 border-dotted border-[#7180a5]" />
                  related to
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-7 border-t border-[#b4bfd2]" />
                  part of
                </span>
              </div>
            </div>
            <ConceptAtlasMap
              view={view}
              onSelectConcept={selectConcept}
              focusRequest={focusRequest}
              fitRequest={fitRequest}
            />
            <div className="border-t border-[#dce4f4] bg-[#fbfcff] px-4 py-3 text-[12px] font-bold text-[#43516f]">
              Select any concept to reveal its branch, prerequisites, and what
              it unlocks. Drag to pan; scroll or pinch to zoom.
            </div>
          </section>

          <DetailPanel
            selected={view.selected}
            prerequisiteIds={view.prerequisiteIds}
            unlockIds={view.unlockIds}
            exploredCount={explored.size}
            onSelect={selectConcept}
            onTracePath={() => {
              setShowPrerequisites(true);
              setFocusRequest((current) => current + 1);
            }}
          />
        </div>

        <details className="rounded-[14px] border border-[#d8e0f3] bg-white p-4 shadow-[0_12px_30px_rgba(26,38,80,0.04)]">
          <summary className="cursor-pointer text-[13px] font-black text-[#1534dc] focus:outline-none focus:ring-4 focus:ring-indigo-100">
            Browse the visible map as a text list
          </summary>
          <p className="mt-3 text-[12px] font-semibold text-[#65728e]">
            This list is the text equivalent of the currently visible map. Use
            it if a spatial graph is not the easiest way for you to navigate.
          </p>
          <ul className="mt-4 grid gap-2 [content-visibility:auto] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {view.visibleConceptIds
              .map((id) => atlasConceptById.get(id))
              .filter((concept): concept is AtlasConcept => Boolean(concept))
              .toSorted((a, b) => a.label.localeCompare(b.label))
              .map((concept) => (
                <li key={concept.id}>
                  <button
                    type="button"
                    onClick={() => selectConcept(concept.id)}
                    className={`w-full rounded-[8px] border px-3 py-2 text-left text-[12px] font-bold hover:border-[#8298ee] hover:text-[#173ee8] focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                      concept.id === selectedId
                        ? "border-[#2447ff] bg-[#eef2ff] text-[#173ee8]"
                        : "border-[#dce4f4] bg-[#fbfcff] text-[#30446f]"
                    }`}
                  >
                    {concept.label}
                  </button>
                </li>
              ))}
          </ul>
        </details>

        <p className="sr-only" aria-live="polite">
          Selected {view.selected.label}. {view.prerequisiteIds.length}{" "}
          prerequisites and {view.unlockIds.length} directly unlocked concepts.
        </p>
      </div>
    </main>
  );
}
