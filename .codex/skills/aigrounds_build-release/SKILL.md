---
name: aigrounds_build-release
description: Build, publish and verify the AIGrounds website through its existing GitHub Actions production delivery.
---

# Build Release

Read the installed `$private-skills_release-workflow` and the repository's
[AGENTS.md](../../../AGENTS.md), [production delivery](../../../docs/production-delivery.md)
and current CI, secret-scanning, production-delivery and Lighthouse workflows.
This adapter covers website delivery, with no version bump, tag, GitHub Release
or generated release notes. A bare invocation prepares local checks only.
Publication requires the caller's authorization.

Use the existing `main` branch and `tsilva/aigrounds` destination. Require a clean,
synchronized starting tree. A focused dirty candidate may proceed only when its
complete diff belongs to the authorized task and has passed the checks below;
preserve unrelated work and stop on divergence.

Install with `pnpm install --frozen-lockfile --ignore-scripts`. Run the current CI
gates: `pnpm audit --audit-level low`, `pnpm test:deps`, `pnpm test:home`,
`pnpm lint`, `pnpm typecheck`, `pnpm check:cycles` and `pnpm build`.
Run checks and builds sequentially. Reuse passing results for an identical source
and lockfile. Verify affected flows in Brave at desktop and mobile widths,
including catalogue search/order, published lesson navigation and the mobile
lesson restriction. For startup or instrumentation changes, verify local error
collection without injecting errors or private data into production.

Keep credentials in the existing approved routes. Ordinary local builds use
public configuration and synthetic/local services; they must not fetch Production
secrets. Preserve dependency hardening, monitoring, security and provider routing.

For authorized publication, review and stage only intended files, commit the
validated tree and push `main` through the installed `$private-skills_push`.
Capture the full SHA. Its normal main-push CI triggers Production delivery;
do not dispatch a duplicate delivery. Require that SHA's CI, secret scanning and
Production delivery to succeed. Preserve the trusted synchronization, prebuilt
artifact checks and source-map upload gates defined by the current workflows.
Stop at failures or superseded source instead of bypassing checks.

Verify Vercel project `aigrounds` has an exact-SHA READY Production deployment
and that `aigrounds.tsilva.eu` serves that deployment. Check affected live flows
in Brave. For performance work, reuse a matching post-promotion normal Lighthouse
run or dispatch the existing `lighthouse-ci.yml` once on `main`; verify its serving
revision and established three-sample desktop configuration. Report representative
scores and ranges, separately from local diagnostics. Keep QA/evidence under the
repository's ignored `.internal/` policy. Report push and description reconciliation
separately, and leave incomplete checks explicit.
