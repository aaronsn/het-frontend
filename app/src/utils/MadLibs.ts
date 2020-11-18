import STATE_FIPS_MAP from "./Fips";

// Each phrase segment of the mad lib is either a string of text
// or a map of IDs to string options that can fill in a blank
export type PhraseSegment = string | Record<number, string>;

export interface MadLib {
  readonly phrase: PhraseSegment[];
}

const MADLIB_LIST: MadLib[] = [
  {
    phrase: [
      "Where are the",
      { 0: "highest", 1: "lowest" },
      "rates of",
      { 0: "unemployment" },
      "in",
      STATE_FIPS_MAP,
      "?",
    ],
  },
  {
    phrase: ["Tell me about", { 0: "COPD", 1: "diabetes" }, "in the USA."],
  },
];

export { MADLIB_LIST };
