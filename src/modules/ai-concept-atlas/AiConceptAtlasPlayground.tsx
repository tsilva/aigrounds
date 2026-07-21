"use client";

import {
  ArrowsPointingOutIcon,
  MagnifyingGlassIcon,
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
  defaultAtlasConceptId,
  type AtlasConcept,
} from "./ai-concept-atlas-data";
import {
  buildAtlasView,
  getAncestorIds,
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
      className="relative z-30 w-full min-w-[240px] sm:w-[320px]"
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
          placeholder={`Search ${atlasConcepts.length} atlas nodes...`}
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

const initialExpandedIds = new Set<string>([
  ...atlasDomains.map(({ id }) => id),
]);

export function AiConceptAtlasPlayground() {
  const [selectedId, setSelectedId] = useState(defaultAtlasConceptId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(initialExpandedIds),
  );
  const [query, setQuery] = useState("");
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

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f8faff] px-4 py-6 text-[#071024] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-4">
        <header>
          <div className="min-w-0">
            <h1 className="text-[42px] leading-[0.98] font-black text-black sm:text-[46px]">
              The AI Concept Atlas
            </h1>
            <p className="mt-3 max-w-3xl text-[16px] leading-[1.45] font-bold text-[#14275d]">
              Start at the center, open a branch, and move from broad categories
              to specific AI concepts.
            </p>
          </div>
        </header>

        <div className="min-w-0">
          <section
            aria-label="AI concept mind map"
            className="min-w-0 overflow-hidden rounded-[12px] border border-[#d8e0f3] bg-white shadow-[0_16px_38px_rgba(26,38,80,0.05)]"
          >
            <div className="relative">
              <div
                role="region"
                aria-label="Atlas navigation controls"
                className="absolute top-3 left-3 z-30 flex flex-wrap items-center gap-2"
              >
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
              <ConceptAtlasMap
                view={view}
                onSelectConcept={selectConcept}
                onToggleBranch={toggleBranch}
                focusRequest={focusRequest}
                fitRequest={fitRequest}
                branchFitRequest={branchFitRequest}
              />
            </div>
            <div className="border-t border-[#dce4f4] bg-[#fbfcff] px-4 py-3 text-[12px] font-bold text-[#43516f]">
              Select a node to highlight its path. Use the branch control on a
              category or subcategory to reveal more specific children.
            </div>
          </section>
        </div>

        <p className="sr-only" aria-live="polite">
          Selected {view.selected.label}. Its taxonomy path has {getConceptTrail(view.selected.id).length - 1}{" "}
          levels.
        </p>
      </div>
    </main>
  );
}
