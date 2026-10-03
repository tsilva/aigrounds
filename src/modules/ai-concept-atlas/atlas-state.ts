import { atlasConceptById, defaultAtlasConceptId } from "./ai-concept-atlas-data";
import { getAncestorIds, getAtlasChildren } from "./ai-concept-atlas-engine";
export type AtlasState = {
    selectedId: string;
    expandedIds: string[];
    query: string;
    mode: "map" | "list";
    selectedViaSearch: boolean;
    compareId: string | null;
};
export const idForLabel = (label: string) => { const c = [...atlasConceptById.values()].find(c => c.label === label); if (!c)
    throw new Error(`Unknown concept ${label}`); return c.id; };
export function initialAtlasState(): AtlasState { return { selectedId: defaultAtlasConceptId, expandedIds: [], query: "", mode: "map", selectedViaSearch: false, compareId: null }; }
export function selectAtlasConcept(state: AtlasState, id: string, viaSearch = false): AtlasState {
    if (!atlasConceptById.has(id))
        throw new Error("Unknown selected concept");
    return { ...state, selectedId: id, expandedIds: [...new Set([...state.expandedIds, ...getAncestorIds(id)])], query: "", selectedViaSearch: viaSearch };
}
export function toggleAtlasBranch(state: AtlasState, id: string): AtlasState {
    if (id === defaultAtlasConceptId || !getAtlasChildren(id).length)
        throw new Error("Choose a non-root branch with children");
    const expanded = new Set(state.expandedIds), collapse = expanded.has(id);
    if (collapse)
        expanded.delete(id);
    else
        expanded.add(id);
    return { ...state, expandedIds: [...expanded], selectedId: collapse && getAncestorIds(state.selectedId).includes(id) ? id : state.selectedId, selectedViaSearch: false };
}
export function atlasBaseline(index: number): AtlasState {
    const initial = initialAtlasState();
    if (index === 1)
        return { ...selectAtlasConcept(initial, "deep-learning"), expandedIds: ["deep-learning"] };
    if (index === 2)
        return selectAtlasConcept(initial, idForLabel("Q-learning"));
    if (index === 4) {
        const id = idForLabel("Calibration");
        return { ...selectAtlasConcept(initial, id), compareId: id };
    }
    return initial;
}
export function reachedAtlas(index: number, state: AtlasState): boolean {
    if (index === 0)
        return state.expandedIds.filter(id => id !== defaultAtlasConceptId).length === 1 && state.expandedIds.includes("deep-learning");
    if (index === 1)
        return state.selectedId === idForLabel("Transformer");
    if (index === 2) {
        const parent = atlasConceptById.get(idForLabel("Q-learning"))!.parentId!;
        return state.selectedId === parent && !state.expandedIds.includes(parent);
    }
    if (index === 3)
        return state.selectedViaSearch && state.selectedId === idForLabel("Q-learning");
    if (index === 4)
        return state.selectedViaSearch && state.selectedId === idForLabel("Sparse autoencoders") && state.compareId === idForLabel("Calibration");
    return state.selectedId === idForLabel("Quantization");
}
