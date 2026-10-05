import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];
let references = 0;

async function source(relative) {
  const file = path.join(root, relative);
  return ts.createSourceFile(file, await readFile(file, "utf8"), ts.ScriptTarget.Latest, true);
}

function declaration(file, name) {
  let result;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === name) result = node.initializer;
    ts.forEachChild(node, visit);
  }
  visit(file);
  while (result && (ts.isAsExpression(result) || ts.isSatisfiesExpression(result))) result = result.expression;
  return result;
}

const metadataFile = await source("src/lib/playground-metadata.ts");
const metadata = declaration(metadataFile, "activePlaygroundDefinitions");
const registryFile = await source("src/lib/playgrounds.ts");
const registry = declaration(registryFile, "playgroundComponents");
if (!metadata || !ts.isArrayLiteralExpression(metadata) || !registry || !ts.isObjectLiteralExpression(registry)) {
  throw new Error("Cannot resolve the lesson metadata or component registry.");
}
const components = new Map(registry.properties.map(property => [property.name.text, property.initializer.getText(registryFile)]));
const imports = new Map();
for (const statement of registryFile.statements) {
  if (!ts.isImportDeclaration(statement) || !statement.importClause?.namedBindings || !ts.isNamedImports(statement.importClause.namedBindings)) continue;
  for (const binding of statement.importClause.namedBindings.elements) imports.set(binding.name.text, statement.moduleSpecifier.text);
}
for (const lesson of metadata.elements) {
  const fields = new Map(lesson.properties.map(property => [property.name.text, property.initializer]));
  const slug = fields.get("slug").text;
  if (fields.get("layout")?.text !== "guided-discovery") failures.push(`${slug}: missing guided-discovery layout`);
  const modulePath = imports.get(components.get(slug));
  if (!modulePath?.startsWith("@/modules/")) { failures.push(`${slug}: missing registered module`); continue; }
  const text = await readFile(path.join(root, "src", `${modulePath.slice(2)}.tsx`), "utf8");
  if (!/<LearningPage\b/.test(text)) failures.push(`${slug}: missing shared LearningPage`);
}

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await inspect(file); continue; }
    if (!/\.(tsx?|css)$/.test(file)) continue;
    const text = await readFile(file, "utf8");
    const relative = path.relative(root, file);
    if (/var\(--font-mono\)/.test(text)) failures.push(`${relative}: use the IBM Plex Mono font token`);
    if (relative.startsWith("src/modules/") && entry.name.endsWith(".css") && /\.evidence\b/.test(text)) failures.push(`${relative}: use shared evidence styles`);
    if (!entry.name.endsWith(".tsx")) continue;
    const parsed = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const statement of parsed.statements) {
      if (!ts.isImportDeclaration(statement) || !statement.importClause?.name || !statement.moduleSpecifier.text.endsWith(".module.css")) continue;
      const alias = statement.importClause.name.text;
      const specifier = statement.moduleSpecifier.text;
      const cssPath = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2)) : path.resolve(directory, specifier);
      const css = await readFile(cssPath, "utf8");
      const classes = new Set([...css.matchAll(/\.([A-Za-z_]\w*)/g)].map(match => match[1]));
      function visit(node) {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === alias) {
          references++;
          if (!classes.has(node.name.text)) failures.push(`${relative}: missing CSS class ${alias}.${node.name.text}`);
        }
        ts.forEachChild(node, visit);
      }
      visit(parsed);
    }
  }
}
await inspect(path.join(root, "src"));
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Learning design checks passed: ${metadata.elements.length} lessons, ${references} CSS references.`);
}
