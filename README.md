<p align="center">
  <img src="logo.png" alt="AI Grounds" width="420" />
  <br />
  <!-- repo-tagline:start -->
  <strong>🧠 Learn AI by experimenting with algorithms 🔬</strong>
  <!-- repo-tagline:end -->
  <br />
  <a href="https://aigrounds.tsilva.eu">Live Demo</a>
</p>

<p align="center">
  <a href="https://github.com/tsilva/aigrounds/actions/workflows/ci.yml"><img src="https://github.com/tsilva/aigrounds/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status on main" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/tsilva/aigrounds" alt="MIT license" /></a>
</p>

AI Grounds is a web app for people learning artificial intelligence through hands-on experiments. Move data points, tune parameters, and step through algorithms to see how their behavior changes. Try the [live playgrounds](https://aigrounds.tsilva.eu) to explore statistics, probability, neural networks, and more.

The gallery follows a learning sequence and distinguishes published lessons from planned ones. Many lessons guide you through **Predict → Try → Explain**, with an optional AI Guide to talk through the result. Use a desktop or laptop: screens below 768 pixels show a notice instead of the playgrounds.

## Install

Use Node.js 24 (the CI version) and pnpm 10.27.0.

```bash
git clone https://github.com/tsilva/aigrounds.git
cd aigrounds
pnpm install --frozen-lockfile
pnpm dev --port auto
```

Open the local URL printed by the dev server. Playground experiments work without an API key; see [configuration](docs/configuration.md) to enable the AI Guide or monitoring.

## Commands

```bash
pnpm dev --port auto   # start development on an available port
pnpm build            # build production output and check TypeScript
pnpm start --port auto # serve a production build
pnpm typecheck        # check TypeScript separately
pnpm lint             # run ESLint
pnpm check:cycles     # check for import cycles
pnpm test:deps        # check patched dependency security boundaries
```

## Notes

- [Lesson details](docs/lessons.md) cover the experiments and current subject coverage. The gallery also supports search and sorting by the latest committed lesson update.
- Playgrounds run in the browser. The MNIST inference debugger needs WebGPU support.
- The optional AI Guide uses a server API route backed by OpenRouter. API keys stay on the server.
- Analytics and Sentry monitoring depend on environment configuration; see [configuration](docs/configuration.md) for settings and local credential handling.
- Contributors use the [learning-page design system](DESIGN_SYSTEM.md). [Development notes](docs/development.md) explain lesson registration, validation, update dates, branding, and project workflows.

## License

[MIT](LICENSE)
