<div align="center">
  <img src="logo.png" alt="AI Grounds" width="420">

  **🧠 Learn AI ideas by poking the algorithm until it explains itself 🔬**

  [Live Demo](https://aigrounds.tsilva.eu)
</div>

AI Grounds is an interactive educational web app for learning AI concepts through hands-on playgrounds. Instead of reading static explanations, you run small visual simulations and watch the important tradeoffs change in the browser.

The app currently includes labs for Mean, Median & Mode, Range, Quartiles & IQR, Variance & Standard Deviation, Shape, Skew & Outliers, Probability Rules, Conditional Probability & Independence, Bayes Rule, Cross Entropy Loss, Softmax Temperature, Gradient Descent, Overfitting, and Confusion Matrix & Thresholds.

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

## Notes

- The repo enforces pnpm in `package.json`; run `corepack enable` first if pnpm is not available.
- Playgrounds run client-side. The chat sidebar uses a server API route to keep the OpenRouter key out of the browser.
- Google Analytics loads only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
- Vercel Analytics is wired through `@vercel/analytics/next`.
- New playgrounds are registered in `src/lib/playground-metadata.ts`, wired to components in `src/lib/playgrounds.ts`, and rendered through the dynamic playground route. Sitemap entries are generated from the active playground metadata.
- No test framework is configured yet.

## Architecture

![AI Grounds architecture diagram](./architecture.png)

## License

[MIT](LICENSE)
