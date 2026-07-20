import {
  atlasConceptById,
  atlasConcepts,
  atlasDomains,
  defaultAtlasConceptId,
  type AtlasConcept,
  type AtlasDomainId,
} from "./ai-concept-atlas-data";

export type AtlasRelationKind = "part-of" | "prerequisite" | "related";

export type AtlasLayoutNode = {
  id: string;
  x: number;
  y: number;
  emphasis: "selected" | "path" | "neighbor" | "normal";
};

export type AtlasLayoutEdge = {
  id: string;
  source: string;
  target: string;
  relation: AtlasRelationKind;
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
  expandedGroupId?: string;
};

export type AtlasViewOptions = {
  selectedId?: string;
  domainFilter: AtlasDomainId | "all";
  showPrerequisites: boolean;
  showRelated: boolean;
};

const TAU = Math.PI * 2;
const DOMAIN_RADIUS = 920;
const GROUP_RADIUS = 1460;

function conceptOrDefault(id?: string) {
  return (
    (id ? atlasConceptById.get(id) : undefined) ??
    atlasConceptById.get(defaultAtlasConceptId) ??
    atlasConcepts[0]
  );
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

function addWithAncestors(ids: Set<string>, conceptId: string) {
  let current = atlasConceptById.get(conceptId);
  while (current) {
    ids.add(current.id);
    current = current.parentId
      ? atlasConceptById.get(current.parentId)
      : undefined;
  }
}

function getExpandedGroupId(selected: AtlasConcept) {
  if (selected.kind === "group") return selected.id;
  if (selected.kind === "concept") return selected.parentId;
  return undefined;
}

function buildVisibleIds(
  selected: AtlasConcept,
  domainFilter: AtlasDomainId | "all",
  prerequisiteIds: string[],
  relatedIds: string[],
) {
  const visibleIds = new Set<string>(["artificial-intelligence"]);

  for (const domain of atlasDomains) {
    if (domainFilter !== "all" && domain.id !== domainFilter) continue;
    visibleIds.add(domain.id);
    for (const group of domain.groups) {
      visibleIds.add(`${domain.id}-${group.id}`);
    }
  }

  const expandedGroupId = getExpandedGroupId(selected);
  if (expandedGroupId) {
    for (const concept of atlasConcepts) {
      if (concept.parentId === expandedGroupId) {
        visibleIds.add(concept.id);
      }
    }
  }

  addWithAncestors(visibleIds, selected.id);
  for (const prerequisiteId of prerequisiteIds) {
    addWithAncestors(visibleIds, prerequisiteId);
  }
  for (const relatedId of relatedIds) {
    addWithAncestors(visibleIds, relatedId);
  }

  return { visibleIds, expandedGroupId };
}

function domainPosition(domainIndex: number) {
  const angle = -Math.PI / 2 + (TAU * domainIndex) / atlasDomains.length;
  return {
    x: Math.cos(angle) * DOMAIN_RADIUS,
    y: Math.sin(angle) * DOMAIN_RADIUS,
    angle,
  };
}

function groupPosition(domainIndex: number, groupIndex: number) {
  const domain = atlasDomains[domainIndex];
  const domainAngle = -Math.PI / 2 + (TAU * domainIndex) / atlasDomains.length;
  const wedge = (TAU / atlasDomains.length) * 0.72;
  const offset =
    domain.groups.length === 1
      ? 0
      : -wedge / 2 + (wedge * groupIndex) / (domain.groups.length - 1);
  const angle = domainAngle + offset;
  return {
    x: Math.cos(angle) * GROUP_RADIUS,
    y: Math.sin(angle) * GROUP_RADIUS,
    angle,
  };
}

function leafPosition(
  parentId: string,
  leafIndex: number,
  leafCount: number,
) {
  const parent = atlasConceptById.get(parentId);
  const domainIndex = atlasDomains.findIndex(
    (domain) => domain.id === parent?.domainId,
  );
  const groupIndex = atlasDomains[domainIndex]?.groups.findIndex(
    (group) => group.id === parent?.groupId,
  );
  const group = groupPosition(
    Math.max(0, domainIndex),
    Math.max(0, groupIndex),
  );
  const radialX = Math.cos(group.angle);
  const radialY = Math.sin(group.angle);
  const tangentX = -radialY;
  const tangentY = radialX;
  const columns = leafCount > 12 ? 3 : 2;
  const rows = Math.ceil(leafCount / columns);
  const column = leafIndex % columns;
  const row = Math.floor(leafIndex / columns);
  const outward = 360 + column * 230;
  const tangent = (row - (rows - 1) / 2) * 112;

  return {
    x: group.x + radialX * outward + tangentX * tangent,
    y: group.y + radialY * outward + tangentY * tangent,
  };
}

function positionVisibleNodes(visibleIds: Set<string>) {
  const visibleLeavesByParent = new Map<string, AtlasConcept[]>();
  for (const concept of atlasConcepts) {
    if (
      concept.kind !== "concept" ||
      !visibleIds.has(concept.id) ||
      !concept.parentId
    ) {
      continue;
    }
    const siblings = visibleLeavesByParent.get(concept.parentId) ?? [];
    siblings.push(concept);
    visibleLeavesByParent.set(concept.parentId, siblings);
  }

  const positions = new Map<string, { x: number; y: number }>([
    ["artificial-intelligence", { x: 0, y: 0 }],
  ]);

  atlasDomains.forEach((domain, domainIndex) => {
    positions.set(domain.id, domainPosition(domainIndex));
    domain.groups.forEach((group, groupIndex) => {
      const groupId = `${domain.id}-${group.id}`;
      positions.set(groupId, groupPosition(domainIndex, groupIndex));
      const leaves = visibleLeavesByParent.get(groupId) ?? [];
      leaves
        .toSorted((a, b) => a.label.localeCompare(b.label))
        .forEach((leaf, leafIndex) => {
          positions.set(
            leaf.id,
            leafPosition(groupId, leafIndex, leaves.length),
          );
        });
    });
  });

  return positions;
}

function addEdge(
  edges: AtlasLayoutEdge[],
  seen: Set<string>,
  edge: Omit<AtlasLayoutEdge, "id">,
) {
  const id = `${edge.relation}:${edge.source}->${edge.target}`;
  if (seen.has(id)) return;
  seen.add(id);
  edges.push({ ...edge, id });
}

export function buildAtlasView(options: AtlasViewOptions): AtlasView {
  const selected = conceptOrDefault(options.selectedId);
  const prerequisiteIds = options.showPrerequisites
    ? getPrerequisiteIds(selected.id)
    : [];
  const relatedIds = options.showRelated ? selected.relatedIds : [];
  const unlockIds = getUnlockIds(selected.id);
  const { visibleIds, expandedGroupId } = buildVisibleIds(
    selected,
    options.domainFilter,
    prerequisiteIds,
    relatedIds,
  );
  const positions = positionVisibleNodes(visibleIds);
  const pathIds = new Set([...prerequisiteIds, selected.id]);
  const neighborIds = new Set([...relatedIds, ...unlockIds]);

  const nodes = atlasConcepts.flatMap<AtlasLayoutNode>((concept) => {
    if (!visibleIds.has(concept.id)) return [];
    const position = positions.get(concept.id);
    if (!position) return [];

    const emphasis =
      concept.id === selected.id
        ? "selected"
        : pathIds.has(concept.id)
          ? "path"
          : neighborIds.has(concept.id)
            ? "neighbor"
            : "normal";

    return [{ id: concept.id, ...position, emphasis }];
  });

  const edges: AtlasLayoutEdge[] = [];
  const seenEdges = new Set<string>();

  for (const concept of atlasConcepts) {
    if (!visibleIds.has(concept.id)) continue;
    if (concept.parentId && visibleIds.has(concept.parentId)) {
      addEdge(edges, seenEdges, {
        source: concept.parentId,
        target: concept.id,
        relation: "part-of",
        highlighted: false,
      });
    }

    if (options.showPrerequisites) {
      for (const prerequisiteId of concept.prerequisiteIds) {
        if (!visibleIds.has(prerequisiteId)) continue;
        addEdge(edges, seenEdges, {
          source: prerequisiteId,
          target: concept.id,
          relation: "prerequisite",
          highlighted:
            pathIds.has(prerequisiteId) && pathIds.has(concept.id),
        });
      }
    }

    if (options.showRelated) {
      for (const relatedId of concept.relatedIds) {
        if (!visibleIds.has(relatedId)) continue;
        addEdge(edges, seenEdges, {
          source: concept.id,
          target: relatedId,
          relation: "related",
          highlighted: concept.id === selected.id,
        });
      }
    }
  }

  return {
    nodes,
    edges,
    selected,
    prerequisiteIds,
    unlockIds,
    relatedIds,
    visibleConceptIds: nodes.map((node) => node.id),
    expandedGroupId,
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
