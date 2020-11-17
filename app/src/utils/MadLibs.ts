import STATE_FIPS_MAP from "./Fips";

// Each phrase segment of the mad lib is either a string of text
// or a map of IDs to string options that can fill in a blank
export type PhraseSegment = string | Record<number, string>;

export interface MadLib {
  readonly phrase: PhraseSegment[];
  // Optional array of default selections for the phrase.
  readonly defaultSelections?: number[];
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
  {
    phrase: [
      "Compare",
      { 0: "Diabetes" },
      " in ",
      STATE_FIPS_MAP,
      " compared to ",
      STATE_FIPS_MAP,
    ],
    defaultSelections: [0, 0, 0, 13, 0, 0],
  },
];

export { MADLIB_LIST };
