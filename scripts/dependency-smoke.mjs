import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const virtualRequire = createRequire(
  new URL("../node_modules/.pnpm/node_modules/security-smoke.cjs", import.meta.url),
);
const exactRequire = (path) => createRequire(new URL(`../node_modules/.pnpm/${path}/package.json`, import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const lock = fs.readFileSync(new URL("../pnpm-lock.yaml", import.meta.url), "utf8");

for (const dependencies of [packageJson.dependencies, packageJson.devDependencies]) {
  for (const specifier of Object.values(dependencies ?? {})) {
    assert.doesNotMatch(specifier, /^(?:git(?:\+|:)|https?:|file:|link:|workspace:)/i);
  }
}
assert.doesNotMatch(lock, /(?:git\+|github\.com\/|\b(?:file|link):|\btarball:)/i);

for (const expected of [
  "'@babel/core@7.29.7':",
  "'@opentelemetry/core@2.10.0':",
  "brace-expansion@1.1.18:",
  "brace-expansion@5.0.9:",
  "fast-uri@3.1.5:",
  "js-yaml@4.3.1:",
  "nanoid@3.3.18:",
  "postcss@8.5.23:",
  "postcss@8.5.26:",
]) {
  assert.ok(lock.includes(expected), `missing fixed lock entry: ${expected}`);
}

const fastUri = exactRequire("fast-uri@3.1.5/node_modules/fast-uri")("fast-uri");
assert.equal(fastUri.parse("https://trusted.example/playground").host, "trusted.example");
for (const maliciousUri of [
  "https://trusted.example\\@evil.example/playground",
  "https:\\\\evil.example/playground",
]) {
  assert.match(fastUri.parse(maliciousUri).error, /literal backslash/i);
}

const braceV1 = exactRequire("brace-expansion@1.1.18/node_modules/brace-expansion")("brace-expansion");
const braceV5Module = exactRequire("brace-expansion@5.0.9/node_modules/brace-expansion")("brace-expansion");
const braceV5 = braceV5Module.expand ?? braceV5Module;
const expansionStarted = Date.now();
assert.equal(braceV1("{}".repeat(40)).length, 1);
assert.equal(braceV5("{}".repeat(40), { max: 1_000 }).length, 1);
assert.equal(braceV5("{1..1000000000}", { max: 1_000 }).length, 1_000);
assert.ok(Date.now() - expansionStarted < 1_000, "brace expansion limits were not applied promptly");
assert.deepEqual(braceV5("lesson-{train,test}"), ["lesson-train", "lesson-test"]);

const yaml = exactRequire("js-yaml@4.3.1/node_modules/js-yaml")("js-yaml");
const orderedMap = `!!omap\n${Array.from({ length: 20_000 }, (_, index) => `- key${index}: ${index}`).join("\n")}\n`;
const yamlStarted = Date.now();
assert.equal(yaml.load(orderedMap).length, 20_000);
assert.ok(Date.now() - yamlStarted < 1_000, "JS-YAML ordered-map parsing was not bounded linearly");
assert.deepEqual(yaml.load("lesson:\n  title: Probability\n  active: true\n"), {
  lesson: { title: "Probability", active: true },
});

const { ROOT_CONTEXT, propagation } = virtualRequire("@opentelemetry/api");
const { W3CBaggagePropagator } = virtualRequire("@opentelemetry/core");
const oversizedBaggage = Array.from({ length: 1_000 }, (_, index) => `key${index}=value`).join(",");
const extractedContext = new W3CBaggagePropagator().extract(
  ROOT_CONTEXT,
  { baggage: oversizedBaggage },
  { get: (carrier, key) => carrier[key], keys: (carrier) => Object.keys(carrier) },
);
assert.equal(propagation.getBaggage(extractedContext).getAllEntries().length, 180);

const temporaryDirectory = await mkdtemp(join(tmpdir(), "aigrounds-postcss-"));
const secretPath = join(temporaryDirectory, "secret.map");
await writeFile(secretPath, "AIGROUNDS_SECRET_SENTINEL");
const originalReadFileSync = fs.readFileSync;
let secretWasRead = false;
fs.readFileSync = function guardedRead(path, ...args) {
  if (typeof path === "string" && resolve(path) === resolve(secretPath)) secretWasRead = true;
  return originalReadFileSync.call(this, path, ...args);
};
try {
  const postcss = exactRequire("postcss@8.5.26/node_modules/postcss")("postcss");
  const result = await postcss().process(
    `a{color:red}\n/*# sourceMappingURL=${secretPath} */`,
    { from: undefined },
  );
  assert.equal(result.css, "a{color:red}");
  assert.equal(secretWasRead, false, "PostCSS followed an attacker-controlled source map path");
} finally {
  fs.readFileSync = originalReadFileSync;
  await rm(temporaryDirectory, { recursive: true });
}
