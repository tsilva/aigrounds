# AI Grounds brand sources

Selected direction: Option 2, Learning Blocks. Generated with native Codex ImageGen. The approved concept uses three ascending tactile construction steps and a draggable bead, with indigo, lavender, and navy. The comparison canvas is exploratory and is not an export source.

## Primary logo prompt

Create the final primary logo for "AI Grounds" from the selected Learning Blocks concept. Use a near-square navy tile (#0c1230), a substantial lavender rounded border, three broad isometric ascending construction steps with pale lavender tops and rich indigo fronts (#5031dc), and an indigo spherical bead at the top. Include the exact readable name "AI Grounds" at the bottom in geometric sans-serif typography inspired by Space Grotesk: AI near-white, Grounds pale lavender. Preserve the approved proportions and restrained highlights. No slogans, option numbers, watermark, loose exterior shadows, or extra icons. The self-contained tile and outline must work on white, off-white, dark, and transparent backgrounds. Request genuinely transparent alpha outside the badge.

## Icon prompt

Create a final text-free favicon and app icon source matching the primary logo. Keep only the three ascending isometric steps and indigo bead inside a square navy rounded tile with a substantial lavender perimeter. Enlarge and center the simplified symbol to occupy roughly 75 percent of the inner tile. Use pale lavender top faces, indigo fronts, and one clean bead highlight. Remove the wordmark area and rebalance the composition. No text, letters, monograms, numbers, labels, or typographic glyphs. Use clean edges, restrained shading, and a silhouette readable at 16 and 32 pixels. Request transparent alpha outside the tile.

## Social prompt

Create a separate wide horizontal social graphic for 1200×630 exports. Use a self-contained dark navy rounded plaque with a lavender perimeter. Place the approved ascending steps and bead in the left half, with a subtle broad indigo arc behind them. Place exact large readable "AI Grounds" typography on two lines in the right half, using near-white and lavender. Keep essential subject and type in the central safe area. Match the primary logo's restrained dimensional illustration. No additional text, slogans, watermark, UI, or extra badges. Request transparent alpha outside the bounded artwork.

## Final background cleanup prompt

Applied separately to the logo, icon, and social source using each generated image as its reference: preserve the approved artwork, silhouette, composition, aspect ratio, navy and lavender border, three indigo steps, bead, illumination, and exact logo typography (or absence of all text for the icon). Change only the exterior background and clean exterior edges. Replace exterior alpha, flecks, and matte artifacts with one perfectly uniform solid chroma-key green #00ff00. The subject contains no green. Outside the artwork, use no shadows, gradients, texture, reflections, checkerboard, floor plane, lighting variation, green spill, white fringe, or stray pixels. Keep a smooth geometric perimeter and a modest canvas margin. Do not add or redesign anything inside the artwork. Produce an opaque keyed source for deterministic alpha extraction.

## Derivation

The ImageGen chroma-key helper converted the final keyed images to true alpha using `--auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`. Generic source filenames supersede the older concept-specific sources.

The create-image-assets derivation script produced the `web-seo` pack. Root `logo.png` was trimmed to the visible logo plus an even 24-pixel transparent margin; its actual dimensions are recorded in `../manifest.json`. The ICO was repaired to contain square 16, 32, and 48-pixel frames. The Open Graph export was composited on opaque lavender (#f6f5ff) for predictable social previews; `social-source.png` retains alpha. Web manifest icons use `purpose: "any"` because these exports have transparent corners and are not maskable artwork. Store exports from the previous direction were retained and excluded from the current web inventory.
