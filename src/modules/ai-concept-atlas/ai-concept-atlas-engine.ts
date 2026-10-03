import {
  atlasConceptById,
  atlasConcepts,
  atlasDomains,
  defaultAtlasConceptId,
  type AtlasConcept,
  type AtlasDomainId,
} from "./ai-concept-atlas-data";

export type AtlasBranchSide = "left" | "right" | "center";

export type AtlasLayoutNode = {
  id: string;
  x: number;
  y: number;
  depth: number;
  side: AtlasBranchSide;
  expanded: boolean;
  hasChildren: boolean;
  emphasis: "selected" | "trail" | "normal";
};

export type AtlasLayoutEdge = {
  id: string;
  source: string;
  target: string;
  side: Exclude<AtlasBranchSide, "center">;
  color: string;
  highlighted: boolean;
};

export type AtlasView = {
  nodes: AtlasLayoutNode[];
  edges: AtlasLayoutEdge[];
  selected: AtlasConcept;
  visibleConceptIds: string[];
};

export type AtlasViewOptions = {
  selectedId?: string;
  expandedIds: ReadonlySet<string>;
};

const LEFT_DOMAIN_IDS = new Set<AtlasDomainId>([
  "foundations",
  "generative-ai",
  "evaluation-safety",
  "ai-systems",
]);

const DOMAIN_GAP = 32;
const LEAF_GAP = 82;
const DEPTH_X = [0, 290, 580, 870] as const;
export const NODE_WIDTH = [220, 240, 260, 240] as const;
export const NODE_HEIGHT = [72, 72, 72, 72] as const;

const childrenByParent = new Map<string, AtlasConcept[]>();

for (const concept of atlasConcepts) {
  if (!concept.parentId) continue;
  const children = childrenByParent.get(concept.parentId) ?? [];
  children.push(concept);
  childrenByParent.set(concept.parentId, children);
}

for (const children of childrenByParent.values()) {
  children.sort((a, b) => a.label.localeCompare(b.label));
}

function conceptOrDefault(id?: string) {
  return (
    (id ? atlasConceptById.get(id) : undefined) ??
    atlasConceptById.get(defaultAtlasConceptId) ??
    atlasConcepts[0]
  );
}

export function getAtlasChildren(conceptId: string) {
  return [...(childrenByParent.get(conceptId) ?? [])];
}

export function getConceptTrail(conceptId: string) {
  const trail: AtlasConcept[] = [];
  let current = atlasConceptById.get(conceptId);

  while (current) {
    trail.unshift(current);
    current = current.parentId
      ? atlasConceptById.get(current.parentId)
      : undefined;
  }

  return trail;
}

export function getAncestorIds(conceptId: string) {
  return getConceptTrail(conceptId)
    .slice(0, -1)
    .map((concept) => concept.id);
}

function getDomainSide(domainId: AtlasDomainId) {
  return LEFT_DOMAIN_IDS.has(domainId) ? "left" : "right";
}

function buildVisibleConcepts(expandedIds: ReadonlySet<string>) {
  const visibleIds = new Set<string>(["artificial-intelligence"]);
  const isExpanded = (id: string) => id === "artificial-intelligence" || expandedIds.has(id);
  function reveal(id: string) {
    visibleIds.add(id);
    if (isExpanded(id)) for (const child of getAtlasChildren(id)) reveal(child.id);
  }
  for (const domain of atlasDomains) reveal(domain.id);
  return { visibleIds, isExpanded };
}

function layoutSide(
  domainIds: string[],
  side: "left" | "right",
  visibleIds: ReadonlySet<string>,
) {
  const centers = new Map<string, { x: number; y: number; depth: number }>();
  let cursorY = 0;

  function placeSubtree(conceptId: string, depth: number): number {
    const children = getAtlasChildren(conceptId).filter((child) =>
      visibleIds.has(child.id),
    );

    let centerY: number;
    if (children.length === 0) {
      centerY = cursorY;
      cursorY += LEAF_GAP;
    } else {
      const childCenters = children.map((child) =>
        placeSubtree(child.id, depth + 1),
      );
      centerY =
        (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
    }

    const xCenter = (side === "left" ? -1 : 1) * DEPTH_X[depth];
    centers.set(conceptId, { x: xCenter, y: centerY, depth });
    return centerY;
  }

  for (const domainId of domainIds) {
    placeSubtree(domainId, 1);
    cursorY += DOMAIN_GAP;
  }

  const yValues = [...centers.values()].map((position) => position.y);
  const offsetY = yValues.length
    ? -(Math.min(...yValues) + Math.max(...yValues)) / 2
    : 0;

  for (const position of centers.values()) position.y += offsetY;
  return centers;
}

function buildPositions(visibleIds: ReadonlySet<string>) {
  const leftDomains = atlasDomains
    .filter(
      (domain) =>
        LEFT_DOMAIN_IDS.has(domain.id) && visibleIds.has(domain.id),
    )
    .map((domain) => domain.id);
  const rightDomains = atlasDomains
    .filter(
      (domain) =>
        !LEFT_DOMAIN_IDS.has(domain.id) && visibleIds.has(domain.id),
    )
    .map((domain) => domain.id);
  const centeredPositions = new Map([
    ["artificial-intelligence", { x: 0, y: 0, depth: 0 }],
    ...layoutSide(leftDomains, "left", visibleIds),
    ...layoutSide(rightDomains, "right", visibleIds),
  ]);
  const positions = new Map<
    string,
    { x: number; y: number; depth: number; side: AtlasBranchSide }
  >();

  for (const [id, position] of centeredPositions) {
    const concept = atlasConceptById.get(id);
    const side =
      concept?.domainId === "root"
        ? "center"
        : getDomainSide(concept?.domainId ?? "foundations");
    const depth = Math.min(position.depth, 3);
    positions.set(id, {
      x: position.x - NODE_WIDTH[depth] / 2,
      y: position.y - NODE_HEIGHT[depth] / 2,
      depth,
      side,
    });
  }

  return positions;
}

export function buildAtlasView(options: AtlasViewOptions): AtlasView {
  const selected = conceptOrDefault(options.selectedId);
  const { visibleIds, isExpanded } = buildVisibleConcepts(options.expandedIds);
  const positions = buildPositions(visibleIds);
  const trailIds = new Set(getConceptTrail(selected.id).map(({ id }) => id));
  const nodes: AtlasLayoutNode[] = [];

  for (const concept of atlasConcepts) {
    if (!visibleIds.has(concept.id)) continue;
    const position = positions.get(concept.id);
    if (!position) continue;
    const children = getAtlasChildren(concept.id);
    nodes.push({
      id: concept.id,
      ...position,
      expanded: isExpanded(concept.id),
      hasChildren: children.length > 0,
      emphasis:
        concept.id === selected.id
          ? "selected"
          : trailIds.has(concept.id)
            ? "trail"
            : "normal",
    });
  }

  const edges: AtlasLayoutEdge[] = [];
  for (const concept of atlasConcepts) {
    if (
      concept.id === "artificial-intelligence" ||
      !concept.parentId ||
      !visibleIds.has(concept.id) ||
      !visibleIds.has(concept.parentId) ||
      concept.domainId === "root"
    ) {
      continue;
    }
    const domain = atlasDomains.find(({ id }) => id === concept.domainId);
    const side = getDomainSide(concept.domainId);
    edges.push({
      id: `branch:${concept.parentId}->${concept.id}`,
      source: concept.parentId,
      target: concept.id,
      side,
      color: domain?.color ?? "#94a3b8",
      highlighted:
        trailIds.has(concept.parentId) && trailIds.has(concept.id),
    });
  }

  return {
    nodes,
    edges,
    selected,
    visibleConceptIds: nodes.map(({ id }) => id),
  };
}

export function searchAtlas(query: string, limit = 10) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return atlasConcepts
    .flatMap((concept) => {
      const label = concept.label.toLowerCase();
      const index = label.indexOf(normalized);
      if (index === -1) return [];
      const score =
        label === normalized ? 0 : label.startsWith(normalized) ? 1 : 2 + index;
      return [{ concept, score }];
    })
    .toSorted(
      (a, b) =>
        a.score - b.score || a.concept.label.localeCompare(b.concept.label),
    )
    .slice(0, limit)
    .map(({ concept }) => concept);
}
