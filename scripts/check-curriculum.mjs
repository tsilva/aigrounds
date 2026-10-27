import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 };
const modules = new Map();
// Execute only the pure curriculum data modules, never tutor or UI imports.
function loadData(name) {
  assert.ok(["curriculum", "planned-curriculum"].includes(name), `Unexpected data import: ${name}`);
  if (modules.has(name)) return modules.get(name);
  const exports = {};
  modules.set(name, exports);
  const filename = resolve(root, `src/lib/${name}.ts`);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions }).outputText;
  vm.runInNewContext(output, {
    exports,
    require(specifier) {
      assert.equal(specifier, "./planned-curriculum");
      return loadData("planned-curriculum");
    },
  }, { filename });
  return exports;
}
function sourceFile(relative) {
  const text = readFileSync(resolve(root, relative), "utf8");
  return ts.createSourceFile(relative, text, ts.ScriptTarget.Latest, true);
}
function initializer(source, name) {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText(source) === name) return declaration.initializer;
    }
  }
  throw new Error(`Missing ${name} in ${source.fileName}`);
}
function literalValue(source, name) {
  const context = { module: { exports: undefined } };
  const expression = initializer(source, name).getText(source);
  const output = ts.transpileModule(`module.exports = ${expression};`, { compilerOptions }).outputText;
  vm.runInNewContext(output, context);
  return context.module.exports;
}
const c = loadData("curriculum");
const { plannedPlaygroundDefinitions: planned, plannedLessonExtensions: extensions, curriculumCreationPriorities: priorities } = loadData("planned-curriculum");
const activeSource = sourceFile("src/lib/playground-metadata.ts");
const live = literalValue(activeSource, "activePlaygroundDefinitions");
const all = [...live, ...planned];
const slugs = new Set(all.map(lesson => lesson.slug));
assert.equal(slugs.size, all.length, "Duplicate active/planned slug");
assert.equal(new Set(all.map(lesson => lesson.title.toLowerCase())).size, all.length, "Duplicate lesson title");
const plannedSlugs = new Set(planned.map(lesson => lesson.slug));
const liveSlugs = new Set(live.map(lesson => lesson.slug));
for (const lesson of all) {
  assert.match(lesson.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(lesson.title.trim() && lesson.tag.trim() && lesson.summary.trim(), `Incomplete metadata: ${lesson.slug}`);
  assert.ok(lesson.concepts.length >= 2, `Missing concepts: ${lesson.slug}`);
}
const expectedPriorities = ["cross-validation", "adaptive-optimizers", "decision-trees"];
assert.deepEqual(Array.from(priorities), expectedPriorities, "Creation priorities changed");
assert.deepEqual(Array.from(planned.slice(0, 3), lesson => lesson.slug), expectedPriorities);
// The build queue must not seed or otherwise change learner study order.
const planning = loadData("planned-curriculum");
planning.curriculumCreationPriorities = [...expectedPriorities].reverse();
modules.delete("curriculum");
assert.deepEqual(Array.from(loadData("curriculum").dashboardLessonPlanOrder), Array.from(c.dashboardLessonPlanOrder), "Creation queue leaked into study order");
planning.curriculumCreationPriorities = priorities;
modules.set("curriculum", c);
const core = [
  "mean-median-mode", "variance-standard-deviation", "sampling-sample-size", "sampling-bias",
  "linear-regression-line-fitting", "gradient-descent", "train-test-generalization", "overfitting",
  "class-score-logits", "linear-classification-boundaries", "softmax-temperature",
  "classification-metrics-foundations", "log-loss-confidence-penalties", "regularization",
  "activation-functions", "neural-network-forward-pass", "autograd-graphs",
  "backpropagation-inspector", "neural-network-training-loop", "mnist-mlp-inference-debugger",
];
assert.deepEqual(Array.from(c.coreLessonOrder), core, "The approved 20-step core changed");
assert.ok(core.every(slug => liveSlugs.has(slug)), "A core lesson is no longer published");
const allGroupedUnits = c.lessonGroups.flatMap(group => Array.from(group.chapters));
assert.equal(new Set(allGroupedUnits).size, allGroupedUnits.length, "A unit belongs to multiple chapter groups");
for (const group of c.lessonGroups) {
  assert.equal(group.slug, group.chapters[0], "The first chapter owns the card");
  assert.ok(group.title && group.chapters.length >= 2);
  assert.ok(group.chapters.every(slug => slugs.has(slug)), `Unknown chapter in ${group.slug}`);
  assert.ok(group.chapters.every(slug => liveSlugs.has(slug)) || group.chapters.every(slug => plannedSlugs.has(slug)), `Mixed live/planned chapter group: ${group.slug}`);
  const positions = new Map(Array.from(group.chapters, (slug, index) => [slug, index]));
  for (const slug of group.chapters) for (const p of c.lessonPrerequisites[slug] ?? []) {
    if (positions.has(p.lesson)) assert.ok(positions.get(p.lesson) < positions.get(slug), `Internal chapter order: ${group.slug}`);
  }
}
const groupedChapters = new Set(c.lessonGroups.flatMap(group => group.chapters.slice(1)));
const cards = all.filter(lesson => !groupedChapters.has(lesson.slug));
assert.deepEqual([...new Set(c.dashboardLessonPlanOrder)].sort(), cards.map(lesson => lesson.slug).sort(), "Catalog membership differs from metadata");
assert.equal(c.dashboardLessonPlanOrder.length, cards.length, "Duplicate dashboard card");
assert.equal(new Set(c.learningPaths.map(path => path.id)).size, c.learningPaths.length, "Duplicate path ID");
for (const path of c.learningPaths) {
  assert.equal(new Set(path.lessons).size, path.lessons.length, `Duplicate lesson in ${path.id}`);
  for (const slug of path.lessons) assert.ok(c.dashboardLessonPlanOrder.includes(slug), `Invalid path entry: ${path.id}/${slug}`);
  if (path.parentId) {
    const parent = c.learningPaths.find(p => p.id === path.parentId);
    assert.ok(parent && !parent.parentId && parent.id !== path.id, `Invalid optional branch parent: ${path.id}`);
  }
}
for (const lesson of planned) {
  assert.ok(c.learningPaths.some(path => path.lessons.includes(c.canonicalLessonSlug(lesson.slug))), `Unplaced plan: ${lesson.slug}`);
  assert.ok(lesson.prerequisites.length && lesson.sources.length, `Missing prerequisites/sources: ${lesson.slug}`);
}
function checkOrder(order, label) {
  const positions = new Map(order.map((slug, i) => [slug, i]));
  for (const slug of order) for (const prerequisite of (c.getLessonGroup(slug)?.chapters ?? [slug]).flatMap(chapter => c.lessonPrerequisites[chapter] ?? [])) {
    if (!prerequisite.lesson) continue;
    const dependency = c.canonicalLessonSlug(prerequisite.lesson);
    if (dependency !== slug && positions.has(dependency)) {
      assert.ok(positions.get(dependency) < positions.get(slug), `${label}: ${dependency} must precede ${slug}`);
    }
  }
}
for (const [slug, prerequisites] of Object.entries(c.lessonPrerequisites)) {
  assert.ok(slugs.has(slug), `Unknown prerequisite owner: ${slug}`);
  for (const prerequisite of prerequisites) if (prerequisite.lesson) {
    assert.ok(slugs.has(prerequisite.lesson), `Unknown prerequisite: ${prerequisite.lesson}`);
    assert.ok(!liveSlugs.has(slug) || liveSlugs.has(prerequisite.lesson), `Published lesson depends on an unbuilt plan: ${slug}`);
  }
}
checkOrder(Array.from(c.dashboardLessonPlanOrder), "Dashboard");
for (const path of c.learningPaths) checkOrder(Array.from(path.lessons), path.id);
// Regressions from the semantic ordering review, beyond declared DAG edges.
function beforeInPath(pathId, first, later) {
  const path = c.learningPaths.find(p => p.id === pathId);
  assert.ok(path.lessons.includes(first) && path.lessons.includes(later));
  assert.ok(path.lessons.indexOf(first) < path.lessons.indexOf(later), `${pathId}: ${first} before ${later}`);
}
beforeInPath("classical", "knn-classification", "bagging-random-forests");
beforeInPath("classical", "decision-trees", "boosting");
beforeInPath("model-selection", "learning-curves-data-budgets", "hyperparameter-search");
beforeInPath("training", "weight-initialization", "neural-network-training-loop");
beforeInPath("retrieval", "rag-pipeline", "hybrid-retrieval-reranking");
beforeInPath("projection", "svd-low-rank-approximation", "t-sne-neighborhood-map");
assert.ok(!c.learningPaths.find(p => p.id === "generation").lessons.some(slug => ["bigram-language-model", "fixed-window-language-model", "kv-caching"].includes(slug)), "Basic generation path absorbed optional training/efficiency");
for (const lesson of planned) for (const field of ["chapters", "optionalTopics"]) {
  const outlines = lesson[field] ?? [];
  assert.equal(new Set(outlines.map(chapter => chapter.id)).size, outlines.length, `Duplicate outline ID: ${lesson.slug}/${field}`);
  for (const chapter of outlines) assert.ok(chapter.id && chapter.title && chapter.summary, `Incomplete chapter placeholder: ${lesson.slug}`);
}
// Placeholder consolidation contracts: preserve chapter identity and keep
// foundational paths independent of elective algorithms and task families.
beforeInPath("search", "sequential-decisions-returns", "q-learning");
beforeInPath("evaluation", "classification-metrics-foundations", "cost-sensitive-thresholds");
assert.equal(c.canonicalLessonSlug("backpropagation-through-time"), "backpropagation-through-time", "Temporal credit must remain independently placeable");
assert.equal(c.canonicalLessonSlug("gru-gates"), "lstm-gates", "Gated memory chapters must share one card");
assert.equal(c.canonicalLessonSlug("candidate-reranking"), "hybrid-retrieval-reranking", "Fusion and reranking must retain one navigation card");
const pathById = new Map(c.learningPaths.map(path => [path.id, path]));
assert.equal(pathById.get("transformers").lessons.at(-1), "transformer-block-residual-stream");
for (const [pathId, excluded] of [
  ["relationships", ["bayesian-regression"]],
  ["classical", ["svm-margins", "svm-kernels", "naive-bayes-smoothing"]],
  ["projection", ["gaussian-mixtures-em"]],
  ["nlp-applications", ["token-classification-entities", "crf-sequence-decoding", "extractive-question-answering"]],
  ["generative", ["mse-mae-regression-losses"]],
]) assert.ok(!pathById.get(pathId).lessons.some(slug => excluded.includes(slug)), `Elective entered main path: ${pathId}`);
assert.ok(planned.find(lesson => lesson.slug === "cross-validation").optionalTopics.some(topic => topic.id === "grouped-validation"));
assert.ok(planned.find(lesson => lesson.slug === "mel-frequency-features").optionalTopics.some(topic => topic.id === "mfcc-compression"));
// Check real component imports so metadata alone cannot establish live coverage.
const registry = sourceFile("src/lib/playgrounds.ts");
const imports = new Map();
for (const statement of registry.statements) {
  if (!ts.isImportDeclaration(statement)) continue;
  for (const entry of statement.importClause?.namedBindings?.elements ?? []) imports.set(entry.name.text, statement.moduleSpecifier.text);
}
const registryEntries = initializer(registry, "playgroundComponents").properties;
const registered = new Map(registryEntries.map(entry => [entry.name.text, entry.initializer.text]));
assert.deepEqual([...registered.keys()].sort(), [...liveSlugs].sort(), "Component registry differs from live metadata");
for (const lesson of live) {
  const path = imports.get(registered.get(lesson.slug));
  assert.ok(path?.startsWith("@/modules/"), `No module component for ${lesson.slug}`);
  assert.ok(existsSync(resolve(root, `${path.replace("@/", "src/")}.tsx`)), `Missing component file: ${path}`);
}
const coverage = JSON.parse(readFileSync(resolve(root, "src/lib/notebook-coverage.json"), "utf8"));
const notebooks = new Map(coverage.notebooks.map(entry => [entry.notebook, entry]));
assert.equal(notebooks.size, coverage.notebooks.length, "Duplicate notebook coverage entry");
for (const entry of notebooks.values()) {
  assert.match(entry.notebook, /^[a-z0-9-]+$/);
  assert.match(entry.sourceSha256, /^[a-f0-9]{64}$/);
  if (entry.excludedReason) {
    assert.ok(!entry.lessons?.length && !entry.plannedExtensions?.length, `Excluded source also mapped: ${entry.notebook}`);
    continue;
  }
  assert.ok(entry.lessons?.length || entry.plannedExtensions?.length, `Unreviewed source: ${entry.notebook}`);
  for (const slug of entry.lessons ?? []) assert.ok(slugs.has(slug), `Unknown coverage lesson: ${slug}`);
  for (const owner of entry.plannedExtensions ?? []) assert.ok(extensions.some(e => e.lesson === owner && e.sources.includes(entry.notebook)), `Missing extension contract: ${entry.notebook}/${owner}`);
}
assert.equal(new Set(extensions.map(e => e.lesson)).size, extensions.length, "Duplicate extension owner");
for (const extension of extensions) {
  assert.ok(liveSlugs.has(extension.lesson), `Extension must have a published owner: ${extension.lesson}`);
  assert.ok(extension.summary && extension.concepts.length && extension.sources.length);
  const chapters = extension.chapters ?? [];
  assert.equal(new Set(chapters.map(chapter => chapter.id)).size, chapters.length);
  for (const chapter of chapters) assert.ok(chapter.id && chapter.title && chapter.summary);
}
for (const lesson of planned) for (const name of lesson.sources) {
  assert.ok(notebooks.get(name)?.lessons?.includes(lesson.slug), `Missing source mapping: ${name}/${lesson.slug}`);
}
for (const extension of extensions) for (const name of extension.sources) {
  assert.ok(notebooks.get(name)?.plannedExtensions?.includes(extension.lesson), `Missing extension source mapping: ${name}/${extension.lesson}`);
}
const notebookArgument = process.argv.indexOf("--notebooks");
if (notebookArgument !== -1) {
  assert.ok(process.argv[notebookArgument + 1], "--notebooks requires an active notebook directory");
  const directory = resolve(process.argv[notebookArgument + 1]);
  const files = readdirSync(directory).filter(name => name.endsWith(".ipynb")).sort();
  assert.deepEqual(files.map(name => name.slice(0, -6)), [...notebooks.keys()].sort(), "Active notebook inventory changed; repeat the coverage review");
  for (const filename of files) {
    const notebook = JSON.parse(readFileSync(resolve(directory, filename), "utf8"));
    const cells = notebook.cells.map(cell => [cell.cell_type, Array.isArray(cell.source) ? cell.source.join("") : cell.source]);
    const hash = createHash("sha256").update(JSON.stringify(cells)).digest("hex");
    assert.equal(hash, notebooks.get(filename.slice(0, -6)).sourceSha256, `Notebook source changed since review: ${filename}`);
  }
}
const result = {
  live: live.length, planned: planned.length, extensions: extensions.length,
  plannedCards: cards.filter(lesson => plannedSlugs.has(lesson.slug)).length, branches: c.learningPaths.filter(path => path.parentId).length,
  cards: cards.length, paths: c.learningPaths.length, notebooks: notebooks.size,
  excluded: coverage.notebooks.filter(entry => entry.excludedReason).length,
};
if (process.argv.includes("--json")) console.log(JSON.stringify({ ...result, order: c.dashboardLessonPlanOrder, paths: c.learningPaths, liveLessons: live, plannedLessons: planned, extensionPlans: extensions, groups: c.lessonGroups, coverage }));
else console.log(`Curriculum verified: ${result.live} live routes, ${result.planned} planned units / ${result.plannedCards} planned cards, ${result.extensions} planned extensions, ${result.cards} cards, ${result.paths} paths; ${result.notebooks} notebook dispositions (${result.excluded} excluded).`);
