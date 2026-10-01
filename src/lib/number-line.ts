import { useMemo } from "react";

export type NumericValuePoint = {
  id: string;
  value: number;
};

// Pack nearby handles into rows without changing their horizontal numeric position.
export function pointLanes(points: readonly NumericValuePoint[], width: number, spacing = 36) {
  const ends: number[] = [];
  const positions = new Map<string, number>();
  for (const point of [...points].sort((a, b) => a.value - b.value)) {
    const x = point.value / 100 * Math.max(1, width);
    let lane = ends.findIndex((end) => x - end >= spacing);
    if (lane < 0) lane = ends.length;
    ends[lane] = x;
    positions.set(point.id, lane);
  }
  return { positions, count: ends.length };
}

export function useStackedPointLayout<T extends NumericValuePoint>(
  points: T[],
  spacing = 20,
) {
  return useMemo(() => {
    const grouped = new Map<number, T[]>();

    for (const point of points) {
      grouped.set(point.value, [...(grouped.get(point.value) ?? []), point]);
    }

    const offsets = new Map<string, number>();

    for (const group of grouped.values()) {
      group.forEach((point, index) => {
        offsets.set(point.id, (index - (group.length - 1) / 2) * spacing);
      });
    }

    return offsets;
  }, [points, spacing]);
}

export function clientXToPercentValue(
  clientX: number,
  rect: Pick<DOMRect, "left" | "width">,
  insetPx = 0,
) {
  const usableWidth = Math.max(1, rect.width - insetPx * 2);

  return ((clientX - rect.left - insetPx) / usableWidth) * 100;
}
