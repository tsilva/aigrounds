"use client";

import * as Sentry from "@sentry/nextjs";
import { DesktopOnlyNotice } from "@/components/desktop-only-notice";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <DesktopOnlyNotice />
        <div className="desktop-only-content">
          <NextError statusCode={0} />
        </div>
      </body>
    </html>
  );
}
