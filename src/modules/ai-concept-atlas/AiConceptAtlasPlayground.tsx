"use client";

import {
  ArrowsPointingOutIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import {
  atlasConceptById,
  atlasConcepts,
  atlasDomainById,
  atlasDomains,
  atlasSources,
  defaultAtlasConceptId,
  type AtlasConcept,
} from "./ai-concept-atlas-data";
import {
  buildAtlasView,
  getAncestorIds,
  getAtlasChildren,
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
        className="grid h-[680px] min-h-[560px] place-items-center bg-white text-[13px] font-bold text-[#53617e] lg:h-[760px]"
      >
        Preparing the branching mind map…
      </div>
    ),
  },
);

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
      className="relative z-30 w-full min-w-[240px] lg:max-w-[300px]"
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <label htmlFor="atlas-search" className="sr-only">
        Search the AI concept atlas
      </label>
      <div className="flex h-11 items-center gap-2 rounded-[8px] border border-[#cfd9ed] bg-white px-3 text-[#54617e] focus-within:border-[#2447ff] focus-within:ring-4 focus-within:ring-indigo-100">
        <MagnifyingGlassIcon aria-hidden="true" className="size-5" />
        <input
          id="atlas-search"
          type="search"
          role="combobox"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Search ${atlasConcepts.length} concepts...`}
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
          className="absolute top-[calc(100%+8px)] left-0 max-h-[360px] w-full overflow-y-auto rounded-[10px] border border-[#cfd9ed] bg-white p-2 shadow-[0_22px_45px_rgba(26,38,80,0.16)]"
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
                    className="flex w-full items-center justify-between gap-3 rounded-[7px] px-3 py-2.5 text-left hover:bg-[#f5f7ff] focus:bg-[#f5f7ff] focus:outline-none"
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

function TextTreeBranch({
  concept,
  visibleIds,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
}: {
  concept: AtlasConcept;
  visibleIds: ReadonlySet<string>;
  selectedId: string;
  expandedIds: ReadonlySet<string>;
  onSelect: (conceptId: string) => void;
  onToggle: (conceptId: string) => void;
}) {
  const children = getAtlasChildren(concept.id);
  const visibleChildren = children.filter(({ id }) => visibleIds.has(id));
  const expanded =
    concept.id === "artificial-intelligence" || expandedIds.has(concept.id);

  return (
    <li>
      <div className="flex min-h-10 items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(concept.id)}
          className={`rounded-[6px] border px-3 py-2 text-left text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
            concept.id === selectedId
              ? "border-[#2447ff] bg-[#eef2ff] text-[#173ee8]"
              : "border-[#dce4f4] bg-[#fbfcff] text-[#30446f] hover:border-[#8298ee] hover:text-[#173ee8]"
          }`}
        >
          {concept.label}
        </button>
        {children.length && concept.id !== "artificial-intelligence" ? (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => onToggle(concept.id)}
            className="inline-flex min-h-10 items-center gap-1 rounded-[6px] px-2 text-[11px] font-black text-[#52617e] hover:text-[#173ee8] focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            {expanded ? (
              <MinusIcon aria-hidden="true" className="size-4" />
            ) : (
              <PlusIcon aria-hidden="true" className="size-4" />
            )}
            {expanded ? "Collapse" : `Show ${children.length}`}
          </button>
        ) : null}
      </div>
      {visibleChildren.length ? (
        <ul className="mt-1 ml-4 grid gap-1 border-l border-[#d7dff0] pl-4">
          {visibleChildren.map((child) => (
            <TextTreeBranch
              key={child.id}
              concept={child}
              visibleIds={visibleIds}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

const initialExpandedIds = new Set<string>([
  ...atlasDomains.map(({ id }) => id),
]);

export function AiConceptAtlasPlayground() {
  const [selectedId, setSelectedId] = useState(defaultAtlasConceptId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(initialExpandedIds),
  );
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const [fitRequest, setFitRequest] = useState(0);
  const [branchFitRequest, setBranchFitRequest] = useState({
    conceptId: "",
    request: 0,
  });
  const deferredQuery = useDeferredValue(query);
  const searchResults = useMemo(
    () => searchAtlas(deferredQuery),
    [deferredQuery],
  );
  const view = useMemo(
    () => buildAtlasView({ selectedId, domainFilter: "all", expandedIds }),
    [expandedIds, selectedId],
  );

  const selectConcept = useCallback(
    (conceptId: string, focus = true) => {
      const concept = atlasConceptById.get(conceptId);
      if (!concept) return;
      setSelectedId(conceptId);
      setExpandedIds((current) => {
        const next = new Set(current);
        for (const ancestorId of getAncestorIds(conceptId)) next.add(ancestorId);
        return next;
      });
      if (focus) setFocusRequest((current) => current + 1);
    },
    [],
  );

  const toggleBranch = useCallback(
    (conceptId: string) => {
      const collapsing = expandedIds.has(conceptId);
      setExpandedIds((current) => {
        const next = new Set(current);
        if (next.has(conceptId)) next.delete(conceptId);
        else next.add(conceptId);
        return next;
      });

      if (!collapsing) {
        setBranchFitRequest((current) => ({
          conceptId,
          request: current.request + 1,
        }));
      }

      if (
        collapsing &&
        selectedId !== conceptId &&
        getAncestorIds(selectedId).includes(conceptId)
      ) {
        selectConcept(conceptId, false);
      }
    },
    [expandedIds, selectConcept, selectedId],
  );

  function selectSearchResult(concept: AtlasConcept) {
    setQuery(concept.label);
    selectConcept(concept.id);
  }

  const visibleIdSet = useMemo(
    () => new Set(view.visibleConceptIds),
    [view.visibleConceptIds],
  );
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f8faff] px-4 py-6 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-4">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[42px] leading-[0.98] font-black text-black sm:text-[46px]">
              The AI Concept Atlas
            </h1>
            <p className="mt-3 max-w-3xl text-[16px] leading-[1.45] font-bold text-[#14275d]">
              Start at the center, open a branch, and move from broad categories
              to specific AI concepts.
            </p>
          </div>
          <button
            type="button"
            aria-expanded={helpOpen}
            aria-controls="atlas-help"
            onClick={() => setHelpOpen((current) => !current)}
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-[7px] border border-[#b8c5ff] bg-white px-4 text-[13px] font-black text-[#1534dc] hover:bg-[#f5f7ff] focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <InformationCircleIcon aria-hidden="true" className="size-5" />
            How to use the atlas
          </button>
        </header>

        {helpOpen ? (
          <section
            id="atlas-help"
            className="grid gap-5 rounded-[12px] border border-[#cfd9ed] bg-white p-5 shadow-[0_14px_34px_rgba(26,38,80,0.05)] lg:grid-cols-[1fr_0.8fr]"
          >
            <div>
              <h2 className="text-[17px] font-black text-[#1534dc]">
                Read the map from the center outward
              </h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["1", "Choose", "Start with one color-coded AI category."],
                  ["2", "Open", "Expand its subcategories and concepts."],
                  ["3", "Focus", "Select a concept to highlight its path from the AI core."],
                ].map(([number, title, copy]) => (
                  <li
                    key={number}
                    className="rounded-[9px] border border-[#dce4f4] bg-[#fbfcff] p-4"
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
            <div className="rounded-[9px] border border-[#dce4f4] bg-[#fbfcff] p-4">
              <h3 className="font-mono text-[10px] font-black tracking-[0.08em] text-[#1534dc] uppercase">
                How to interpret a branch
              </h3>
              <p className="mt-2 text-[12px] leading-[1.5] font-semibold text-[#53617e]">
                A branch shows one primary learning home, not an exclusive
                scientific boundary. Parent-to-child lines mean “belongs in
                this category.” A branch does not claim prerequisite order.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {atlasSources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-[6px] border border-[#c9d3e9] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#30446f] hover:border-[#8298ee] hover:text-[#173ee8] focus:outline-none focus:ring-4 focus:ring-indigo-100"
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
          className="rounded-[12px] border border-[#d8e0f3] bg-white p-3 shadow-[0_10px_26px_rgba(26,38,80,0.04)]"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchBox
              query={query}
              results={searchResults}
              onQueryChange={setQuery}
              onSelect={selectSearchResult}
            />
            <button
              type="button"
              onClick={() => setFitRequest((current) => current + 1)}
              className="inline-flex min-h-11 w-fit shrink-0 items-center gap-1.5 rounded-[7px] border border-[#d5deee] bg-white px-3 text-[11px] font-black text-[#43516f] hover:border-[#9cadff] hover:text-[#173ee8] focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <ArrowsPointingOutIcon aria-hidden="true" className="size-4" />
              Fit map
            </button>
          </div>
        </section>

        <div className="min-w-0">
          <section className="min-w-0 overflow-hidden rounded-[12px] border border-[#d8e0f3] bg-white shadow-[0_16px_38px_rgba(26,38,80,0.05)]">
            <div className="flex flex-col gap-2 border-b border-[#dce4f4] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] font-black tracking-[0.08em] text-[#1534dc] uppercase">
                  Branching mind map
                </p>
                <p className="mt-1 text-[11px] font-bold text-[#65728e]">
                  {view.visibleConceptIds.length} of {atlasConcepts.length} nodes
                  visible
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold text-[#65728e]">
                {[
                  "AI core",
                  "category",
                  "subcategory",
                  "concept",
                ].map((label, index) => (
                  <span key={label} className="inline-flex items-center gap-1">
                    {index ? (
                      <ChevronRightIcon aria-hidden="true" className="size-3" />
                    ) : null}
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <ConceptAtlasMap
              view={view}
              onSelectConcept={selectConcept}
              onToggleBranch={toggleBranch}
              focusRequest={focusRequest}
              fitRequest={fitRequest}
              branchFitRequest={branchFitRequest}
            />
            <div className="border-t border-[#dce4f4] bg-[#fbfcff] px-4 py-3 text-[12px] font-bold text-[#43516f]">
              Select a node to highlight its path. Use the branch control on a
              category or subcategory to reveal more specific children.
            </div>
          </section>
        </div>

        <details className="rounded-[12px] border border-[#d8e0f3] bg-white p-4 shadow-[0_10px_26px_rgba(26,38,80,0.04)]">
          <summary className="cursor-pointer text-[13px] font-black text-[#1534dc] focus:outline-none focus:ring-4 focus:ring-indigo-100">
            Browse the visible mind map as a text tree
          </summary>
          <p className="mt-3 text-[12px] font-semibold text-[#65728e]">
            This nested list preserves the same parent-to-child hierarchy as the
            spatial mind map.
          </p>
          <ul className="mt-4 grid gap-2 [content-visibility:auto]">
            {atlasConceptById.get("artificial-intelligence") ? (
              <TextTreeBranch
                concept={atlasConceptById.get("artificial-intelligence")!}
                visibleIds={visibleIdSet}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={selectConcept}
                onToggle={toggleBranch}
              />
            ) : null}
          </ul>
        </details>

        <p className="sr-only" aria-live="polite">
          Selected {view.selected.label}. Its taxonomy path has {getConceptTrail(view.selected.id).length - 1}{" "}
          levels.
        </p>
      </div>
    </main>
  );
}
