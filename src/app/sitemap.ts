import type { MetadataRoute } from "next";
import { activePlaygroundMetadata } from "@/lib/playground-metadata";

const SITE_URL = "https://aigrounds.tsilva.eu";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...activePlaygroundMetadata.map((playground) => ({
      url: `${SITE_URL}/playgrounds/${playground.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
