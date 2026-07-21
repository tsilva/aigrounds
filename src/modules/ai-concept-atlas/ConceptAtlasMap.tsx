"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import { memo, useEffect, useMemo, useState } from "react";
import {
  Controls,
  Handle,
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
import type {
  AtlasBranchSide,
  AtlasView,
} from "./ai-concept-atlas-engine";

type MindMapNodeData = {
  label: string;
  kind: AtlasConceptKind;
  domainId: AtlasDomainId | "root";
  depth: number;
  side: AtlasBranchSide;
  expanded: boolean;
  hasChildren: boolean;
  emphasis: "selected" | "trail" | "normal";
  onToggleBranch: (conceptId: string) => void;
};

type MindMapNode = Node<MindMapNodeData, "mind-map">;

type ConceptAtlasMapProps = {
  view: AtlasView;
  onSelectConcept: (conceptId: string) => void;
  onToggleBranch: (conceptId: string) => void;
  focusRequest: number;
  fitRequest: number;
};

const nodeWidthByDepth = [190, 168, 156, 150] as const;
const nodeHeightByDepth = [64, 52, 34, 30] as const;

function MindMapNodeComponent({ id, data, selected }: NodeProps<MindMapNode>) {
  const domain =
    data.domainId === "root" ? undefined : atlasDomainById.get(data.domainId);
  const isSelected = data.emphasis === "selected" || selected;
  const isTrail = data.emphasis === "trail";
  const depth = Math.min(data.depth, 3);
  const isLeft = data.side === "left";
  const isRoot = data.side === "center";
  const sourcePosition = isLeft ? Position.Left : Position.Right;
  const targetPosition = isLeft ? Position.Right : Position.Left;

  const backgroundColor = isRoot
    ? "#173ee8"
    : isSelected
      ? domain?.color ?? "#173ee8"
      : data.kind === "concept"
        ? "#ffffff"
        : domain?.softColor ?? "#eef2ff";
  const color = isRoot || isSelected ? "#ffffff" : domain?.color ?? "#071024";
  const borderColor = isRoot
    ? "#173ee8"
    : domain?.color ?? "#9cadff";

  return (
    <div
      className={`relative flex items-center justify-center rounded-[9px] border px-3 py-2 text-center leading-[1.15] shadow-[0_7px_18px_rgba(26,38,80,0.08)] transition-[box-shadow,transform] motion-reduce:transition-none ${
        isSelected
          ? "scale-[1.025] shadow-[0_13px_30px_rgba(36,71,255,0.22)]"
          : isTrail
            ? "shadow-[0_10px_24px_rgba(36,71,255,0.14)]"
            : ""
      }`}
      style={{
        width: nodeWidthByDepth[depth],
        minHeight: nodeHeightByDepth[depth],
        borderColor,
        borderWidth: isSelected || isTrail ? 2 : 1,
        backgroundColor,
        color,
      }}
    >
      {isRoot ? (
        <>
          <Handle
            id="source-left"
            type="source"
            position={Position.Left}
            className="pointer-events-none! opacity-0!"
          />
          <Handle
            id="source-right"
            type="source"
            position={Position.Right}
            className="pointer-events-none! opacity-0!"
          />
        </>
      ) : (
        <>
          <Handle
            id="target"
            type="target"
            position={targetPosition}
            className="pointer-events-none! opacity-0!"
          />
          {data.hasChildren ? (
            <Handle
              id="source"
              type="source"
              position={sourcePosition}
              className="pointer-events-none! opacity-0!"
            />
          ) : null}
        </>
      )}

      <span
        className={
          data.kind === "root"
            ? "max-w-[150px] text-[18px] font-black"
            : data.kind === "domain"
              ? "max-w-[132px] text-[14px] font-black"
              : data.kind === "group"
                ? "max-w-[126px] text-[11px] font-black"
                : "max-w-[122px] text-[10px] font-bold"
        }
      >
        {data.label}
      </span>

      {data.hasChildren && !isRoot ? (
        <button
          type="button"
          data-nodrag
          aria-label={`${data.expanded ? "Collapse" : "Expand"} ${data.label} branch`}
          aria-expanded={data.expanded}
          onClick={(event) => {
            event.stopPropagation();
            data.onToggleBranch(id);
          }}
          className={`nodrag nopan absolute top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-[6px] border bg-white text-[#30446f] shadow-sm hover:border-[#2447ff] hover:text-[#173ee8] focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
            isLeft ? "-left-3" : "-right-3"
          }`}
        >
          {data.expanded ? (
            <MinusIcon aria-hidden="true" className="size-3.5" />
          ) : (
            <PlusIcon aria-hidden="true" className="size-3.5" />
          )}
        </button>
      ) : null}
    </div>
  );
}

const MindMapConceptNode = memo(MindMapNodeComponent);
const nodeTypes = { "mind-map": MindMapConceptNode };

function toFlowNodes(
  view: AtlasView,
  onToggleBranch: (conceptId: string) => void,
): MindMapNode[] {
  return view.nodes.flatMap((layoutNode) => {
    const concept = atlasConceptById.get(layoutNode.id);
    if (!concept) return [];

    return [
      {
        id: concept.id,
        type: "mind-map",
        position: { x: layoutNode.x, y: layoutNode.y },
        data: {
          label: concept.label,
          kind: concept.kind,
          domainId: concept.domainId,
          depth: layoutNode.depth,
          side: layoutNode.side,
          expanded: layoutNode.expanded,
          hasChildren: layoutNode.hasChildren,
          emphasis: layoutNode.emphasis,
          onToggleBranch,
        },
        sourcePosition:
          layoutNode.side === "left" ? Position.Left : Position.Right,
        targetPosition:
          layoutNode.side === "left" ? Position.Right : Position.Left,
        draggable: false,
        selectable: true,
        focusable: true,
        ariaRole: "button",
        ariaLabel: `${concept.label}. ${concept.kind} in the AI Concept Atlas.${
          layoutNode.hasChildren
            ? ` Branch ${layoutNode.expanded ? "expanded" : "collapsed"}.`
            : ""
        } Press Enter or Space to inspect it.`,
      },
    ];
  });
}

function toFlowEdges(view: AtlasView): Edge[] {
  return view.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle:
      edge.source === "artificial-intelligence"
        ? edge.side === "left"
          ? "source-left"
          : "source-right"
        : "source",
    targetHandle: "target",
    type: "default",
    focusable: false,
    selectable: false,
    animated: false,
    style: {
      stroke: edge.color,
      strokeWidth: edge.highlighted ? 3.5 : 2.2,
      opacity: edge.highlighted ? 1 : 0.7,
    },
    ariaLabel: "Parent-to-child category branch",
  }));
}

export function ConceptAtlasMap({
  view,
  onSelectConcept,
  onToggleBranch,
  focusRequest,
  fitRequest,
}: ConceptAtlasMapProps) {
  const [instance, setInstance] =
    useState<ReactFlowInstance<MindMapNode, Edge>>();
  const nodes = useMemo(
    () => toFlowNodes(view, onToggleBranch),
    [onToggleBranch, view],
  );
  const edges = useMemo(() => toFlowEdges(view), [view]);

  useEffect(() => {
    if (!instance || focusRequest === 0) return;
    const selectedNode = view.nodes.find(({ id }) => id === view.selected.id);
    if (!selectedNode) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const depth = Math.min(selectedNode.depth, 3);
    void instance.setCenter(
      selectedNode.x + nodeWidthByDepth[depth] / 2,
      selectedNode.y + nodeHeightByDepth[depth] / 2,
      {
        zoom: selectedNode.depth < 2 ? 0.72 : 0.9,
        duration: reduceMotion ? 0 : 360,
      },
    );
  }, [focusRequest, instance, view.nodes, view.selected.id]);

  useEffect(() => {
    if (!instance || fitRequest === 0) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    void instance.fitView({
      padding: 0.12,
      minZoom: 0.14,
      maxZoom: 0.72,
      duration: reduceMotion ? 0 : 400,
    });
  }, [fitRequest, instance]);

  return (
    <div className="h-[680px] min-h-[560px] w-full overflow-hidden bg-white lg:h-[760px]">
      <ReactFlow<MindMapNode, Edge>
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
          if (target.closest("button")) return;
          const nodeElement = target.closest<HTMLElement>(
            ".react-flow__node[data-id]",
          );
          const conceptId = nodeElement?.dataset.id;
          if (!conceptId || !atlasConceptById.has(conceptId)) return;
          event.preventDefault();
          onSelectConcept(conceptId);
        }}
        fitView
        fitViewOptions={{ padding: 0.12, minZoom: 0.14, maxZoom: 0.56 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.42 }}
        minZoom={0.12}
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
        aria-label="Interactive branching AI mind map. Artificial Intelligence is the center. Categories branch left and right into subcategories and increasingly specific concepts."
        ariaLabelConfig={{
          "node.a11yDescription.default":
            "Press Enter or Space to inspect this concept. Use its expand or collapse button when it has children.",
          "controls.ariaLabel": "Mind map zoom and fit controls",
        }}
      >
        <Controls
          showInteractive={false}
          position="bottom-left"
          fitViewOptions={{ padding: 0.12, minZoom: 0.14, maxZoom: 0.56 }}
          aria-label="Mind map zoom and fit controls"
        />
      </ReactFlow>
    </div>
  );
}
