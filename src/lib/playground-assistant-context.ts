"use client";

import { createContext, useContext } from "react";

export const PlaygroundAssistantContext = createContext<(() => void) | null>(null);

export function useOpenPlaygroundAssistant() {
  const open = useContext(PlaygroundAssistantContext);
  if (!open) {
    throw new Error("Playground assistance must be used inside its shell.");
  }
  return open;
}
