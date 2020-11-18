// Note: this Will be replaced with real API calls. Leaving data fetches
// untyped for now, but we should define types for the API calls once we
// establish the API types.

import { MetadataMap, Row } from "./DatasetTypes";
import { diabetes } from "./FakeData";
import FakeMetadataMap from "./FakeMetadataMap";
import { DataFrame } from "data-forge";
import { reshapeColsToRows } from "./datasetutils";

const colMap = {
  DP05_0070E: "All Races",
  DP05_0071E: "Hispanic",
  DP05_0077E: "White, Non-Hispanic",
  DP05_0078E: "Black, Non-Hispanic",
  DP05_0080E: "Asian, Non-Hispanic",
  DP05_0079E: "American Indian/Alaskan Native, Non-Hispanic",
};

const colsToMerge = [
  "DP05_0081E", // Native Hawaiian and Other Pacific Islander alone, Non-Hispanic
  "DP05_0082E", // Some other race alone, Non-Hispanic
  "DP05_0083E", // Two or more races, Non-Hispanic
];

async function getAcsStatePopulations() {
  const populationCols = colsToMerge.concat(Object.keys(colMap));
  const params = ["NAME"].concat(populationCols).join(",");
  let r = await fetch(
    `https://api.census.gov/data/2018/acs/acs5/profile?get=${params}&for=state:*`
  );
  let json = await r.json();
  let df = new DataFrame({ columnNames: json[0], rows: json.slice(1) })
    .parseInts(populationCols)
    .generateSeries({
      "Other race, Non-Hispanic": (row) =>
        colsToMerge.map((c) => row[c]).reduce((acc, v) => acc + v),
    })
    .dropSeries(colsToMerge)
    .renameSeries(colMap)
    .renameSeries({
      state: "state_fips_code",
      NAME: "state_name",
    });
  const renamedPopCols = ["Other race, Non-Hispanic"].concat(
    Object.values(colMap)
  );
  return reshapeColsToRows(df, renamedPopCols, "population", "race");
}

function getDiabetesFrame() {
  return new DataFrame(diabetes)
    .dropSeries([
      "DIABETES_NO_REFUSED",
      "PREDIABETES_YES_YESPREGNANT",
      "PREDIABETES_NO_UNSURE_REFUSED",
      "COPD_NO_UNKNOWN_REFUSED",
    ])
    .renameSeries({
      BRFSS2019_STATE: "state_name",
      BRFSS2019_IMPLIED_RACE: "race",
      DIABETES_YES_YESPREGNANT: "diabetes_count",
      COPD_YES: "copd_count",
    });
}

class DataFetcher {
  // TODO build in retries, timeout before showing error to user.
  async loadDataset(datasetId: string): Promise<Row[]> {
    // TODO load from data server once it's ready
    switch (datasetId) {
      case "brfss_diabetes":
        return getDiabetesFrame().toArray();
      case "acs_state_population_by_race":
        const acsData = await getAcsStatePopulations();
        return acsData.toArray();
      default:
        throw new Error("Unknown dataset");
    }
  }

  async getMetadata(): Promise<MetadataMap> {
    // Simulate load time
    await new Promise((res) => {
      setTimeout(res, 1000);
    });

    return FakeMetadataMap;
  }
}

export default DataFetcher;
