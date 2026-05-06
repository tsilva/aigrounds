import { HomePage, type HomePlaygroundCard } from "@/app/home-page";
import {
  activePlaygrounds,
  upcomingPlaygrounds,
} from "@/lib/playgrounds";
import packageJson from "../../package.json";

function compactOutcome(summary: string) {
  return summary.split(".")[0] ?? summary;
}

export default function Home() {
  const liveCards: HomePlaygroundCard[] = activePlaygrounds.map((playground, index) => ({
    step: index + 1,
    slug: playground.slug,
    title: playground.title,
    tag: playground.tag,
    outcome: compactOutcome(playground.summary),
    duration: playground.estimatedDuration,
    level: `level ${String(index + 1).padStart(2, "0")}`,
    concepts: playground.concepts,
    status: "live",
    href: `/playgrounds/${playground.slug}`,
  }));

  const upcomingCards: HomePlaygroundCard[] = upcomingPlaygrounds.map((playground, index) => ({
    step: liveCards.length + index + 1,
    slug: playground.slug,
    title: playground.title,
    tag: "concept",
    outcome: compactOutcome(playground.summary),
    duration: "coming soon",
    level: `level ${String(liveCards.length + index + 1).padStart(2, "0")}`,
    concepts: [],
    status: "coming-soon",
  }));

  return (
    <HomePage
      playgrounds={[...liveCards, ...upcomingCards]}
      version={packageJson.version}
    />
  );
}
