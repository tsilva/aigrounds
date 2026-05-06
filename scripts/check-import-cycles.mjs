import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const extensions = [".ts", ".tsx"];
const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"()]*?\s+from\s+)?["']([^"']+)["']/g;

function collectSourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(fullPath);
    }

    return extensions.includes(path.extname(entry.name)) ? [fullPath] : [];
  });
}

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) {
    return undefined;
  }

  const basePath = specifier.startsWith("@/")
    ? path.join(srcDir, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);

  for (const extension of extensions) {
    const filePath = `${basePath}${extension}`;

    if (existsSync(filePath)) {
      return filePath;
    }
  }

  for (const extension of extensions) {
    const filePath = path.join(basePath, `index${extension}`);

    if (existsSync(filePath)) {
      return filePath;
    }
  }

  return undefined;
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

const files = collectSourceFiles(srcDir);
const graph = new Map(files.map((file) => [file, []]));

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const imports = source.matchAll(importPattern);

  for (const match of imports) {
    const specifier = match[1];
    const resolved = specifier ? resolveImport(file, specifier) : undefined;

    if (resolved && graph.has(resolved)) {
      graph.get(file).push(resolved);
    }
  }
}

const visited = new Set();
const active = new Set();
const stack = [];
const cycles = [];

function visit(file) {
  if (active.has(file)) {
    cycles.push([...stack.slice(stack.indexOf(file)), file]);
    return;
  }

  if (visited.has(file)) {
    return;
  }

  visited.add(file);
  active.add(file);
  stack.push(file);

  for (const dependency of graph.get(file) ?? []) {
    visit(dependency);
  }

  stack.pop();
  active.delete(file);
}

for (const file of files) {
  visit(file);
}

if (cycles.length > 0) {
  console.error("Import cycles detected:");

  for (const cycle of cycles) {
    console.error(`- ${cycle.map(relative).join(" -> ")}`);
  }

  process.exit(1);
}

console.log(`No import cycles found across ${files.length} source files.`);
