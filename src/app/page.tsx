import { HomePage, type HomePlaygroundCard } from "@/app/home-page";
import { activePlaygroundMetadata, upcomingPlaygrounds } from "@/lib/playground-metadata";
import { dashboardLessonPlanOrder, getLessonGroup, learningPaths, referenceSlugs, coreLessonOrder } from "@/lib/curriculum";
import playgroundUpdates from "@/lib/playground-updates.json";
import packageJson from "../../package.json";

export default function Home() {
  const live = new Map<string, (typeof activePlaygroundMetadata)[number]>(activePlaygroundMetadata.map(item => [item.slug, item]));
  const planned = new Map(upcomingPlaygrounds.map(item => [item.slug, item]));
  const playgrounds: HomePlaygroundCard[] = dashboardLessonPlanOrder.flatMap((slug, index) => {
    const item = live.get(slug) ?? planned.get(slug);
    if (!item) return [];
    const group = getLessonGroup(slug);
    const chapters = group?.chapters.map(chapter => live.get(chapter)).filter(chapter => chapter !== undefined) ?? [];
    const coreStep = coreLessonOrder.findIndex(item => item === slug) + 1;
    const reference = referenceSlugs.some(item => item === slug);
    const dates = [slug, ...(group?.chapters ?? [])].map(item => (playgroundUpdates as Record<string, string>)[item]).filter(Boolean).sort();
    return [{
      step: index + 1, slug, title: group?.title ?? item.title, tag: item.tag,
      outcome: group ? chapters.map(chapter => chapter.summary.split(".")[0]).join(". ") : item.summary.split(".")[0],
      duration: live.has(slug) ? (chapters.length ? "Two short chapters" : live.get(slug)!.estimatedDuration) : "coming soon",
      level: reference ? (slug === "ai-concept-atlas" ? "reference" : "explore extra") : coreStep ? `core step ${String(coreStep).padStart(2, "0")}` : "optional path",
      coreStep, paths: learningPaths.filter(path => path.lessons.includes(slug)).map(path => path.id),
      chapters: group?.chapters.map(chapter => ({ slug: chapter, title: live.get(chapter)!.title })) ?? [], reference,
      recallGoals: Object.fromEntries((group?.chapters ?? [slug]).map(chapter => [chapter, live.get(chapter)?.learningGoals[0] ?? "Explain what you changed, what changed as a result, and why."])),
      concepts: [...new Set([...item.concepts, ...chapters.flatMap(chapter => chapter.concepts)])],
      status: live.has(slug) ? "live" as const : "coming-soon" as const,
      href: live.has(slug) ? `/playgrounds/${slug}` : undefined,
      lastUpdated: dates.at(-1) ?? null,
    }];
  });
  return <HomePage playgrounds={playgrounds} version={packageJson.version} />;
}
