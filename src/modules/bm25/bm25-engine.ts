import { type Bm25Document } from "./corpus";

export type Bm25Parameters = {
  k1: number;
  b: number;
};

export type QueryTermInsight = {
  term: string;
  documentFrequency: number;
  inverseDocumentFrequency: number;
};

export type DocumentTermBreakdown = {
  term: string;
  termFrequency: number;
  documentFrequency: number;
  inverseDocumentFrequency: number;
  saturation: number;
  lengthNormalization: number;
  contribution: number;
};

export type RankedDocument = {
  document: Bm25Document;
  score: number;
  documentLength: number;
  lengthRatio: number;
  matchedTerms: string[];
  termBreakdown: DocumentTermBreakdown[];
};

export type Bm25Analysis = {
  queryTerms: string[];
  averageDocumentLength: number;
  corpusSize: number;
  queryTermInsights: QueryTermInsight[];
  rankedDocuments: RankedDocument[];
};

type IndexedDocument = {
  document: Bm25Document;
  tokens: string[];
  tokenCounts: Record<string, number>;
};

function tokenize(text: string) {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function uniqueTerms(text: string) {
  const seen = new Set<string>();

  return tokenize(text).filter((term) => {
    if (seen.has(term)) {
      return false;
    }

    seen.add(term);
    return true;
  });
}

function buildIndex(document: Bm25Document): IndexedDocument {
  const tokens = tokenize(`${document.title} ${document.text} ${document.tags.join(" ")}`);
  const tokenCounts: Record<string, number> = {};

  for (const token of tokens) {
    tokenCounts[token] = (tokenCounts[token] ?? 0) + 1;
  }

  return {
    document,
    tokens,
    tokenCounts,
  };
}

function inverseDocumentFrequency(corpusSize: number, documentFrequency: number) {
  return Math.log(1 + (corpusSize - documentFrequency + 0.5) / (documentFrequency + 0.5));
}

export function analyzeBm25Search(
  documents: Bm25Document[],
  query: string,
  parameters: Bm25Parameters,
): Bm25Analysis {
  const indexedDocuments = documents.map(buildIndex);
  const corpusSize = indexedDocuments.length;
  const totalDocumentLength = indexedDocuments.reduce(
    (total, document) => total + document.tokens.length,
    0,
  );
  const averageDocumentLength =
    totalDocumentLength / Math.max(1, corpusSize) || 1;
  const queryTerms = uniqueTerms(query);

  const documentFrequencyByTerm = Object.fromEntries(
    queryTerms.map((term) => [
      term,
      indexedDocuments.filter((document) => (document.tokenCounts[term] ?? 0) > 0).length,
    ]),
  );

  const queryTermInsights = queryTerms.map((term) => ({
    term,
    documentFrequency: documentFrequencyByTerm[term] ?? 0,
    inverseDocumentFrequency: inverseDocumentFrequency(
      corpusSize,
      documentFrequencyByTerm[term] ?? 0,
    ),
  }));

  const rankedDocuments = indexedDocuments
    .map((indexedDocument) => {
      const documentLength = indexedDocument.tokens.length;
      const lengthNormalization =
        1 - parameters.b + parameters.b * (documentLength / averageDocumentLength);
      const termBreakdown = queryTermInsights.map((termInsight) => {
        const termFrequency = indexedDocument.tokenCounts[termInsight.term] ?? 0;

        if (termFrequency === 0) {
          return {
            term: termInsight.term,
            termFrequency,
            documentFrequency: termInsight.documentFrequency,
            inverseDocumentFrequency: termInsight.inverseDocumentFrequency,
            saturation: 0,
            lengthNormalization,
            contribution: 0,
          };
        }

        const saturation =
          (termFrequency * (parameters.k1 + 1)) /
          (termFrequency + parameters.k1 * lengthNormalization);

        return {
          term: termInsight.term,
          termFrequency,
          documentFrequency: termInsight.documentFrequency,
          inverseDocumentFrequency: termInsight.inverseDocumentFrequency,
          saturation,
          lengthNormalization,
          contribution: termInsight.inverseDocumentFrequency * saturation,
        };
      });

      const score = termBreakdown.reduce(
        (total, termScore) => total + termScore.contribution,
        0,
      );

      return {
        document: indexedDocument.document,
        score,
        documentLength,
        lengthRatio: documentLength / averageDocumentLength,
        matchedTerms: termBreakdown
          .filter((termScore) => termScore.termFrequency > 0)
          .map((termScore) => termScore.term),
        termBreakdown,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.matchedTerms.length !== left.matchedTerms.length) {
        return right.matchedTerms.length - left.matchedTerms.length;
      }

      return left.document.title.localeCompare(right.document.title);
    });

  return {
    queryTerms,
    averageDocumentLength,
    corpusSize,
    queryTermInsights,
    rankedDocuments,
  };
}
