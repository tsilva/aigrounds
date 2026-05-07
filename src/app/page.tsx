import { HomePage, type HomePlaygroundCard } from "@/app/home-page";
import {
  activePlaygrounds,
  dashboardLessonPlanOrder,
  upcomingPlaygrounds,
} from "@/lib/playgrounds";
import packageJson from "../../package.json";

function compactOutcome(summary: string) {
  return summary.split(".")[0] ?? summary;
}

export default function Home() {
  const livePlaygroundsBySlug = new Map<string, (typeof activePlaygrounds)[number]>(
    activePlaygrounds.map((playground) => [playground.slug, playground]),
  );
  const upcomingPlaygroundsBySlug = new Map<
    string,
    (typeof upcomingPlaygrounds)[number]
  >(
    upcomingPlaygrounds.map((playground) => [playground.slug, playground]),
  );

  const playgrounds: HomePlaygroundCard[] = dashboardLessonPlanOrder.flatMap(
    (slug, index) => {
      const step = index + 1;
      const livePlayground = livePlaygroundsBySlug.get(slug);

      if (livePlayground) {
        return {
          step,
          slug: livePlayground.slug,
          title: livePlayground.title,
          tag: livePlayground.tag,
          outcome: compactOutcome(livePlayground.summary),
          duration: livePlayground.estimatedDuration,
          level: `lesson ${String(step).padStart(2, "0")}`,
          concepts: livePlayground.concepts,
          status: "live",
          href: `/playgrounds/${livePlayground.slug}`,
        };
      }

      const upcomingPlayground = upcomingPlaygroundsBySlug.get(slug);

      if (!upcomingPlayground) {
        return [];
      }

      return {
        step,
        slug: upcomingPlayground.slug,
        title: upcomingPlayground.title,
        tag: upcomingPlayground.tag,
        outcome: compactOutcome(upcomingPlayground.summary),
        duration: "coming soon",
        level: `lesson ${String(step).padStart(2, "0")}`,
        concepts: upcomingPlayground.concepts,
        status: "coming-soon",
      };
    },
  );

  return (
    <HomePage
      playgrounds={playgrounds}
      version={packageJson.version}
    />
  );
}
