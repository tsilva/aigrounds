import { useMemo } from "react";

export type NumericValuePoint = {
  id: string;
  value: number;
};

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
) {
  return ((clientX - rect.left) / rect.width) * 100;
}
