import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getLessonGroup, lessonHref } from "@/lib/curriculum";
import { activePlaygrounds, getActivePlayground, type ActivePlayground } from "@/lib/playgrounds";

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
}: PlaygroundPageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const playground = getActivePlayground(slug);

  if (!playground) {
    return {};
  }

  const title = `${playground.title} | AI Grounds`;
  const description = playground.summary;
  const path = `/playgrounds/${playground.slug}`;
  const inherited = await parent;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...inherited.openGraph, title, description, url: path },
    twitter: { ...inherited.twitter, title, description },
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
    <>
      <MobileLessonSummary playground={playground} />
      <div className="hidden md:block">
        {playground.layout === "guided-discovery" ? (
          <ModuleComponent />
        ) : (
          <PlaygroundPageWithHomeButton>
            <ModuleComponent />
          </PlaygroundPageWithHomeButton>
        )}
      </div>
    </>
  );
}

function MobileLessonSummary({ playground }: { playground: ActivePlayground }) {
  const { slug, tag, title, summary, learningGoals } = playground;
  const group = getLessonGroup(slug);
  const chapters = group?.chapters
    .map(getActivePlayground)
    .filter(chapter => chapter !== undefined) ?? [];

  return (
    <main className="min-h-dvh bg-[#f7faff] px-4 py-5 text-slate-950 md:hidden">
      <div className="mx-auto max-w-xl">
        <nav aria-label="Lesson navigation" className="border-b border-blue-100 pb-4">
          <Link href="/" className="inline-flex min-h-11 items-center font-semibold text-indigo-700! underline! underline-offset-4">
            ← All lessons
          </Link>
        </nav>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700">{tag}</p>
          <h1 className="mt-2 text-3xl leading-tight font-semibold">{title}</h1>
          <p className="mt-3 leading-7 text-slate-700">{summary}</p>
        </header>

        <p className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-950">
          Open this page on a desktop or laptop to use the interactive playground.
        </p>

        {learningGoals.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold">What you’ll learn</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 leading-6 text-slate-700">
              {learningGoals.map(goal => <li key={goal}>{goal}</li>)}
            </ul>
          </section>
        )}

        {chapters.length > 1 && (
          <nav aria-label="Lesson chapters" className="mt-6 border-t border-blue-100 pt-5">
            <h2 className="text-lg font-semibold">{group?.title}</h2>
            <ol className="mt-2 list-decimal pl-5">
              {chapters.map(chapter => (
                <li key={chapter.slug}>
                  {chapter.slug === slug ? (
                    <span aria-current="page" className="inline-flex min-h-11 items-center py-2 font-semibold">{chapter.title}</span>
                  ) : (
                    <Link href={lessonHref(chapter.slug)} className="inline-flex min-h-11 items-center py-2 text-indigo-700! underline! underline-offset-4">
                      {chapter.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </main>
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
