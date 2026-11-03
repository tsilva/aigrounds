import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};

const isHostedBuild = process.env.VERCEL === "1" && Boolean(process.env.VERCEL_DEPLOYMENT_ID);

export default withSentryConfig(nextConfig, {
  sourcemaps: { disable: !isHostedBuild },
  webpack: { disableSentryConfig: !isHostedBuild },
  useRunAfterProductionCompileHook: isHostedBuild ? undefined : false,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: isHostedBuild ? process.env.SENTRY_AUTH_TOKEN : undefined,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
