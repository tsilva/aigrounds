export type HomePlaygroundCard = {
  step: number;
  slug: string;
  title: string;
  tag: string;
  outcome: string;
  duration: string;
  level: string;
  concepts: string[];
  status: "live" | "coming-soon";
  lastUpdated: string | null;
  pathTitleIndexes: number[];
  chapters: { slug: string; title: string }[];
  reference: boolean;
};

type Text = string | number;
type PackedCard = [
  step: number, slug: string, title: string, tag: Text, outcome: string,
  duration: Text, level: Text, concepts: Text[], flags: number,
  lastUpdated: Text | null, pathTitleIndexes: number[], chapters: [slug: string, title: string][],
];
export type PackedHomeCatalogue = { words: string[]; cards: PackedCard[] };

// Only the wire format changes. Search, progress and rendering receive the same data.
export function packHomeCatalogue(cards: HomePlaygroundCard[]): PackedHomeCatalogue {
  const counts = new Map<string, number>();
  for (const card of cards) {
    for (const text of [card.tag, card.duration, card.level, ...card.concepts, ...(card.lastUpdated ? [card.lastUpdated] : [])]) {
      counts.set(text, (counts.get(text) ?? 0) + 1);
    }
  }
  const words: string[] = [];
  const indexes = new Map<string, number>();
  function text(value: string): Text {
    if (value.length < 4 || (counts.get(value) ?? 0) < 2) return value;
    let index = indexes.get(value);
    if (index === undefined) { index = words.length; words.push(value); indexes.set(value, index); }
    return index;
  }
  return { words, cards: cards.map(card => [
    card.step, card.slug, card.title, text(card.tag), card.outcome,
    text(card.duration), text(card.level), card.concepts.map(text),
    (card.status === "live" ? 1 : 0) | (card.reference ? 2 : 0),
    card.lastUpdated === null ? null : text(card.lastUpdated),
    card.pathTitleIndexes, card.chapters.map(chapter => [chapter.slug, chapter.title]),
  ]) };
}

export function unpackHomeCatalogue({ words, cards }: PackedHomeCatalogue): HomePlaygroundCard[] {
  const text = (value: Text): string => typeof value === "number" ? words[value] : value;
  return cards.map(([step, slug, title, tag, outcome, duration, level, concepts, flags, lastUpdated, pathTitleIndexes, chapters]) => ({
    step, slug, title, tag: text(tag), outcome, duration: text(duration), level: text(level),
    concepts: concepts.map(text), status: flags & 1 ? "live" : "coming-soon",
    lastUpdated: lastUpdated === null ? null : text(lastUpdated), pathTitleIndexes,
    chapters: chapters.map(([slug, title]) => ({ slug, title })), reference: Boolean(flags & 2),
  }));
}
