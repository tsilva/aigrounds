import { atlasConceptById } from "./ai-concept-atlas-data";
import { getAtlasChildren, type AtlasView } from "./ai-concept-atlas-engine";
import styles from "./playground.module.css";
export function AtlasBranchList({ view, onSelect, onToggle }: {
    view: AtlasView;
    onSelect: (id: string) => void;
    onToggle: (id: string) => void;
}) {
    const visible = new Set(view.visibleConceptIds), expanded = new Set(view.nodes.filter(n => n.expanded).map(n => n.id));
    function branch(id: string): React.ReactNode { const c = atlasConceptById.get(id)!, children = getAtlasChildren(id).filter(c => visible.has(c.id)); return <li key={id} data-list-node={id}><div><button type="button" aria-label={`Select ${c.label}`} aria-pressed={view.selected.id === id} onClick={() => onSelect(id)}>{c.label}</button><span>{c.kind === "root" ? "Root" : c.kind === "domain" ? "Category" : c.kind === "group" ? "Subcategory" : "Concept"}</span>{id !== "artificial-intelligence" && getAtlasChildren(id).length > 0 && <button type="button" aria-label={`${expanded.has(id) ? "Collapse" : "Expand"} ${c.label} branch`} aria-expanded={expanded.has(id)} onClick={() => onToggle(id)}>{expanded.has(id) ? "Collapse" : "Expand"} branch</button>}</div>{children.length > 0 && <ul>{children.map(c => branch(c.id))}</ul>}</li>; }
    return <ul className={styles.branchList} aria-label="Visible atlas hierarchy">{branch("artificial-intelligence")}</ul>;
}
