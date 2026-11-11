"""Summarize public-homepage CPU samples without publishing raw browser artifacts."""

import argparse
from collections import Counter, defaultdict
from datetime import datetime, timezone
import json
import math
from pathlib import Path
import re
from urllib.parse import urlsplit

TARGET = "https://aigrounds.tsilva.eu/"
HOST = "aigrounds.tsilva.eu"
VERSION = "12.6.1"
BLOCKED = [
    "https://www.googletagmanager.com/gtag/js*",
    "https://www.googletagmanager.com/gtm.js*",
    "https://*.google-analytics.com/*",
    "https://analytics.google.com/g/collect*",
    "https://stats.g.doubleclick.net/g/collect*",
]
ASSET = re.compile(r"aigrounds\.tsilva\.eu_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-0\.(trace|devtoolslog)\.json")


def is_target(url):
    parsed = urlsplit(url)
    return (parsed.scheme == "https" and parsed.hostname == HOST
            and parsed.port in (None, 443) and not parsed.username and not parsed.password
            and parsed.path in ("", "/") and not parsed.query and not parsed.fragment)


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def source(url):
    try:
        parsed = urlsplit(url or "")
    except ValueError:
        return "unattributed"
    if parsed.hostname == HOST:
        if parsed.path.startswith("/cdn-cgi/"):
            return "cloudflare-challenge"
        if parsed.path.startswith("/_next/static/"):
            name = parsed.path.rsplit("/", 1)[-1]
            if re.fullmatch(r"[A-Za-z0-9_.~-]{1,100}\.js", name):
                return "application:" + name
        return "document" if parsed.path in ("", "/") else "first-party"
    if parsed.hostname == "static.cloudflareinsights.com":
        return "cloudflare-beacon"
    return "third-party" if parsed.scheme in ("https", "http") else "unattributed"


def symbol(value):
    if isinstance(value, str) and re.fullmatch(r"[A-Za-z_$().<> :][A-Za-z0-9_$().<> :/-]{0,79}", value):
        return value
    return "<anonymous>"


def structure(trace):
    """Numeric topology only, for diagnosing Chrome trace schema/thread changes."""
    renderers, navigations = set(), set()
    profiles = defaultdict(lambda: Counter())
    for event in trace["traceEvents"]:
        pid, tid = event.get("pid"), event.get("tid")
        if type(pid) is not int or type(tid) is not int:
            continue
        name = event.get("name")
        data = event.get("args", {}).get("data", {})
        if name == "thread_name" and event.get("args", {}).get("name") == "CrRendererMain":
            renderers.add((pid, tid))
        if name == "navigationStart" and is_target(data.get("documentLoaderURL", "")):
            navigations.add((pid, tid))
        if name not in ("Profile", "ProfileChunk", "CpuProfile"):
            continue
        row = profiles[(pid, tid)]
        row[name] += 1
        cpu = data.get("cpuProfile", data if name == "CpuProfile" else {})
        for output, value in (("nodes", cpu.get("nodes")),
                              ("nestedSamples", cpu.get("samples")),
                              ("outerSamples", data.get("samples")),
                              ("deltas", data.get("timeDeltas", cpu.get("timeDeltas")))):
            if isinstance(value, list):
                row[output] += len(value)
    return {
        "rendererMainThreads": [{"pid": p, "tid": t} for p, t in sorted(renderers)[:15]],
        "targetNavigationThreads": [{"pid": p, "tid": t} for p, t in sorted(navigations)[:15]],
        "cpuThreads": [{"pid": p, "tid": t, **counts}
                       for (p, t), counts in sorted(profiles.items())[:15]],
        "threadCounts": {"renderers": len(renderers), "navigations": len(navigations),
                         "profiles": len(profiles)},
    }


def functions(trace, observed_lcp):
    events = trace["traceEvents"]
    main = {(e.get("pid"), e.get("tid")) for e in events
            if e.get("name") == "thread_name" and e.get("args", {}).get("name") == "CrRendererMain"}
    if not main:
        raise ValueError("Trace does not identify renderer main threads.")
    starts = [(e["ts"], (e["pid"], e["tid"])) for e in events if e.get("name") == "navigationStart"
              and (e.get("pid"), e.get("tid")) in main and number(e.get("ts"))
              and is_target(e.get("args", {}).get("data", {}).get("documentLoaderURL", ""))]
    if starts:
        start, target_thread = min(starts)
        main = {target_thread}
    elif len(main) != 1:
        raise ValueError("Cannot identify the audited page's renderer thread.")
    cutoff = start + observed_lcp * 1000 if starts and number(observed_lcp) else None
    profiles = defaultdict(lambda: {"nodes": {}, "cursor": None})
    totals = defaultdict(lambda: [0.0, 0.0, 0])
    sampled = 0
    for event in sorted(events, key=lambda e: e.get("ts", 0)):
        if (event.get("pid"), event.get("tid")) not in main:
            continue
        name = event.get("name")
        if name not in ("Profile", "ProfileChunk", "CpuProfile"):
            continue
        identity = event.get("id", event.get("id2", {}).get("local", "default"))
        state = profiles[(event["pid"], event["tid"], str(identity))]
        data = event.get("args", {}).get("data", {})
        if name == "Profile":
            state["cursor"] = data.get("startTime") if number(data.get("startTime")) else None
            continue
        profile = data.get("cpuProfile", data if name == "CpuProfile" else {})
        if state["cursor"] is None and number(profile.get("startTime")):
            state["cursor"] = profile["startTime"]
        for node in profile.get("nodes", []):
            state["nodes"][node["id"]] = node.get("callFrame", {})
        samples = profile.get("samples", [])
        deltas = data.get("timeDeltas", profile.get("timeDeltas", []))
        if len(samples) != len(deltas):
            raise ValueError("CPU sample/duration lengths differ.")
        for node_id, delta in zip(samples, deltas):
            if not number(delta) or not 0 <= delta <= 60_000_000:
                raise ValueError("Invalid CPU sample duration.")
            cursor = state["cursor"]
            end = cursor + delta if cursor is not None else None
            state["cursor"] = end
            frame = state["nodes"].get(node_id)
            if frame is None:
                raise ValueError("CPU sample references an unknown frame.")
            key = (source(frame.get("url")), symbol(frame.get("functionName")),
                   frame.get("lineNumber", -1), frame.get("columnNumber", -1))
            if not all(type(value) is int for value in key[2:]):
                raise ValueError("Invalid CPU frame location.")
            row = totals[key]
            row[0] += delta / 1000
            if cutoff is not None and cursor is not None:
                row[1] += max(0, min(end, cutoff) - cursor) / 1000
            row[2] += 1
            sampled += 1
    if not sampled:
        names = Counter(e.get("name") for e in events if e.get("name") in ("Profile", "ProfileChunk", "CpuProfile"))
        raise ValueError("Trace has no renderer CPU samples; event counts=" + json.dumps(names))
    rows = [{"source": key[0], "function": key[1], "line": key[2], "column": key[3],
             "selfMs": round(value[0], 2),
             "beforeLcpMs": round(value[1], 2) if cutoff is not None else None,
             "samples": value[2]} for key, value in totals.items()]
    sources = defaultdict(float)
    for row in rows:
        sources[row["source"]] += row["selfMs"]
    return {"samples": sampled, "beforeLcpAvailable": cutoff is not None,
            "selfMsBySource": {key: round(value, 2) for key, value in sorted(sources.items())},
            "topFunctions": sorted(rows, key=lambda r: r["selfMs"], reverse=True)[:15],
            "topBeforeLcp": sorted(rows, key=lambda r: r["beforeLcpMs"] or 0, reverse=True)[:15]}


def trace_for(workspace, report):
    date = datetime.fromisoformat(report["fetchTime"].replace("Z", "+00:00")).astimezone(timezone.utc)
    prefix = date.strftime(HOST + "_%Y-%m-%d_%H-%M-%S")
    prefixes = [prefix]
    if date.hour == 0:  # ICU's en-US hour cycle may render midnight as 24.
        prefixes.append(prefix[:-8] + "24" + prefix[-6:])
    paths = [workspace / (p + "-0.trace.json") for p in prefixes]
    found = [p for p in paths if p.is_file() and not p.is_symlink()]
    if len(found) != 1:
        raise ValueError("Expected one trace matching the report's fetch time.")
    return found[0]


def summarize(workspace, manifest):
    workspace = workspace.resolve()
    if len(manifest) != 3:
        raise ValueError("Expected exactly three samples.")
    reports = []
    for entry in manifest:
        path = Path(entry["jsonPath"]).resolve()
        if path.parent != workspace / ".lighthouseci" or not path.name.endswith(".report.json"):
            raise ValueError("Unexpected report path.")
        report = json.loads(path.read_text())
        if report["lighthouseVersion"] != VERSION or not is_target(report["finalDisplayedUrl"]):
            raise ValueError("Unexpected Lighthouse version or audited destination.")
        reports.append((report, entry))
    for sample, (report, entry) in enumerate(sorted(reports, key=lambda item: item[0]["fetchTime"]), 1):
        path = trace_for(workspace, report)
        if path.stat().st_size > 200_000_000:
            raise ValueError("Trace exceeds the bounded reader limit.")
        metrics = report["audits"]["metrics"]["details"]["items"][0]
        trace = json.loads(path.read_text())
        try:
            profile = functions(trace, metrics.get("observedLargestContentfulPaint"))
        except ValueError:
            print("STARTUP_PROFILE_STRUCTURE " + json.dumps(
                {"sample": sample, "diagnosticOnly": True, **structure(trace)},
                separators=(",", ":"), allow_nan=False), flush=True)
            raise
        output = {"sample": sample, "diagnosticOnly": True, "lighthouse": VERSION,
                  "representative": entry.get("isRepresentativeRun") is True,
                  "performance": entry["summary"]["performance"],
                  "benchmarkIndex": report["environment"].get("benchmarkIndex"),
                  "metrics": {key: metrics.get(key) for key in ("timeToFirstByte", "firstContentfulPaint",
                      "largestContentfulPaint", "observedLargestContentfulPaint", "totalBlockingTime")},
                  **profile}
        print("STARTUP_PROFILE " + json.dumps(output, separators=(",", ":"), allow_nan=False))


def cleanup(workspace, guard):
    state = json.loads(guard.read_text())
    if state["workspace"] != str(workspace.resolve()):
        raise ValueError("Cleanup workspace differs from collection workspace.")
    for path in workspace.iterdir():
        if ASSET.fullmatch(path.name) and path.name not in state["before"]:
            if path.is_symlink() or not path.is_file():
                raise ValueError("Refusing an unexpected trace asset type.")
            path.unlink()
    guard.unlink()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("configure", "summarize", "cleanup"))
    parser.add_argument("--output", type=Path)
    parser.add_argument("--guard", type=Path)
    args = parser.parse_args()
    if args.command == "configure":
        if args.output is None or args.guard is None:
            parser.error("configure requires --output and --guard")
        with args.guard.open("x") as handle:
            json.dump({"workspace": str(Path.cwd().resolve()),
                       "before": [p.name for p in Path.cwd().iterdir() if ASSET.fullmatch(p.name)]}, handle)
        args.output.write_text(json.dumps({"ci": {"collect": {"url": [TARGET], "numberOfRuns": 3,
            "settings": {"preset": "desktop", "blockedUrlPatterns": BLOCKED, "saveAssets": True,
                         "additionalTraceCategories": ["disabled-by-default-v8.cpu_profiler"]}}}}))
    elif args.command == "summarize":
        import os
        summarize(Path.cwd(), json.loads(os.environ["LIGHTHOUSE_MANIFEST"]))
    else:
        if args.guard is None:
            parser.error("cleanup requires --guard")
        cleanup(Path.cwd(), args.guard)


if __name__ == "__main__":
    main()
