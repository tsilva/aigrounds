export type LayerTokenId = "the" | "cat" | "sat";

export type LayerToken = {
  id: LayerTokenId;
  label: string;
  values: number[];
};

export const initialLayerTokens: LayerToken[] = [
  {
    id: "the",
    label: "The",
    values: [0.2, -0.8, 0.4, 0.1],
  },
  {
    id: "cat",
    label: "cat",
    values: [-1, -1, 1, 1],
  },
  {
    id: "sat",
    label: "sat",
    values: [0.3, 0.5, -0.7, -0.1],
  },
];

export const defaultLayerTokenId: LayerTokenId = "cat";

export const defaultGamma = [1.2, 0.8, 1, 1.1];

export const defaultBeta = [0.1, -0.2, 0, 0.3];
