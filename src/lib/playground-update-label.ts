const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
export const RELATIVE_UPDATE_WINDOW_MS = 7 * DAY;

const calendarDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
let relativeTime: Intl.RelativeTimeFormat | undefined;

export function formatPlaygroundUpdateLabel(
  lastUpdated: string,
  now: number | null,
): string | null {
  const timestamp = Date.parse(lastUpdated);
  if (!Number.isFinite(timestamp)) return null;

  // Render a stable calendar date until the browser clock is available.
  const elapsed = now === null ? null : now - timestamp;
  if (elapsed !== null && elapsed >= 0 && elapsed <= RELATIVE_UPDATE_WINDOW_MS) {
    if (elapsed < MINUTE) return "just now";
    relativeTime ??= new Intl.RelativeTimeFormat("en", { numeric: "always" });
    if (elapsed < HOUR) {
      return relativeTime.format(-Math.floor(elapsed / MINUTE), "minute");
    }
    if (elapsed < DAY) {
      return relativeTime.format(-Math.floor(elapsed / HOUR), "hour");
    }
    return relativeTime.format(-Math.floor(elapsed / DAY), "day");
  }

  return calendarDate.format(timestamp);
}
