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

Private local values declared in `.keyenv.toml` live in macOS Keychain. Run
`keyenv doctor` to verify them and launch credential-dependent commands with
`keyenv run -- <command>`. Python, Node, and their child processes receive the
values through their normal environment APIs. Keep only public or non-secret
configuration in dotenv files.

In that macOS setup, launch credential-dependent development with:

```bash
keyenv doctor
keyenv run -- pnpm dev --port auto
```

The chat route uses the OpenRouter key only on the server. Deploy the app with a server runtime for `/api/chat`; a static file host alone cannot serve the Guide.
