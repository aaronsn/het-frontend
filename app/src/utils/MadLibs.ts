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
      { 0: "obesity", 1: "diabetes" },
      "in",
      STATE_FIPS_MAP,
      "?",
    ],
  },
  {
    phrase: [
      "Compare",
      {
        0: "the number of covid deaths",
        1: "the number of covid hospitalizations",
      },
      " to ",
      { 0: "obesity", 1: "diabetes" },
      " in ",
      STATE_FIPS_MAP,
    ],
  },
  {
    phrase: [
      "Which",
      { 0: "states", 1: "counties" },
      " are missing data for ",
      { 0: "obesity", 1: "diabetes" },
      "?",
    ],
  },
  {
    phrase: ["Tell me about", STATE_FIPS_MAP],
  },
  {
    phrase: [
      "Compare",
      { 0: "Diabetes" },
      " in ",
      STATE_FIPS_MAP,
      // { 0: "Alabama", 1: "California", 2: "Georgia" },
      " compared to ",
      STATE_FIPS_MAP,
      // { 0: "Alabama", 1: "California", 2: "Georgia" },
    ],
  },
];

export { MADLIB_LIST };
