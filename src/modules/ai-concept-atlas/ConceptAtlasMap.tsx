"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import {
  atlasConceptById,
  atlasDomainById,
  type AtlasConceptKind,
  type AtlasDomainId,
} from "./ai-concept-atlas-data";
import type { AtlasView } from "./ai-concept-atlas-engine";

type ConceptNodeData = {
  conceptId: string;
  label: string;
  kind: AtlasConceptKind;
  domainId: AtlasDomainId | "root";
  emphasis: "selected" | "path" | "neighbor" | "normal";
};

type ConceptFlowNode = Node<ConceptNodeData, "concept">;

type ConceptAtlasMapProps = {
  view: AtlasView;
  onSelectConcept: (conceptId: string) => void;
  focusRequest: number;
  fitRequest: number;
};

function ConceptNodeComponent({ data, selected }: NodeProps<ConceptFlowNode>) {
  const domain =
    data.domainId === "root" ? undefined : atlasDomainById.get(data.domainId);
  const isSelected = data.emphasis === "selected" || selected;
  const isPath = data.emphasis === "path";
  const isNeighbor = data.emphasis === "neighbor";
  const sizeClass =
    data.kind === "root"
      ? "min-h-20 w-56 text-[20px]"
      : data.kind === "domain"
        ? "min-h-16 w-48 text-[16px]"
        : data.kind === "group"
          ? "min-h-14 w-44 text-[14px]"
          : "min-h-12 w-40 text-[13px]";

  return (
    <div
      className={`grid place-items-center rounded-[12px] border px-3 py-2 text-center leading-[1.15] font-black shadow-[0_8px_20px_rgba(26,38,80,0.09)] transition-[border-color,box-shadow,transform] ${sizeClass} ${
        isSelected
          ? "scale-[1.04] border-[#173ee8] bg-[linear-gradient(180deg,#2447ff,#3524d6)] text-white shadow-[0_16px_34px_rgba(36,71,255,0.28)]"
          : isPath
            ? "border-[#2447ff] bg-white text-[#0d2fca] shadow-[0_12px_28px_rgba(36,71,255,0.17)]"
            : isNeighbor
              ? "border-[#9cadff] bg-[#f4f6ff] text-[#2637a4]"
              : "bg-white text-[#071024]"
      }`}
      style={
        isSelected || isPath || !domain
          ? undefined
          : {
              borderColor: domain.color,
              backgroundColor:
                data.kind === "concept" ? "#ffffff" : domain.softColor,
            }
      }
    >
      <Handle
        type="target"
        position={Position.Left}
        className="pointer-events-none! opacity-0!"
      />
      <span>{data.label}</span>
      {data.kind === "domain" ? (
        <span className="mt-1 font-mono text-[9px] font-bold tracking-[0.08em] uppercase opacity-60">
          Open branch
        </span>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        className="pointer-events-none! opacity-0!"
      />
    </div>
  );
}

const ConceptNode = memo(ConceptNodeComponent);
const nodeTypes = { concept: ConceptNode };

function toFlowNodes(view: AtlasView): ConceptFlowNode[] {
  return view.nodes.flatMap((layoutNode) => {
    const concept = atlasConceptById.get(layoutNode.id);
    if (!concept) return [];

    return [
      {
        id: concept.id,
        type: "concept",
        position: { x: layoutNode.x, y: layoutNode.y },
        data: {
          conceptId: concept.id,
          label: concept.label,
          kind: concept.kind,
          domainId: concept.domainId,
          emphasis: layoutNode.emphasis,
        },
        draggable: false,
        selectable: true,
        focusable: true,
        ariaRole: "button",
        ariaLabel: `${concept.label}. ${concept.kind} in the AI Concept Atlas. Press Enter or Space to inspect it.`,
      },
    ];
  });
}

function toFlowEdges(view: AtlasView): Edge[] {
  return view.edges.map((edge) => {
    const isPrerequisite = edge.relation === "prerequisite";
    const isRelated = edge.relation === "related";
    const stroke = edge.highlighted
      ? "#2447ff"
      : isPrerequisite
        ? "#8494cb"
        : isRelated
          ? "#8da0bf"
          : "#c2ccdd";

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "smoothstep",
      focusable: false,
      selectable: false,
      animated: false,
      style: {
        stroke,
        strokeWidth: edge.highlighted ? 3.2 : isPrerequisite ? 1.8 : 1.2,
        strokeDasharray: isRelated ? "3 7" : undefined,
        opacity: edge.highlighted ? 1 : isPrerequisite || isRelated ? 0.72 : 0.48,
      },
      markerEnd: isPrerequisite
        ? {
            type: MarkerType.ArrowClosed,
            color: stroke,
            width: 16,
            height: 16,
          }
        : undefined,
      ariaLabel:
        edge.relation === "prerequisite"
          ? "Required prerequisite relation"
          : edge.relation === "related"
            ? "Related concept relation"
            : "Part-of relation",
    };
  });
}

export function ConceptAtlasMap({
  view,
  onSelectConcept,
  focusRequest,
  fitRequest,
}: ConceptAtlasMapProps) {
  const [instance, setInstance] =
    useState<ReactFlowInstance<ConceptFlowNode, Edge>>();
  const nodes = useMemo(() => toFlowNodes(view), [view]);
  const edges = useMemo(() => toFlowEdges(view), [view]);

  useEffect(() => {
    if (!instance) return;
    const selectedNode = view.nodes.find(
      (node) => node.id === view.selected.id,
    );
    if (!selectedNode) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    void instance.setCenter(selectedNode.x + 80, selectedNode.y + 28, {
      zoom: view.selected.kind === "domain" ? 0.5 : 0.78,
      duration: reduceMotion ? 0 : 380,
    });
  }, [focusRequest, instance, view.nodes, view.selected.id, view.selected.kind]);

  useEffect(() => {
    if (!instance || fitRequest === 0) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    void instance.fitView({
      padding: 0.16,
      minZoom: 0.18,
      maxZoom: 0.62,
      duration: reduceMotion ? 0 : 420,
    });
  }, [fitRequest, instance]);

  return (
    <div className="h-[650px] min-h-[520px] w-full overflow-hidden rounded-[12px] bg-[#fbfcff] lg:h-[720px]">
      <ReactFlow<ConceptFlowNode, Edge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setInstance}
        onNodeClick={(_, node) => onSelectConcept(node.id)}
        onSelectionChange={({ nodes: selectedNodes }) => {
          const selectedNode = selectedNodes.at(-1);
          if (selectedNode && selectedNode.id !== view.selected.id) {
            onSelectConcept(selectedNode.id);
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          const target = event.target as HTMLElement;
          const nodeElement = target.closest<HTMLElement>(
            ".react-flow__node[data-id]",
          );
          const conceptId = nodeElement?.dataset.id;
          if (!conceptId || !atlasConceptById.has(conceptId)) return;
          event.preventDefault();
          onSelectConcept(conceptId);
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        minZoom={0.16}
        maxZoom={1.8}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        nodesFocusable
        edgesFocusable={false}
        panOnDrag
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        autoPanOnNodeFocus
        preventScrolling
        proOptions={{ hideAttribution: true }}
        colorMode="light"
        aria-label="Interactive AI concept map. Pan, zoom, or tab through concepts. Select a concept to inspect its branch and prerequisite path."
        ariaLabelConfig={{
          "node.a11yDescription.default":
            "Press Enter or Space to inspect this concept. The map will center it and reveal its branch.",
          "controls.ariaLabel": "Concept map zoom and fit controls",
          "minimap.ariaLabel": "Concept map overview",
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.2}
          color="#dce4f4"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
          fitViewOptions={{ padding: 0.16, minZoom: 0.18, maxZoom: 0.62 }}
          aria-label="Concept map zoom and fit controls"
        />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            const data = node.data as ConceptNodeData;
            if (data.domainId === "root") return "#2447ff";
            return atlasDomainById.get(data.domainId)?.color ?? "#94a3b8";
          }}
          maskColor="rgba(241,245,255,0.78)"
          bgColor="#ffffff"
          aria-label="Concept map overview"
        />
      </ReactFlow>
    </div>
  );
}
