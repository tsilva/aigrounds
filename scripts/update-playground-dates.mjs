import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const datesFile = new URL("../src/lib/playground-updates.json", import.meta.url);
const savedDates = JSON.parse(readFileSync(datesFile, "utf8"));

function git(...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

let history;
let shallowCommits;
try {
  // A shallow boundary makes every file appear changed; never use it as an
  // update date. Retain checked-in dates for history unavailable in this clone.
  const shallowFile = git("rev-parse", "--git-path", "shallow");
  shallowCommits = git("rev-parse", "--is-shallow-repository") === "true"
    ? new Set(readFileSync(resolve(root, shallowFile), "utf8").trim().split("\n"))
    : new Set();
  history = git("log", "--format=commit:%H:%cI", "--name-only", "--", "src/modules");
} catch {
  console.warn("Git history unavailable; keeping saved playground update dates.");
  process.exit(0);
}

const dates = { ...savedDates };
let timestamp;
let includeCommit = false;
for (const line of history.split("\n")) {
  if (line.startsWith("commit:")) {
    const [, hash, date] = line.match(/^commit:([^:]+):(.+)$/);
    timestamp = new Date(date).toISOString();
    includeCommit = !shallowCommits.has(hash);
    continue;
  }

  const slug = line.match(/^src\/modules\/([^/]+)\//)?.[1];
  if (includeCommit && slug && (!dates[slug] || timestamp > dates[slug])) {
    dates[slug] = timestamp;
  }
}

const modules = readdirSync(new URL("../src/modules/", import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const output = JSON.stringify(Object.fromEntries(
  modules.filter((slug) => dates[slug]).map((slug) => [slug, dates[slug]]),
), null, 2) + "\n";
if (output !== readFileSync(datesFile, "utf8")) writeFileSync(datesFile, output);
