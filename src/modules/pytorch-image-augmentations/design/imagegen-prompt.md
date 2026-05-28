Design a high-fidelity desktop app screenshot for an AI Grounds interactive learning playground page titled "PyTorch Image Augmentations". Match the inspected Cross Entropy reference structure strictly: no logo, no top-left brand mark, no global nav, no sidebar; top area has only a huge black page title at upper left, a normal sentence-case dark-blue subtitle underneath, and one pale outlined help button at upper right. Use a bright white / very light cool-gray background, a centered dense lesson page, compact numbered panels with pale blue borders, subtle cool shadows, electric indigo uppercase section titles, mono numeric/code details, and restrained neutral text. Avoid marketing hero layout, decorative orbs, nested decorative cards, and long explanatory text.

Teach the concept that augmentation is an assumption. Most torchvision transforms keep the original label, but CutMix and MixUp combine examples and require soft labels. Show four augmentation families: Geometry, Color, Occlusion, and Batch mixing. Make Batch mixing active. Keep AugMix visibly separated as image-only robustness where the label stays one-hot.

Panel 1: "1. CHOOSE THE AUGMENTATION ASSUMPTION". Four segmented cards across: Geometry, Color, Occlusion, Batch mixing. Batch mixing is active in indigo. Geometry lists RandomResizedCrop, HorizontalFlip, Rotation. Color lists ColorJitter, RandomGrayscale, GaussianBlur. Occlusion lists RandomErasing. Batch mixing lists CutMix and MixUp. Include a small pale chip below cards: "AugMix: image-only robustness, label stays one-hot". Include a right-side contract box: "Single-image transforms -> one-hot label survives" and "CutMix / MixUp -> soft label is required".

Panel 2: "2. TUNE THE TRANSFORM". Tabs: CutMix active, MixUp, AugMix, RandomErasing, ColorJitter. Controls: alpha = 1.00, lambda Source A = 0.64, mix choice = CutMix. Add a small lambda explanation: "Source A gets lambda; Source B gets 1 - lambda." Code block:

```python
from torchvision.transforms import v2
cutmix = v2.CutMix(num_classes=4, alpha=1.0)
mixup = v2.MixUp(num_classes=4, alpha=1.0)
cutmix_or_mixup = v2.RandomChoice([cutmix, mixup])
images, labels = cutmix_or_mixup(images, labels)
```

Add the note: "Use after batching, or from collate_fn."

Panel 3: "3. WATCH A BATCH PAIR MIX". Two rows. Row 1: Source A cat thumbnail plus Source B sneaker thumbnail, arrow to a CutMix result where sneaker patch covers 36% of the cat image, then soft target bars cat 0.64 and sneaker 0.36, sum 1.00. Row 2: Source A stop sign plus Source B leaf, arrow to a result with a 36% leaf patch, then bars stop sign 0.64 and leaf 0.36, sum 1.00. Make this the main visual focus.

Panel 4: "4. CHECK WHAT CHANGED". Four metric pills: label mode Soft target, Source A weight 64%, Source B patch 36%, entropy 0.94 bits. Add a horizontal meter labeled "one-hot violation" with marker at amber-low. Add the takeaway: "The target changes because the mixed image contains evidence for two classes."

Interaction coverage must be obvious: changing lambda updates patch size, soft-label bars, code-visible method choice, and metrics. Numeric consistency: lambda Source A = 0.64, Source B = 0.36, entropy = 0.94 bits.
