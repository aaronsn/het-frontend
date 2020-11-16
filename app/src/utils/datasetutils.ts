import { IDataFrame } from "data-forge";

/**
 * reshapeRowsToCols(df, 'population', 'race', (val: any) => val, 'state_name');
 * @param df
 * @param newColValues
 * @param newColNames
 * @param groupedByCol
 * @param colNameGenerator
 */
export function reshapeRowsToCols(
  df: IDataFrame,
  newColValues: string,
  newColNames: string,
  groupedByCol: string,
  colNameGenerator?: (value: any) => string
): IDataFrame {
  return df
    .groupBy((row: any) => row[groupedByCol])
    .select((group) => {
      const newCols = group.aggregate({}, (acc: any, row: any) => {
        let newColName = row[newColNames];
        if (colNameGenerator) {
          newColName = colNameGenerator(newColName);
        }
        acc[newColName] = row[newColValues];
        return acc;
      });
      return { ...group.first(), ...newCols };
    })
    .inflate()
    .dropSeries([newColNames, newColValues]);
}

/**
 * reshapeColsToRows(df, renamedPopCols, "population", "race");
 * @param df
 * @param cols
 * @param newCol
 * @param groupedByCol
 */
export function reshapeColsToRows(
  df: IDataFrame,
  cols: string[],
  newCol: string,
  groupedByCol: string
) {
  return df
    .selectMany((row) => {
      return cols.map((col) => {
        return { ...row, [groupedByCol]: col, [newCol]: row[col] };
      });
    })
    .dropSeries(cols);
}
