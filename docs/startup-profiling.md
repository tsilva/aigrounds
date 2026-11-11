# Startup profiling

Run the manual **Startup CPU profile** workflow when a performance investigation
needs function attribution for each sample:

```sh
gh workflow run startup-profile.yml --ref main
```

It uses the same pinned Lighthouse action, public homepage, desktop preset,
three-run policy and analytics blocklist as the regular audit. It additionally
enables V8 CPU sampling, which the pinned Lighthouse version disables by default.
Sampling can affect timings: these are diagnostic results, not fleet score
verification. The regular Lighthouse CI workflow remains authoritative.

The job logs bounded main-thread function summaries, including sampled self time
before observed LCP when a navigation marker is available. Function names may be
minified; locations refer to the emitted script. The reader omits headers, page
content, source text, URL queries and third-party URL paths. It publishes no raw
trace/network artifacts or public report, and removes newly created raw files
without deleting pre-existing files. No application/provider secrets are passed
to the profiling process. If Chrome's profile format or thread association cannot
be read, the job fails and emits bounded numeric thread/event/container counts
for diagnosis. These counts omit function names, URLs and trace contents.

Reader tests are dependency-free:

```sh
python3 -B -m unittest discover -s scripts -p test_startup_profile.py
```
