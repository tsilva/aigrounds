# Accepted Imagegen Prompt

Create the final polished high-fidelity AI Grounds UI mockup for "Linear Quantization (INT4) Lab". Use the same composition as a clean educational web app screenshot: white page, no logo, no nav, no sidebar, no marketing hero. Huge black title top left. Dark-blue subtitle: "Turn real weights into 16 reusable integer codes, then see what memory savings cost." Pale outlined help button top right: "How does INT4 quantization work?" Compact numbered panels with pale blue borders, white backgrounds, blue section numbers. No decorative background. No nested cards. 16:9 desktop screenshot.

Use this consistent example everywhere: affine unsigned INT4 with min=-0.16, max=+0.14, scale s=0.0200, zero point z=8. Selected x=+0.053 maps to q=11, dequantized x-hat=+0.060, error +0.007. INT4 has 4 bits, 16 codes, stores two values per byte.

Panel 1: "CHOOSE THE BLOCK". Exactly three large scenario buttons: "LLM weights" selected, "Activation values", "Tiny sensor model". One single status strip: "4 bits · 16 codes · scale 0.0200 · zero point 8". No duplicate metric tiles.

Panel 2: "MAP REAL VALUE TO CODE". Formula q = clip(round(x / s) + z). Real value line from -0.16 to +0.14. INT4 code strip with all cells clearly labeled 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 in order. Green selected cell q=11. Green marker x=+0.053 just left of blue marker x-hat=+0.060. Orange error bracket +0.007. Summary: x=+0.053 -> q=11 -> x-hat=+0.060.

Panel 3: "16 SHELVES, TWO KINDS OF ERROR". Left original bell-shaped weight histogram with orange clipped tails. Middle unlabeled 16-shelf snap ladder, selected shelf q=11 green, no vertical numeric list. Right quantized histogram, selected q=11 bar green, clipped tails orange. Metrics: rounding error 0.005 avg, clipped 1.8%, memory 8x smaller.

Panel 4: "TUNE THE RANGE". Slider from -0.16 to +0.14, Auto/Tighter/Wider segmented control, tradeoff arrow "smaller step" to "more clipping", metrics min -0.16, max +0.14, scale 0.0200.

Panel 5: "INSPECT AND PACK". Step boxes: divide by scale 2.65 -> round 3 -> add zero point 8 -> code 11 -> nibble 1011. Packing visual: first code 11 (1011) + second code 6 (0110) = byte 0xB6. Bottom green takeaway: "INT4 saves memory by sharing one scale and zero point across a block; values come back approximate, not exact."

Quality requirements: main code strip labels must be correct and sequential, no missing code 6, no duplicated code numbers, no tiny garbled labels, all three scenario buttons visible, no duplicate status tiles, selected marker near +0.053 not zero, text readable and unclipped, charts do not overflow.
