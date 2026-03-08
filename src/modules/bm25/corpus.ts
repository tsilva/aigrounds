export type Bm25Document = {
  id: string;
  title: string;
  kicker: string;
  text: string;
  tags: string[];
};

export type QueryPreset = {
  label: string;
  query: string;
  description: string;
};

export const bm25Documents: Bm25Document[] = [
  {
    id: "inverted-index",
    title: "Inverted Index Primer",
    kicker: "How sparse retrieval gets candidates onto the board",
    text:
      "The search stack begins with an inverted index. Each keyword points to a postings list, and BM25 scores those postings by balancing term frequency, inverse document frequency, and document length. Common words match everywhere, rare words matter more, and long documents are normalized so they do not win just by containing more text.",
    tags: ["keyword", "bm25", "index"],
  },
  {
    id: "hybrid-retrieval",
    title: "Hybrid Retrieval Launch Plan",
    kicker: "Keyword recall first, vector recall second",
    text:
      "Our launch plan keeps BM25 candidate generation in front of a neural reranker. Hybrid retrieval mixes keyword ranking with vector search so the system can recover exact product names, domain jargon, and semantically related passages in the same query flow.",
    tags: ["hybrid", "retrieval", "ranking"],
  },
  {
    id: "length-normalization",
    title: "Length Normalization Notes",
    kicker: "Why long documents need a handicap",
    text:
      "Length normalization stops giant documents from dominating search results. A long handbook may mention a query term several times just because it covers many topics, while a short note with the same term can be more focused. BM25 uses the b parameter to control how strongly document length changes the denominator.",
    tags: ["length", "normalization", "bm25"],
  },
  {
    id: "reranker-report",
    title: "Reranker Evaluation Report",
    kicker: "Candidate generation before deeper semantic scoring",
    text:
      "The reranker improved relevance once BM25 had already filtered the corpus to a small candidate set. Exact keyword matches still mattered because the reranker only sees what the first stage retrieves. Candidate generation, recall, and ranking quality moved together during the evaluation.",
    tags: ["reranker", "relevance", "candidates"],
  },
  {
    id: "analyzer-mismatch",
    title: "Analyzer Mismatch Incident",
    kicker: "Rare tokens can dominate the score for good reason",
    text:
      "Incident E872 came from an analyzer mismatch between the query parser and the shard analyzer. The mismatch split the token shard-drift incorrectly, so rare incident terms like E872 and mismatch became the fastest way to locate the debugging document.",
    tags: ["incident", "analyzer", "debugging"],
  },
  {
    id: "relevance-feedback",
    title: "Search Relevance Feedback Playbook",
    kicker: "Turning user complaints into ranking fixes",
    text:
      "When support reports bad search relevance, we inspect the query terms, compare the top ranked documents, and look for weak term coverage. The playbook starts with keyword evidence, then checks whether BM25 is underweighting a useful term, overweighting common words, or favoring a long document with diluted relevance.",
    tags: ["search", "relevance", "feedback"],
  },
];

export const queryPresets: QueryPreset[] = [
  {
    label: "Hybrid search",
    query: "hybrid retrieval ranking",
    description:
      "Shows how a focused keyword combination lifts the hybrid retrieval doc over the broader ranking notes.",
  },
  {
    label: "Long docs",
    query: "length normalization documents",
    description:
      "Makes the document-length penalty visible, especially when terms appear inside longer notes.",
  },
  {
    label: "Rare incident",
    query: "analyzer mismatch e872",
    description:
      "Highlights rare-term leverage: one unusual token can overpower a pile of common matches.",
  },
  {
    label: "First-stage ranking",
    query: "bm25 reranker relevance",
    description:
      "Shows BM25 as candidate generation rather than the final ranking model.",
  },
];

export const defaultQuery = queryPresets[0].query;
