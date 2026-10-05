/** Stable radio values for lessons whose authored choices use ordinal IDs. */
export function experimentChoices(...labels: string[]) {
  return labels.map((label, index) => ({ id: String(index), label }));
}
