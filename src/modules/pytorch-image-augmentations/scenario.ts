export type ClassExample = {
  id: "cat" | "sneaker" | "stop-sign" | "leaf";
  label: string;
  classIndex: number;
  imageSrc: string;
  imageAlt: string;
  objectPosition: string;
};

export const classExamples: ClassExample[] = [
  {
    id: "cat",
    label: "cat",
    classIndex: 0,
    imageSrc: "/augmentation-examples/cat.jpg",
    imageAlt: "Photo of a light-colored cat looking at the camera",
    objectPosition: "50% 38%",
  },
  {
    id: "sneaker",
    label: "sneaker",
    classIndex: 1,
    imageSrc: "/augmentation-examples/sneaker.jpg",
    imageAlt: "Photo of a black high-top sneaker",
    objectPosition: "50% 56%",
  },
  {
    id: "stop-sign",
    label: "stop sign",
    classIndex: 2,
    imageSrc: "/augmentation-examples/stop-sign.jpg",
    imageAlt: "Photo of a red stop sign",
    objectPosition: "50% 50%",
  },
  {
    id: "leaf",
    label: "leaf",
    classIndex: 3,
    imageSrc: "/augmentation-examples/leaf.jpg",
    imageAlt: "Photo of green leaves on a branch",
    objectPosition: "50% 50%",
  },
];
