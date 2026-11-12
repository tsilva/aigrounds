import test from "node:test";
import assert from "node:assert/strict";
import { packHomeCatalogue, unpackHomeCatalogue } from "../src/lib/home-catalogue.ts";

const original = Array.from({ length: 12 }, (_, i) => ({
  step: i * 2 + 1, slug: `lesson-${i}`, title: `Title ${i}`, tag: "shared tag",
  outcome: `Outcome ${i} with <symbols> & unicode ∇`, duration: "Ten minutes", level: "optional path",
  concepts: ["shared concept", "0", `unique ${i}`], status: i % 2 ? "coming-soon" : "live",
  lastUpdated: i % 3 ? "2026-11-12T00:00:00Z" : null,
  pathTitleIndexes: [0, i], chapters: i % 2 ? [{slug:`chapter-${i}`,title:`Chapter ${i}`}] : [], reference: Boolean(i % 3),
}));
test("wire representation preserves every catalogue field, sparse step and status combination", () => {
  const wire = JSON.parse(JSON.stringify(packHomeCatalogue(original)));
  assert.deepEqual(unpackHomeCatalogue(wire), original);
});
test("packing leaves caller data unchanged and supports an empty catalogue", () => {
  const saved = structuredClone(original); packHomeCatalogue(original); assert.deepEqual(original, saved);
  assert.deepEqual(unpackHomeCatalogue(packHomeCatalogue([])), []);
});
