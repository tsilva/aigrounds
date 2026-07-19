import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { activePlaygrounds, getActivePlayground } from "@/lib/playgrounds";

type PlaygroundPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return activePlaygrounds.map((playground) => ({
    slug: playground.slug,
  }));
}

export async function generateMetadata({
  params,
}: PlaygroundPageProps): Promise<Metadata> {
  const { slug } = await params;
  const playground = getActivePlayground(slug);

  if (!playground) {
    return {};
  }

  return {
    title: `${playground.title} | AI Grounds`,
    description: playground.summary,
  };
}

export default async function PlaygroundPage({
  params,
}: PlaygroundPageProps) {
  const { slug } = await params;
  const playground = getActivePlayground(slug);

  if (!playground) {
    notFound();
  }

  const ModuleComponent = playground.component;

  return (
    <PlaygroundPageWithHomeButton>
      <ModuleComponent />
    </PlaygroundPageWithHomeButton>
  );
}

function PlaygroundPageWithHomeButton({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="playground-page-with-home">
      <Link
        href="/"
        aria-label="Go to landing page"
        className="fixed top-3 left-3 z-50 inline-flex size-11 items-center justify-center rounded-lg border border-blue-100 bg-white/92 text-[#071024] shadow-[0_12px_30px_rgba(26,38,80,0.16)] backdrop-blur transition hover:border-indigo-200 hover:text-[#352cff] focus:outline-none focus:ring-4 focus:ring-indigo-100 sm:top-4 sm:left-4"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        >
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      </Link>
      {children}
    </div>
  );
}
