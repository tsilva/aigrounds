"use client";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Handle, Position, ReactFlow, type Edge, type Node, type NodeProps, type ReactFlowInstance } from "@xyflow/react";
import { LessonAction } from "@/components/learning-page/learning-page";
import { atlasConceptById, atlasDomainById, type AtlasConceptKind, type AtlasDomainId } from "./ai-concept-atlas-data";
import { NODE_HEIGHT, NODE_WIDTH, getAncestorIds, type AtlasBranchSide, type AtlasView } from "./ai-concept-atlas-engine";
import styles from "./playground.module.css";
type NodeData = {
    label: string;
    kind: AtlasConceptKind;
    domainId: AtlasDomainId | "root";
    depth: number;
    side: AtlasBranchSide;
    expanded: boolean;
    hasChildren: boolean;
    emphasis: "selected" | "trail" | "normal";
    select: (id: string) => void;
    toggle: (id: string) => void; focus: (id: string, button: HTMLButtonElement) => void;
};
type MapNode = Node<NodeData, "atlas">;
function ConceptNode({ id, data }: NodeProps<MapNode>) {
    const domain = data.domainId === "root" ? undefined : atlasDomainById.get(data.domainId), left = data.side === "left", root = data.side === "center", depth = Math.min(data.depth, 3);
    return <div className={styles.node} data-emphasis={data.emphasis} style={{ width: NODE_WIDTH[depth], height: NODE_HEIGHT[depth], borderColor: domain?.color ?? "#5031dc", background: data.emphasis === "selected" ? "#5031dc" : domain?.softColor ?? "#f6f5ff" }}>
    {root ? <><Handle id="source-left" type="source" position={Position.Left} className={styles.handle}/><Handle id="source-right" type="source" position={Position.Right} className={styles.handle}/></> : <><Handle id="target" type="target" position={left ? Position.Right : Position.Left} className={styles.handle}/>{data.hasChildren && <Handle id="source" type="source" position={left ? Position.Left : Position.Right} className={styles.handle}/>}</>}
    <button type="button" className={`${styles.nodeLabel} nodrag nopan`} aria-label={`Select ${data.label}`} aria-pressed={data.emphasis === "selected"} onFocus={e => data.focus(id, e.currentTarget)} onClick={e => { e.stopPropagation(); data.select(id); }}>{data.label}</button>
    {data.hasChildren && !root && <button type="button" className={`${styles.branchButton} nodrag nopan`} aria-label={`${data.expanded ? "Collapse" : "Expand"} ${data.label} branch`} aria-expanded={data.expanded} onFocus={e => data.focus(id, e.currentTarget)} onClick={e => { e.stopPropagation(); data.toggle(id); }}>{data.expanded ? "−" : "+"}</button>}
  </div>;
}
const nodeTypes = { atlas: memo(ConceptNode) };
export function ConceptAtlasMap({ view, onSelectConcept, onToggleBranch, cameraRequest }: {
    view: AtlasView;
    onSelectConcept: (id: string) => void;
    onToggleBranch: (id: string) => void;
    cameraRequest: {
        request: number;
        kind: "selected" | "branch" | "fit";
        id: string;
    };
}) {
    const [instance, setInstance] = useState<ReactFlowInstance<MapNode, Edge>>(), [fullscreen, setFullscreen] = useState(false);
    const mapSurface = useRef<HTMLDivElement>(null);
    const shell = useRef<HTMLDivElement>(null), exitButton = useRef<HTMLButtonElement>(null), handled = useRef(-1);
    const keepFocusVisible = useCallback((id: string, button: HTMLButtonElement) => {
        // Keyboard focus styling can settle after the focus event is dispatched.
        requestAnimationFrame(() => {
            if (document.activeElement !== button || !button.matches(":focus-visible") || !instance || !mapSurface.current) return;
            const bounds = mapSurface.current.getBoundingClientRect();
            const rect = button.getBoundingClientRect();
            if (instance.getZoom() >= .7 && rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom) return;
            const node = view.nodes.find(node => node.id === id);
            if (node) void instance.setCenter(node.x + NODE_WIDTH[node.depth] / 2, node.y + NODE_HEIGHT[node.depth] / 2, { zoom: 1, duration: 0 });
        });
    }, [instance, view.nodes]);
    const nodes = useMemo<MapNode[]>(() => view.nodes.map(n => { const c = atlasConceptById.get(n.id)!; return { id: n.id, type: "atlas", position: { x: n.x, y: n.y }, initialWidth: NODE_WIDTH[n.depth], initialHeight: NODE_HEIGHT[n.depth], draggable: false, selectable: false, focusable: false, ariaRole: "group", ariaLabel: `${c.label}, ${c.kind}`, data: { ...n, label: c.label, kind: c.kind, domainId: c.domainId, select: onSelectConcept, toggle: onToggleBranch, focus: keepFocusVisible } }; }), [view, onSelectConcept, onToggleBranch, keepFocusVisible]);
    const edges = useMemo<Edge[]>(() => view.edges.map(e => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.source === "artificial-intelligence" ? (e.side === "left" ? "source-left" : "source-right") : "source", targetHandle: "target", type: "default", focusable: false, selectable: false, style: { stroke: e.color, strokeWidth: e.highlighted ? 3 : 1.5, opacity: e.highlighted ? 1 : .7 } })), [view]);
    useEffect(() => {
        if (!instance || handled.current === cameraRequest.request)
            return;
        let second = 0;
        const first = requestAnimationFrame(() => {
            second = requestAnimationFrame(() => {
                handled.current = cameraRequest.request;
                if (cameraRequest.kind === "selected") {
                    const n = view.nodes.find(n => n.id === cameraRequest.id);
                    if (n)
                        void instance.setCenter(n.x + NODE_WIDTH[n.depth] / 2, n.y + NODE_HEIGHT[n.depth] / 2, { zoom: 1, duration: 0 });
                }
                else {
                    const ids = cameraRequest.kind === "branch" ? new Set([...getAncestorIds(cameraRequest.id), cameraRequest.id, ...view.nodes.filter(n => getAncestorIds(n.id).includes(cameraRequest.id)).map(n => n.id)]) : null;
                    void instance.fitView({ nodes: ids ? view.nodes.filter(n => ids.has(n.id)).map(n => ({ id: n.id })) : undefined, padding: .08, minZoom: .005, maxZoom: 1, duration: 0 });
                }
            });
        });
        return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
    }, [cameraRequest, instance, view]);
    useEffect(() => {
        const surface = mapSurface.current;
        if (!instance || !surface) return;
        let previousWidth = 0, previousHeight = 0;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            if (width <= 0 || height <= 0 || (width === previousWidth && height === previousHeight)) return;
            previousWidth = width;
            previousHeight = height;
            void instance.fitView({ padding: .08, minZoom: .005, maxZoom: 1, duration: 0 });
        });
        observer.observe(surface);
        return () => observer.disconnect();
    }, [instance]);
    useEffect(() => {
        if (!fullscreen)
            return;
        const container = shell.current!, previous = document.activeElement, overflow = document.body.style.overflow;
        const outside: {
            element: HTMLElement;
            inert: boolean;
        }[] = [];
        let child: HTMLElement = container;
        while (child.parentElement) {
            for (const sibling of child.parentElement.children)
                if (sibling !== child && sibling instanceof HTMLElement) {
                    outside.push({ element: sibling, inert: sibling.inert });
                    sibling.inert = true;
                }
            child = child.parentElement;
        }
        document.body.style.overflow = "hidden";
        exitButton.current?.focus({ preventScroll: true });
        function key(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                setFullscreen(false);
                return;
            }
            if (event.key !== "Tab")
                return;
            const controls = [...container.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],[tabindex="0"]')].filter(n => n.getClientRects().length > 0 && !n.closest('[inert]'));
            const first = controls[0], last = controls.at(-1);
            if (!first || !last) {
                event.preventDefault();
                container.focus();
                return;
            }
            if (!container.contains(document.activeElement)) {
                event.preventDefault();
                first.focus();
            }
            else if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
        const media = matchMedia('(min-width:768px)');
        const resized = () => { if (!media.matches)
            setFullscreen(false); };
        document.addEventListener('keydown', key);
        media.addEventListener('change', resized);
        return () => { document.removeEventListener('keydown', key); media.removeEventListener('change', resized); document.body.style.overflow = overflow; for (const s of outside)
            s.element.inert = s.inert; if (previous instanceof HTMLElement && previous.isConnected)
            previous.focus({ preventScroll: true }); };
    }, [fullscreen]);
    useEffect(() => { if (!instance)
        return; void instance.fitView({ padding: .08, minZoom: .005, maxZoom: 1, duration: 0 }); }, [fullscreen, instance]);
    return <div ref={shell} className={fullscreen ? styles.fullscreen : styles.mapShell} role={fullscreen ? "dialog" : undefined} aria-modal={fullscreen || undefined} aria-label={fullscreen ? "AI Concept Atlas fullscreen map" : undefined} tabIndex={fullscreen ? -1 : undefined}>
    <div ref={mapSurface} className={styles.map}><ReactFlow<MapNode, Edge> nodes={nodes} edges={edges} nodeTypes={nodeTypes} onInit={setInstance} fitView fitViewOptions={{ padding: .08, minZoom: .005, maxZoom: 1 }} minZoom={.005} maxZoom={1.8} nodesDraggable={false} nodesConnectable={false} nodesFocusable={false} edgesFocusable={false} elementsSelectable={false} panOnDrag panOnScroll zoomOnScroll zoomOnPinch zoomOnDoubleClick={false} preventScrolling={false} proOptions={{ hideAttribution: true }} aria-label="Spatial AI category map. Use labeled node and branch buttons, or switch to Branch list for the same hierarchy in text.">

    </ReactFlow></div>
    <div className={styles.mapControls} aria-label="Map camera controls"><button ref={exitButton} className={styles.fullscreenButton} type="button" onClick={() => setFullscreen(v => !v)} aria-pressed={fullscreen}>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</button><LessonAction disabled={!instance} onClick={() => { void instance?.zoomIn({ duration: 0 }); }}>Zoom in</LessonAction><LessonAction disabled={!instance} onClick={() => { void instance?.zoomOut({ duration: 0 }); }}>Zoom out</LessonAction><LessonAction disabled={!instance} onClick={() => { void instance?.fitView({ padding: .08, minZoom: .005, maxZoom: 1, duration: 0 }); }}>Fit map</LessonAction><LessonAction disabled={!instance} onClick={() => { const n = view.nodes.find(n => n.id === view.selected.id); if (n)
        void instance?.setCenter(n.x + NODE_WIDTH[n.depth] / 2, n.y + NODE_HEIGHT[n.depth] / 2, { zoom: 1, duration: 0 }); }}>Focus selected</LessonAction></div>
  </div>;
}
