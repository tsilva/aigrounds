<div align="center">
  <img src="logo.png" alt="AI Grounds" width="420">

  **🧠 Learn AI ideas by poking the algorithm until it explains itself 🔬**

  [Live Demo](https://aigrounds.tsilva.eu)
</div>

AI Grounds is an interactive educational web app for learning AI concepts through hands-on playgrounds. Instead of reading static explanations, you run small visual simulations and watch the important tradeoffs change in the browser.

AI Grounds supports viewport widths of 768 pixels and above. Smaller screens show a prompt to continue on a desktop or laptop.

The gallery opens in curriculum order. Use the sort buttons to switch to newest updates first; search works in either view, and planned lessons follow published lessons when sorting by update date. Published cards show the date of the latest committed change in their module. `pnpm dev` and `pnpm build` refresh `src/lib/playground-updates.json` from Git history, retaining saved dates when history is missing or shallow. Commit the refreshed dates alongside lesson updates so builds without Git history can display them.

The Mean, Median & Mode lab pairs a live dataset workspace with guided predict → try → explain experiments. Drag individual points, use the keyboard or an exact value field, and compare aligned summary markers, sorted values, and calculations. The built-in experiments work independently of the optional AI Guide.

The Range, Quartiles & IQR lesson uses an exact shared scale for draggable values, range, and a min/max box plot. Compact sorted halves show the median-of-halves calculation. Three predict → try → explain experiments contrast an extreme moving outward, a quartile contributor moving, and a value changing sorted position; incorrect explanations cannot complete an experiment. The exercises work independently of the optional AI Guide.

The Variance & Standard Deviation lesson compares same-mean presets, signed distances, squared contributions, and population variance. A compact evidence table and exact value editor support three predict → try → explain experiments, including incorrect-explanation recovery. Standard deviation restores the original units; the existing calculation engine and presets are preserved.

The Backpropagation Inspector uses one staged computation graph and four predict → try → explain experiments to compare weight gradients, isolate a target change, scale an optimizer step, and distinguish hidden-activation signals. The visual view sits above the equivalent matrix view, with paired scalar and matrix forms for gradients, hidden signals, and updates. Both use the same live values and one set of controls. Exact activation and learning-rate editors support free exploration. One-step previews recompute probability and binary cross entropy from full-precision gradients; bias and cached activations remain fixed.

These lessons use the shared [learning-page design system](DESIGN_SYSTEM.md): a continuous white workbench, lavender experiment rail, matching scenario controls and summaries, and an AI Guide CTA below the exercise. The reusable shell includes scenario/reset controls, exact-value editing, accessible experiment choices and feedback, and pointer/keyboard number-line controls. New lessons and material redesigns compose these components from `src/components/learning-page/`, keeping mathematical visuals and experiment logic in each module.

Project-local Codex workflows are [aigrounds-lesson](.codex/skills/aigrounds-lesson/SKILL.md) for creating, auditing, fixing, optimizing, or redesigning one lesson and [aigrounds-curriculum](.codex/skills/aigrounds-curriculum/SKILL.md) for sequencing, prerequisites, and live/planned reconciliation. Detailed lesson protocols are loaded only for the selected mode.

The Matrix Multiplication lesson uses the shared workbench and experiment rail for shape compatibility, stepwise row-column products, and comparisons across output cells. It retains three matrix presets, all output formulas, and the incompatible-shape example, with prediction/action/explanation checks and optional transfer practice.

The Shape, Skew & Outliers lesson uses the shared workbench and rail for four experiments and a transfer check. Its histogram, exact points, min-to-max box plot, and same-count summary comparisons distinguish tail direction, binning, unusual points, robust summaries, and hidden clusters. Quartiles follow the same median-of-halves convention as the Range, Quartiles & IQR lesson.

The Probability Rules lesson retains every dice event pair and six set-operation views in an accessible sample-space table. Four guided experiments and a new-event transfer check connect exact counts to complements, intersections, inclusive unions, set differences, and simulated frequencies. Shared workbench controls keep selects, mode buttons, and compact actions consistent across lessons.

The app currently includes labs for Mean, Median & Mode, Range, Quartiles & IQR, Variance & Standard Deviation, Shape, Skew & Outliers, Probability Rules, Conditional Probability & Independence, Bayes Rule, Expected Value & Risk, Bernoulli/Categorical/Binomial distributions, Waiting & Arrival Distributions, Overfitting, Confusion Matrix & Thresholds, Softmax Temperature, Cross Entropy Loss, KL Divergence, Matrix Multiplication, Tensor Shape & Broadcasting, Gradient Descent, Monte Carlo Tree Search, Byte Pair Encoding, Transformer Attention, Batch Normalization, Layer Normalization, MNIST MLP Inference Debugging with WebGPU, Convolution Filter Lab, PyTorch Image Augmentations, Label-Mixing Image Transforms, Autograd Graphs, Backpropagation Inspector, Linear Quantization (INT4), Zero Knowledge Proofs, and the AI Concept Atlas.

## Install

```bash
git clone https://github.com/tsilva/aigrounds.git
cd aigrounds
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
pnpm dev      # start the local dev server
pnpm build    # create a production build
pnpm start    # serve the production build locally
pnpm lint     # run ESLint
pnpm typecheck # run the standalone TypeScript gate
pnpm test:deps # exercise patched dependency security boundaries
pnpm check:cycles # verify local imports are acyclic
```

## Environment

Playground chat uses OpenRouter from a server route. Configure:

```bash
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=openai/gpt-5.5
OPENROUTER_SITE_URL=https://aigrounds.tsilva.eu
OPENROUTER_APP_NAME=AI Grounds
```

Sentry error monitoring is wired through `@sentry/nextjs`. Configure the runtime DSN and source map upload token:

```bash
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_ORG=tsilva
SENTRY_PROJECT=aigrounds
SENTRY_AUTH_TOKEN=...
```

Use the same Sentry project DSN for `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`. Set `SENTRY_DSN` for server and edge errors, `NEXT_PUBLIC_SENTRY_DSN` for browser errors, and `SENTRY_AUTH_TOKEN` only in local/CI/Vercel build environments so production source maps can be uploaded. Do not commit real values.

## Notes

- The repo enforces pnpm in `package.json`; run `corepack enable` first if pnpm is not available.
- Playgrounds run client-side. The chat sidebar uses a server API route to keep the OpenRouter key out of the browser.
- Google Analytics loads only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
- Vercel Analytics is wired through `@vercel/analytics/next`.
- Sentry initializes only when its DSN environment variables are present.
- The home dashboard is the canonical current and future lesson plan. Live lessons are registered in `activePlaygroundMetadata`, future lesson cards live in `upcomingPlaygrounds`, and `dashboardLessonPlanOrder` controls the combined dashboard order.
- Convolution Filter Lab links three image scenarios to selectable output cells and exact weighted-sum arithmetic. Its five prediction → try → explanation experiments finish with a zero-padding transfer check, with AI Guide access in the experiment rail.
- New live playgrounds are registered in `src/lib/playground-metadata.ts`, wired to components in `src/lib/playgrounds.ts`, and rendered through the dynamic playground route. Sitemap entries are generated from the active playground metadata.
- No general-purpose test framework is configured yet; `pnpm test:deps` provides focused dependency security regressions.

## Local credentials

Private local values declared in `.keyenv.toml` live in macOS Keychain. Run
`keyenv doctor` to verify them and launch credential-dependent commands with
`keyenv run -- <command>`. Python, Node, and their child processes receive the
values through their normal environment APIs. Keep only public or non-secret
configuration in dotenv files.

## License

[MIT](LICENSE)
