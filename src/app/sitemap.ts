import type { MetadataRoute } from "next";
import { activePlaygroundMetadata } from "@/lib/playground-metadata";

const SITE_URL = "https://aigrounds.tsilva.eu";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
    },
    ...activePlaygroundMetadata.map((playground) => ({
      url: `${SITE_URL}/playgrounds/${playground.slug}`,
    })),
  ];
}
