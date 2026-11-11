import json
from pathlib import Path
import tempfile
import unittest

import startup_profile as profile


def trace():
    return {"traceEvents": [
        {"name": "thread_name", "pid": 1, "tid": 2, "args": {"name": "CrRendererMain"}},
        {"name": "navigationStart", "pid": 1, "tid": 2, "ts": 1_000_000,
         "args": {"data": {"documentLoaderURL": profile.TARGET}}},
        {"name": "Profile", "pid": 1, "tid": 2, "ts": 1_000_000, "id": "a",
         "args": {"data": {"startTime": 1_000_000}}},
        {"name": "ProfileChunk", "pid": 1, "tid": 2, "ts": 1_020_000, "id": "a",
         "args": {"data": {"cpuProfile": {"nodes": [
             {"id": 1, "callFrame": {"functionName": "hydrateRoot", "url": profile.TARGET + "_next/static/chunks/app.js?token=do-not-log", "lineNumber": 0, "columnNumber": 12}},
             {"id": 2, "callFrame": {"functionName": "run", "url": profile.TARGET + "cdn-cgi/challenge/secret", "lineNumber": 2, "columnNumber": 3}},
         ], "samples": [1, 2]}, "timeDeltas": [10000, 10000]}}},
    ]}


class StartupProfileTests(unittest.TestCase):
    def test_source_never_includes_queries_credentials_or_third_party_paths(self):
        self.assertEqual(profile.source(profile.TARGET + "_next/static/chunks/app.js?token=private"), "application:app.js")
        self.assertEqual(profile.source("https://user:secret@other.example/key"), "third-party")
        self.assertEqual(profile.source("data:text/javascript,secret"), "unattributed")
        self.assertEqual(profile.symbol("name\n::warning::payload"), "<anonymous>")

    def test_cpu_self_time_and_before_lcp_clip_at_the_paint_boundary(self):
        output = profile.functions(trace(), 15)
        self.assertEqual(output["samples"], 2)
        self.assertTrue(output["beforeLcpAvailable"])
        rows = {r["function"]: r for r in output["topFunctions"]}
        self.assertEqual(rows["hydrateRoot"]["beforeLcpMs"], 10)
        self.assertEqual(rows["run"]["beforeLcpMs"], 5)
        self.assertEqual(rows["run"]["selfMs"], 10)
        self.assertNotIn("secret", json.dumps(output))
        self.assertNotIn("do-not-log", json.dumps(output))

    def test_before_lcp_excludes_time_before_navigation(self):
        data = trace()
        data["traceEvents"][2]["args"]["data"]["startTime"] = 990_000
        output = profile.functions(data, 15)
        rows = {r["function"]: r for r in output["topFunctions"]}
        self.assertEqual(rows["hydrateRoot"]["beforeLcpMs"], 0)
        self.assertEqual(rows["run"]["beforeLcpMs"], 10)

    def test_missing_sample_clock_marks_paint_attribution_unavailable(self):
        data = trace()
        data["traceEvents"][2]["args"]["data"].pop("startTime")
        output = profile.functions(data, 15)
        self.assertEqual(output["samples"], 2)
        self.assertFalse(output["beforeLcpAvailable"])
        self.assertTrue(all(row["beforeLcpMs"] is None for row in output["topFunctions"]))

    def test_trace_order_does_not_change_profile_results(self):
        data = trace()
        expected = profile.functions(data, 15)
        data["traceEvents"].reverse()
        self.assertEqual(profile.functions(data, 15), expected)

    def test_worker_samples_are_not_misreported_as_main_thread(self):
        data = trace()
        extra = json.loads(json.dumps(data["traceEvents"][-1]))
        extra["tid"] = 9
        extra["id"] = "worker"
        anchor = json.loads(json.dumps(data["traceEvents"][2]))
        anchor["tid"], anchor["id"] = 9, "worker"
        data["traceEvents"].extend([anchor, extra])
        self.assertEqual(profile.functions(data, 15)["samples"], 2)

    def test_helper_thread_chunks_belong_to_their_renderer_profile_owner(self):
        data = trace()
        expected = profile.functions(data, 15)
        data["traceEvents"][-1]["tid"] = 14
        self.assertEqual(profile.functions(data, 15), expected)

    def test_unanchored_helper_chunks_are_not_guessed_as_main_thread(self):
        data = trace()
        data["traceEvents"][-1]["tid"] = 14
        data["traceEvents"] = [e for e in data["traceEvents"] if e["name"] != "Profile"]
        with self.assertRaisesRegex(ValueError, "no renderer CPU samples"):
            profile.functions(data, 15)

    def test_ambiguous_profile_owner_is_rejected(self):
        data = trace()
        anchor = json.loads(json.dumps(data["traceEvents"][2]))
        anchor["tid"] = 9
        data["traceEvents"].append(anchor)
        with self.assertRaisesRegex(ValueError, "multiple thread owners"):
            profile.functions(data, 15)

    def test_missing_sampling_or_duration_mismatch_is_an_explicit_failure(self):
        data = trace()
        data["traceEvents"] = data["traceEvents"][:2]
        with self.assertRaisesRegex(ValueError, "no renderer CPU samples"):
            profile.functions(data, 15)
        data = trace()
        data["traceEvents"][-1]["args"]["data"]["timeDeltas"] = [1]
        with self.assertRaisesRegex(ValueError, "lengths differ"):
            profile.functions(data, 15)

    def test_other_renderer_main_threads_are_excluded(self):
        data = trace()
        extra = json.loads(json.dumps(data["traceEvents"][-1]))
        extra["pid"], extra["tid"] = 9, 14
        anchor = json.loads(json.dumps(data["traceEvents"][2]))
        anchor["pid"] = 9
        data["traceEvents"].extend([
            {"name": "thread_name", "pid": 9, "tid": 2, "args": {"name": "CrRendererMain"}},
            anchor, extra,
        ])
        self.assertEqual(profile.functions(data, 15)["samples"], 2)

    def test_missing_navigation_marks_before_lcp_unavailable(self):
        data = trace()
        data["traceEvents"] = [e for e in data["traceEvents"] if e["name"] != "navigationStart"]
        output = profile.functions(data, 15)
        self.assertFalse(output["beforeLcpAvailable"])
        self.assertIsNone(output["topFunctions"][0]["beforeLcpMs"])

    def test_structure_reports_threads_and_container_counts_without_trace_content(self):
        data = trace()
        data["traceEvents"][-1]["args"]["data"]["private-key"] = "do-not-log"
        output = profile.structure(data)
        self.assertEqual(output["rendererMainThreads"], [{"pid": 1, "tid": 2}])
        self.assertEqual(output["targetNavigationThreads"], [{"pid": 1, "tid": 2}])
        self.assertEqual(output["cpuThreads"][0]["nestedSamples"], 2)
        self.assertEqual(output["cpuThreads"][0]["deltas"], 2)
        self.assertEqual(output["cpuThreads"][0]["nodes"], 2)
        for private in ("private-key", "do-not-log", "secret", "hydrateRoot", profile.HOST):
            self.assertNotIn(private, json.dumps(output))

    def test_structure_exposes_mismatched_threads_without_accepting_worker_samples(self):
        data = trace()
        for event in data["traceEvents"]:
            if event["name"] in ("Profile", "ProfileChunk"):
                event["tid"] = 9
        output = profile.structure(data)
        self.assertEqual(output["cpuThreads"][0]["tid"], 9)
        self.assertEqual(output["rendererMainThreads"][0]["tid"], 2)
        with self.assertRaisesRegex(ValueError, "no renderer CPU samples"):
            profile.functions(data, 15)

    def test_cleanup_preserves_existing_artifacts_and_unrelated_files(self):
        with tempfile.TemporaryDirectory(prefix="startup-profile-test-") as directory:
            root = Path(directory)
            old = root / "aigrounds.tsilva.eu_2026-11-11_12-00-00-0.trace.json"
            new = root / "aigrounds.tsilva.eu_2026-11-11_13-00-00-0.trace.json"
            other = root / "other.json"
            for path in (old, new, other):
                path.write_text("{}")
            guard = root / "guard.json"
            guard.write_text(json.dumps({"workspace": str(root.resolve()), "before": [old.name]}))
            profile.cleanup(root, guard)
            self.assertTrue(old.exists() and other.exists())
            self.assertFalse(new.exists() or guard.exists())

    def test_cleanup_refuses_symlinks(self):
        with tempfile.TemporaryDirectory(prefix="startup-profile-test-") as directory:
            root = Path(directory)
            other = root / "other.json"
            other.write_text("{}")
            path = root / "aigrounds.tsilva.eu_2026-11-11_13-00-00-0.trace.json"
            path.symlink_to(other)
            guard = root / "guard.json"
            guard.write_text(json.dumps({"workspace": str(root.resolve()), "before": []}))
            with self.assertRaisesRegex(ValueError, "asset type"):
                profile.cleanup(root, guard)
            self.assertTrue(other.exists())

    def test_report_time_matches_trace_even_at_icu_midnight(self):
        with tempfile.TemporaryDirectory(prefix="startup-profile-test-") as directory:
            root = Path(directory)
            path = root / "aigrounds.tsilva.eu_2026-11-11_24-01-02-0.trace.json"
            path.write_text("{}")
            self.assertEqual(profile.trace_for(root, {"fetchTime": "2026-11-11T00:01:02Z"}), path)


if __name__ == "__main__":
    unittest.main()
