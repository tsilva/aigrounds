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
  prerequisiteIds: string[];
  unlockIds: string[];
  relatedIds: string[];
  visibleConceptIds: string[];
};

export type AtlasViewOptions = {
  selectedId?: string;
  domainFilter: AtlasDomainId | "all";
  expandedIds: ReadonlySet<string>;
};

const LEFT_DOMAIN_IDS = new Set<AtlasDomainId>([
  "foundations",
  "generative-ai",
  "evaluation-safety",
  "ai-systems",
]);

const DOMAIN_GAP = 44;
const LEAF_GAP = 40;
const DEPTH_X = [0, 330, 600, 850] as const;
const NODE_WIDTH = [190, 168, 156, 150] as const;
const NODE_HEIGHT = [64, 52, 34, 30] as const;

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
  return childrenByParent.get(conceptId) ?? [];
}

export function getPrerequisiteIds(conceptId: string) {
  const visited = new Set<string>();
  const ordered: string[] = [];

  function visit(id: string) {
    const concept = atlasConceptById.get(id);
    if (!concept) return;

    for (const prerequisiteId of concept.prerequisiteIds) {
      if (visited.has(prerequisiteId)) continue;
      visited.add(prerequisiteId);
      visit(prerequisiteId);
      ordered.push(prerequisiteId);
    }
  }

  visit(conceptId);
  return ordered;
}

export function getUnlockIds(conceptId: string) {
  return atlasConcepts
    .filter((concept) => concept.prerequisiteIds.includes(conceptId))
    .map((concept) => concept.id);
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

function buildVisibleConcepts(
  selected: AtlasConcept,
  domainFilter: AtlasDomainId | "all",
  expandedIds: ReadonlySet<string>,
) {
  const visibleIds = new Set<string>(["artificial-intelligence"]);
  const selectedTrail = getConceptTrail(selected.id);
  const selectedTrailIds = new Set(selectedTrail.map(({ id }) => id));
  const isExpanded = (id: string) =>
    id === "artificial-intelligence" || expandedIds.has(id);

  function reveal(concept: AtlasConcept) {
    visibleIds.add(concept.id);
    const children = getAtlasChildren(concept.id);
    if (isExpanded(concept.id)) {
      for (const child of children) reveal(child);
      return;
    }

    if (
      selected.kind === "concept" &&
      selected.parentId === concept.id
    ) {
      const previewIds = new Set<string>([selected.id]);
      for (const prerequisiteId of selected.prerequisiteIds) {
        if (atlasConceptById.get(prerequisiteId)?.parentId === concept.id) {
          previewIds.add(prerequisiteId);
        }
      }
      for (const unlockId of getUnlockIds(selected.id)) {
        if (atlasConceptById.get(unlockId)?.parentId === concept.id) {
          previewIds.add(unlockId);
        }
      }
      for (const child of children) {
        if (previewIds.size >= 4) break;
        previewIds.add(child.id);
      }
      for (const child of children) {
        if (previewIds.has(child.id)) reveal(child);
      }
      return;
    }

    if (selectedTrailIds.has(concept.id)) {
      const selectedChild = children.find((child) =>
        selectedTrailIds.has(child.id),
      );
      if (selectedChild) reveal(selectedChild);
    }
  }

  for (const domain of atlasDomains) {
    if (domainFilter !== "all" && domain.id !== domainFilter) continue;
    const concept = atlasConceptById.get(domain.id);
    if (concept) reveal(concept);
  }

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
  const prerequisiteIds = getPrerequisiteIds(selected.id);
  const unlockIds = getUnlockIds(selected.id);
  const relatedIds = selected.relatedIds;
  const { visibleIds, isExpanded } = buildVisibleConcepts(
    selected,
    options.domainFilter,
    options.expandedIds,
  );
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
    prerequisiteIds,
    unlockIds,
    relatedIds,
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
