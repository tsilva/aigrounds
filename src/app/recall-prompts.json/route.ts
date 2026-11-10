import { activePlaygroundMetadata } from "@/lib/playground-metadata";

export const dynamic = "force-static";

export function GET() {
  const prompts = Object.fromEntries(activePlaygroundMetadata.flatMap(({ slug, learningGoals }) => {
    const prompt = learningGoals[0];
    return prompt === undefined ? [] : [[slug, prompt]];
  }));
  return Response.json(prompts);
}
