"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { clientXToPercentValue, pointLanes, type NumericValuePoint } from "@/lib/number-line";
import styles from "./learning-page.module.css";

export function useNumberLineLayout(points: NumericValuePoint[], spacing = 36, initialWidth = 600) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initialWidth);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(([entry]) => { if (entry) setWidth(entry.contentRect.width); });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);
  const lanes = useMemo(() => pointLanes(points, width, spacing), [points, width, spacing]);
  return { trackRef, width, lanes };
}

// Fixed 0–100 scale shared by these lessons. Keep chart geometry in the caller.
export function NumberLinePoint({ point, selected, mode, helpId, valueText, style, trackRef, onSelect, onMove }: {
  point: NumericValuePoint & { label: string; color?: string };
  selected: boolean;
  mode?: boolean;
  helpId: string;
  valueText?: string;
  style: CSSProperties;
  trackRef: RefObject<HTMLDivElement | null>;
  onSelect: (id: string) => void;
  onMove: (id: string, value: number) => void;
}) {
  const dragging = useRef<number | null>(null);
  function stopDragging() { dragging.current = null; }
  return <button type="button" role="slider" aria-label={`Point ${point.label}`}
    aria-valuemin={0} aria-valuemax={100} aria-valuenow={point.value}
    aria-valuetext={valueText ?? `${point.label}: ${point.value}`} aria-describedby={helpId}
    className={styles.point} data-selected={selected} data-mode={mode}
    style={{ left: `${point.value}%`, "--point-color": point.color, ...style } as CSSProperties}
    onFocus={() => onSelect(point.id)} onPointerDown={(event) => {
      event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId);
      dragging.current = event.pointerId; onSelect(point.id);
    }} onPointerMove={(event) => {
      if (dragging.current === event.pointerId && trackRef.current) {
        onMove(point.id, clientXToPercentValue(event.clientX, trackRef.current.getBoundingClientRect()));
      }
    }} onPointerUp={stopDragging} onPointerCancel={stopDragging} onLostPointerCapture={stopDragging}
    onKeyDown={(event) => {
      const step = event.shiftKey ? 10 : 1;
      const changes: Record<string, number> = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step };
      if (event.key in changes || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        onMove(point.id, event.key === "Home" ? 0 : event.key === "End" ? 100 : point.value + changes[event.key]!);
      }
    }}><span>{point.value}</span><small>{point.label}</small></button>;
}
