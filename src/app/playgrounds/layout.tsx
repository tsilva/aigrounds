import { PlaygroundAssistantShell } from "@/components/playground-assistant-shell";
import { Suspense } from "react";
import { LessonJourneyProvider } from "@/components/curriculum/lesson-journey";
import { activePlaygroundMetadata, upcomingPlaygrounds } from "@/lib/playground-metadata";

export default function PlaygroundsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lessons = [
    ...activePlaygroundMetadata.map(({ slug, title }) => ({ slug, title, live: true })),
    ...upcomingPlaygrounds.map(({ slug, title }) => ({ slug, title, live: false })),
  ];
  return <PlaygroundAssistantShell><Suspense fallback={children}>
    <LessonJourneyProvider lessons={lessons}>{children}</LessonJourneyProvider>
  </Suspense></PlaygroundAssistantShell>;
}
