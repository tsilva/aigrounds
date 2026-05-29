Design a high-fidelity desktop screenshot of an AI Grounds interactive learning playground page for advanced image augmentation transforms that change labels: CutMix and MixUp. Match the existing AI Grounds design language from the categorical cross entropy playground: no logo, no global nav, no sidebar, no marketing hero; huge black title at top left, short dark-blue subtitle, centered dense lesson page, compact numbered panels with pale blue borders, electric indigo section titles and controls, white/cool-gray background, mono numeric/formula details, restrained utilitarian educational UI.

Page title: "Label-Mixing Image Transforms". Subtitle: "CutMix and MixUp change the image and the target vector together."

Create one polished app screenshot with three compact lesson panels:

Panel 1 title: "1. Pick Two Training Examples". Show a row of four selectable image thumbnails/classes with two selected source cards labeled A and B. Include a small target preview showing y_A = [1,0,0,0] and y_B = [0,0,1,0].

Panel 2 title: "2. Mix Pixels, Then Mix Labels". This is the main interaction. Left side has CutMix/MixUp mode control, lambda slider labeled "lambda / area from A" set to 0.62, a run/sample icon button, and a code preview box showing v2.CutMix(num_classes=4). Right side has a large composed image: a cat image with a rectangular stop-sign patch pasted into it, patch outline in indigo, with a small overlay pill "A 62% / B 38%". Next to it show a big soft-label vector bar chart: cat 0.62, sneaker 0.00, stop sign 0.38, leaf 0.00. Also show formula in monospace: y_mix = lambda y_A + (1 - lambda) y_B. The image and label chart must visibly correspond to the same lambda.

Panel 3 title: "3. What The Loss Sees". Show a compact weighted cross-entropy strip: cat term weight 0.62 plus stop sign term weight 0.38, and a takeaway pill reading "Labels are no longer one-hot." Include a small comparison row: RandomCrop keeps label one-hot; CutMix/MixUp produce soft labels.

Visual requirements: no decorative blobs/orbs/gradients; no nested decorative cards; cards only for repeated image/example items and the code block. Keep text short and readable. Use real-looking thumbnail/image placeholders that clearly depict cat, sneaker, stop sign, and leaf. Ensure all numbers are internally consistent: lambda 0.62, target bar cat 0.62 and stop sign 0.38, formula uses lambda and 1-lambda. The screenshot should feel like a usable React playground, not a presentation slide.
