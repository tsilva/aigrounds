# Configuration

The playgrounds and their built-in experiments work without an API key. The AI Guide, analytics, and error monitoring are optional. [.env.example](../.env.example) lists configuration names and public defaults; keep secrets out of committed files and browser-visible variables.

## AI Guide and error monitoring

Playground chat uses OpenRouter from a server route. Configure:

```dotenv
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=openai/gpt-5.5
OPENROUTER_SITE_URL=https://aigrounds.tsilva.eu
OPENROUTER_APP_NAME=AI Grounds
```

Sentry error monitoring is wired through `@sentry/nextjs`. Configure the runtime DSN and source map upload token:

```dotenv
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_ORG=tsilva
SENTRY_PROJECT=aigrounds
SENTRY_AUTH_TOKEN=...
```

Use the same Sentry project DSN for `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`. Set `SENTRY_DSN` for server and edge errors, `NEXT_PUBLIC_SENTRY_DSN` for browser errors, and `SENTRY_AUTH_TOKEN` only in local/CI/Vercel build environments so production source maps can be uploaded. Do not commit real values.

## Analytics

- Google Analytics loads when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
- Vercel Analytics renders when `VERCEL=1`.
- Browser Sentry initializes when `NEXT_PUBLIC_SENTRY_DSN` is present. Server and edge Sentry use `SENTRY_DSN`, falling back to `NEXT_PUBLIC_SENTRY_DSN`.

## Local credentials

Private values live in Infisical, in the linked `aigrounds` project, Development environment, root folder. `.infisical.json` contains public connection settings only. Authenticate with your human account once:

```bash
infisical login
pnpm secrets:check
pnpm dev --port auto
```

The launcher fetches only `OPENROUTER_API_KEY` and `SENTRY_AUTH_TOKEN`, keeps them in memory, and removes manager credentials from the app process. Missing values cannot fall back to old dotenv credentials. A failed fetch stops before starting the app. Keep public settings such as the model name and Sentry DSN in local dotenv files.

`pnpm build:secrets` and `pnpm start:secrets` use the same development project. Vercel uses the ordinary `pnpm build` command with deployment variables supplied by its production sync.

The one-time `pnpm secrets:migrate` command copies only authorized `.keyenv.toml` Keychain accounts, refuses conflicting destination values, and verifies an exact readback without displaying values. Keychain originals are retained until the migration and rotation are verified.

## Production

The separate `aigrounds-production` project, Production environment, root folder supplies the `aigrounds` Vercel project's Production environment through the organization Vercel app connection. Keep original variable names and deletion protection enabled. Do not import sensitive variables from Vercel: Vercel cannot return their values. Populate and validate the source before syncing. A new deployment is needed after a sync for the live app to use changed variables.

Development and production project separation is an access boundary; separate provider keys are also needed to isolate their budgets and revocation. Credential rotation is tracked in the migration report until verified.

The chat route uses the OpenRouter key only on the server. Deploy the app with a server runtime for `/api/chat`; a static file host alone cannot serve the Guide.
