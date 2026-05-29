import { type LabelMixExample } from "./label-mixing-image-transforms-engine";

export const labelMixExamples: LabelMixExample[] = [
  {
    id: "cat",
    label: "cat",
    classIndex: 0,
    color: "#052cff",
    imageSrc: "/augmentation-examples/cat.jpg",
    imageAlt: "Photo of a light-colored cat looking at the camera",
    objectPosition: "50% 38%",
  },
  {
    id: "sneaker",
    label: "sneaker",
    classIndex: 1,
    color: "#ef4444",
    imageSrc: "/augmentation-examples/sneaker.jpg",
    imageAlt: "Photo of a black high-top sneaker",
    objectPosition: "50% 56%",
  },
  {
    id: "stop-sign",
    label: "stop sign",
    classIndex: 2,
    color: "#f59e0b",
    imageSrc: "/augmentation-examples/stop-sign.jpg",
    imageAlt: "Photo of a red stop sign",
    objectPosition: "50% 50%",
  },
  {
    id: "leaf",
    label: "leaf",
    classIndex: 3,
    color: "#16a34a",
    imageSrc: "/augmentation-examples/leaf.jpg",
    imageAlt: "Photo of green leaves on a branch",
    objectPosition: "50% 50%",
  },
];

export const defaultExampleAId = "cat";
export const defaultExampleBId = "stop-sign";
export const defaultMixLambda = 0.62;
