import { IDataFrame } from "data-forge";

export function joinPopulation(diabetes: IDataFrame, acs: IDataFrame) {
  const keySelector = (row: any) =>
    JSON.stringify({ state_name: row.state_name, race: row.race });
  return diabetes
    .join(acs, keySelector, keySelector, (dia, acs) => {
      return {
        ...acs,
        diabetes_count: dia.diabetes_count,
      };
    })
    .generateSeries({
      diabetes_per_100k: (row) =>
        Math.round(row.diabetes_count / (row.population / 100000)),
    });
}
