import { type ArrivalScenarioId } from "./waiting-arrival-distributions-engine";

export type ArrivalScenario = {
  id: ArrivalScenarioId;
  title: string;
  subtitle: string;
  icon: "cursor" | "headset" | "warning";
  pPerSecond: number;
  windowMinutes: number;
};

export const arrivalScenarios: ArrivalScenario[] = [
  {
    id: "website",
    title: "Website Visits",
    subtitle: "Traffic to a site",
    icon: "cursor",
    pPerSecond: 0.02,
    windowMinutes: 5,
  },
  {
    id: "support",
    title: "Support Tickets",
    subtitle: "Requests from users",
    icon: "headset",
    pPerSecond: 0.008,
    windowMinutes: 10,
  },
  {
    id: "defects",
    title: "Rare Defects",
    subtitle: "Manufacturing defects",
    icon: "warning",
    pPerSecond: 0.0015,
    windowMinutes: 10,
  },
];

export const defaultScenario = arrivalScenarios[0];

export const rareEventExample = {
  lambdaPerMinute: 0.01,
  windowMinutes: 5,
  expectedCount: 0.05,
};
