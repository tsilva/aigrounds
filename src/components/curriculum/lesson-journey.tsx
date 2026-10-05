"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { canonicalLessonSlug, getLessonGroup, getLessonPath, lessonHref, lessonPrerequisites, learningPaths } from "@/lib/curriculum";
import { recordLearningProgress, useLearningProgress } from "@/lib/learning-progress";

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

export function LessonNext({ transfer = false }: { transfer?: boolean }) {
  const journey = useContext(JourneyContext);
  const progress = useLearningProgress();
  if (!journey) return null;
  const { slug, pathId, lessons } = journey;
  const group = getLessonGroup(slug);
  const chapter = group?.chapters.findIndex(item => item === slug) ?? -1;
  const path = getLessonPath(slug, pathId);
  const nextChapter = group?.chapters[chapter + 1];
  const pathIndex = path?.lessons.indexOf(canonicalLessonSlug(slug)) ?? -1;
  const nextSlug = nextChapter ?? path?.lessons[pathIndex + 1];
  const next = lessons.find(item => item.slug === nextSlug);
  const reviewed = progress.reviewed.includes(slug);
  const checked = Boolean(progress.transfers[slug]);
  const checkedChapters = group?.chapters.filter(item => progress.transfers[item]).length;
  const laterLiveSlug = !next?.live && path ? path.lessons.slice(pathIndex + 1).find(item => lessons.some(lesson => lesson.slug === item && lesson.live)) : undefined;
  const later = lessons.find(item => item.slug === laterLiveSlug);
  return <section aria-label={transfer ? "Continue after transfer" : "Continue learning"} className="mt-5 border-t border-[#dfe4f4] pt-4 text-sm text-[#536487]">
    <p>{checked ? "Transfer check explained" : reviewed ? "Marked reviewed" : "Explore freely or continue when ready"}{group && checkedChapters ? ` · ${checkedChapters}/${group.chapters.length} chapter checks explained` : ""}.</p>
    {!transfer && !reviewed && <button type="button" className="mt-2 rounded border border-indigo-200 px-3 py-2 text-indigo-700!" onClick={() => recordLearningProgress(slug, "reviewed", pathId)}>Mark this chapter reviewed</button>}
    {next?.live ? <Link href={lessonHref(next.slug, pathId)} className="mt-3 block font-semibold text-indigo-700! underline! underline-offset-2">
      {nextChapter ? "Next chapter" : "Next lesson"}: {nextChapter ? next.title : getLessonGroup(next.slug)?.title ?? next.title} →
    </Link> : next ? <>
      <p className="mt-3">Next: {next.title} — coming soon.</p>
      {later && <Link href={lessonHref(later.slug, pathId)} className="mt-2 block text-indigo-700! underline! underline-offset-2">Skip this planned step and explore {getLessonGroup(later.slug)?.title ?? later.title} →</Link>}
    </> : <p className="mt-3">{path ? "You have reached the end of this path. " : ""}<Link href="/" className="text-indigo-700! underline! underline-offset-2">Choose another path →</Link></p>}
    {!transfer && <details className="mt-3"><summary className="cursor-pointer">Choose a different path</summary><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{learningPaths.filter(item => item.lessons.includes(canonicalLessonSlug(slug))).map(item => <Link key={item.id} href={lessonHref(slug, item.id)} className="text-indigo-700! underline! underline-offset-2" aria-current={item.id === pathId ? "page" : undefined}>{item.title}</Link>)}</div></details>}
    {!transfer && <p className="mt-3 text-xs">Visits, self-reported review and explained transfer checks are saved separately in this browser. No account needed.</p>}
  </section>;
}
