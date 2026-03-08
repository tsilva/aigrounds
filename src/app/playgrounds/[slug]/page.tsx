import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaygroundShell } from "@/components/playground-shell";
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
    <PlaygroundShell module={playground}>
      <ModuleComponent />
    </PlaygroundShell>
  );
}
