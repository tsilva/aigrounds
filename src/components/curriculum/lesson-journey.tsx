"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { canonicalLessonSlug, getLessonGroup, getLessonPath, lessonHref, lessonPrerequisites } from "@/lib/curriculum";
import { recordLearningProgress } from "@/lib/learning-progress";

export type JourneyLesson = { slug: string; title: string; live: boolean };
type Journey = { slug: string; pathId?: string; lessons: readonly JourneyLesson[] };
const JourneyContext = createContext<Journey | null>(null);

export function LessonJourneyProvider({ lessons, children }: { lessons: readonly JourneyLesson[]; children: ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const slug = pathname.split("/").at(-1) ?? "";
  const path = getLessonPath(slug, params.get("path"));
  useEffect(() => { if (lessons.some(lesson => lesson.slug === slug && lesson.live)) recordLearningProgress(slug, "visited", path?.id); }, [slug, path?.id, lessons]);
  return <JourneyContext value={{ slug, pathId: path?.id, lessons }}>{children}</JourneyContext>;
}

export function LessonJourneyIntro() {
  const journey = useContext(JourneyContext);
  if (!journey) return null;
  const { slug, lessons, pathId } = journey;
  const group = getLessonGroup(slug);
  const path = getLessonPath(slug, pathId);
  const prerequisites = lessonPrerequisites[slug] ?? lessonPrerequisites[canonicalLessonSlug(slug)] ?? [];
  const chapter = group?.chapters.findIndex(item => item === slug) ?? -1;
  return <section aria-label="Your learning path" className="mb-6 border-b border-[#dfe4f4] pb-5 text-sm text-[#536487]">
    {path && <p className="mb-2">{path.title} · Step {path.lessons.indexOf(canonicalLessonSlug(slug)) + 1} of {path.lessons.length}</p>}
    {group && <div className="mb-3">
      <p className="font-semibold text-[#0c1230]">{group.title} · Chapter {chapter + 1} of {group.chapters.length}</p>
      <nav aria-label="Lesson chapters" className="mt-2 flex flex-wrap gap-3">
        {group.chapters.map((item, index) => <Link key={item} href={lessonHref(item, pathId)} aria-current={item === slug ? "page" : undefined} className="text-indigo-700! underline! underline-offset-2">
          {index + 1}. {lessons.find(lesson => lesson.slug === item)?.title}
        </Link>)}
      </nav>
    </div>}
    {prerequisites.length > 0 && <details>
      <summary className="cursor-pointer">Before you start: {prerequisites.map(item => item.concept).join("; ")}</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5">{prerequisites.map(item => <li key={item.concept}>{item.concept}{item.lesson && <>
        {" — "}{lessons.find(lesson => lesson.slug === item.lesson)?.live
          ? <Link className="text-indigo-700! underline! underline-offset-2" href={lessonHref(item.lesson)}>{lessons.find(lesson => lesson.slug === item.lesson)?.title}</Link>
          : <span>{lessons.find(lesson => lesson.slug === item.lesson)?.title ?? item.lesson} (coming soon)</span>}
      </>}</li>)}</ul>
      <p className="mt-2">Use these refreshers when needed. Earlier step numbers do not restrict access.</p>
    </details>}
  </section>;
}

export function TransferCompletion() {
  const journey = useContext(JourneyContext);
  useEffect(() => { if (journey) recordLearningProgress(journey.slug, "transfer", journey.pathId); }, [journey]);
  return null;
}
