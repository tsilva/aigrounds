import {
  type AugmentationFamily,
  type ClassExample,
  type TransformDefinition,
} from "./pytorch-image-augmentations-engine";

export const augmentationFamilies: AugmentationFamily[] = [
  {
    id: "geometry",
    title: "Geometry",
    summary: "Move pixels while the class survives.",
    transforms: [
      "random-resized-crop",
      "horizontal-flip",
      "rotation",
    ],
    labelContract: "One-hot label survives",
  },
  {
    id: "color",
    title: "Color",
    summary: "Change appearance, not identity.",
    transforms: [
      "color-jitter",
      "random-grayscale",
      "gaussian-blur",
    ],
    labelContract: "One-hot label survives",
  },
  {
    id: "occlusion",
    title: "Occlusion",
    summary: "Hide pixels and keep enough evidence.",
    transforms: ["random-erasing"],
    labelContract: "One-hot label survives",
  },
  {
    id: "batch-mixing",
    title: "Batch mixing",
    summary: "Combine examples and labels.",
    transforms: ["cutmix", "mixup"],
    labelContract: "Soft label is required",
  },
];

export const transformDefinitions: TransformDefinition[] = [
  {
    id: "random-resized-crop",
    title: "RandomResizedCrop",
    family: "geometry",
    codeName: "v2.RandomResizedCrop(size=(224, 224), scale=(0.72, 1.0))",
    labelBehavior: "one-hot",
    helper: "Crop and resize while the object remains recognizable.",
  },
  {
    id: "horizontal-flip",
    title: "HorizontalFlip",
    family: "geometry",
    codeName: "v2.RandomHorizontalFlip(p=0.70)",
    labelBehavior: "one-hot",
    helper: "Mirror images when left and right do not change the class.",
  },
  {
    id: "rotation",
    title: "Rotation",
    family: "geometry",
    codeName: "v2.RandomRotation(degrees=18)",
    labelBehavior: "one-hot",
    helper: "Rotate within a range that keeps the object readable.",
  },
  {
    id: "color-jitter",
    title: "ColorJitter",
    family: "color",
    codeName: "v2.ColorJitter(brightness=0.3, contrast=0.3)",
    labelBehavior: "one-hot",
    helper: "Shift lighting and contrast without changing the class.",
  },
  {
    id: "random-grayscale",
    title: "RandomGrayscale",
    family: "color",
    codeName: "v2.RandomGrayscale(p=0.20)",
    labelBehavior: "one-hot",
    helper: "Remove color when shape still carries the label.",
  },
  {
    id: "gaussian-blur",
    title: "GaussianBlur",
    family: "color",
    codeName: "v2.GaussianBlur(kernel_size=5, sigma=(0.1, 1.2))",
    labelBehavior: "one-hot",
    helper: "Soften texture while keeping enough outline evidence.",
  },
  {
    id: "random-erasing",
    title: "RandomErasing",
    family: "occlusion",
    codeName: "v2.RandomErasing(p=0.35, scale=(0.02, 0.22))",
    labelBehavior: "one-hot",
    helper: "Hide a patch and ask whether the label is still clear.",
  },
  {
    id: "cutmix",
    title: "CutMix",
    family: "batch-mixing",
    codeName: "v2.CutMix(num_classes=4, alpha=1.0)",
    labelBehavior: "soft",
    helper: "Paste a patch from another image and blend the target labels.",
  },
  {
    id: "mixup",
    title: "MixUp",
    family: "batch-mixing",
    codeName: "v2.MixUp(num_classes=4, alpha=1.0)",
    labelBehavior: "soft",
    helper: "Blend two full images and use a weighted target vector.",
  },
  {
    id: "augmix",
    title: "AugMix",
    family: "color",
    codeName: "v2.AugMix()",
    labelBehavior: "one-hot",
    helper: "Compose image-only distortions for robustness; labels stay one-hot.",
  },
];

export const classExamples: ClassExample[] = [
  {
    id: "cat",
    label: "cat",
    classIndex: 0,
    tone: "blue",
    imageSrc: "/augmentation-examples/cat.jpg",
    imageAlt: "Photo of a light-colored cat looking at the camera",
    objectPosition: "50% 38%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cutie_cat.jpg",
  },
  {
    id: "sneaker",
    label: "sneaker",
    classIndex: 1,
    tone: "red",
    imageSrc: "/augmentation-examples/sneaker.jpg",
    imageAlt: "Photo of a black high-top sneaker",
    objectPosition: "50% 56%",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rick_Owens_Geobasket_sneaker.jpg",
  },
  {
    id: "stop-sign",
    label: "stop sign",
    classIndex: 2,
    tone: "amber",
    imageSrc: "/augmentation-examples/stop-sign.jpg",
    imageAlt: "Photo of a red stop sign",
    objectPosition: "50% 50%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Stop_sign_us.jpg",
  },
  {
    id: "leaf",
    label: "leaf",
    classIndex: 3,
    tone: "green",
    imageSrc: "/augmentation-examples/leaf.jpg",
    imageAlt: "Photo of green leaves on a branch",
    objectPosition: "50% 50%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Apple_leaves.jpg",
  },
];

export const defaultFamilyId = "batch-mixing";
export const defaultTransformId = "cutmix";
export const defaultLambda = 0.64;
export const defaultStrength = 0.7;
