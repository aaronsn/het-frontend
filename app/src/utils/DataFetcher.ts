// Note: this Will be replaced with real API calls. Leaving data fetches
// untyped for now, but we should define types for the API calls once we
// establish the API types.

import { MetadataMap, Row } from "./DatasetTypes";
import FakeMetadataMap from "./FakeMetadataMap";

function generateFakeStateData(baseData: any[][], fieldsToAdd: string[]) {
  const newData: any[][] = [baseData[0].concat(fieldsToAdd)];
  const rows = baseData.slice(1).map((row) => {
    return row.concat(
      fieldsToAdd.map((field) => Math.round(Math.random() * 100))
    );
  });
  return newData.concat(rows);
}

class DataFetcher {
  private async loadData(url: string): Promise<any[][]> {
    const r = await fetch(url);
    return await r.json();
  }

  private getUrl(datasetId: string): string {
    if (datasetId === "state_names") {
      return "https://api.census.gov/data/2010/dec/sf1?get=NAME&for=state:*";
    } else if (datasetId === "county_names") {
      return "https://api.census.gov/data/2010/dec/sf1?get=NAME&for=county:*&in=state:*";
    } else if (datasetId === "pop_by_race") {
      return (
        "https://api.census.gov/data/2018/acs/acs5/profile" +
        "?get=NAME,DP05_0070E,DP05_0071E,DP05_0077E,DP05_0078E,DP05_0080E" +
        "&for=county:*&in=state:*"
      );
    }
    throw new Error("Unknown dataset");
  }

  private convertJson(data: any): Row[] {
    let realData = data;
    const headers = realData[0];
    realData = realData.slice(1);
    realData = realData.map((row: Array<any>) => {
      const newRow: { [key: string]: any } = {};
      for (let i = 0; i < headers.length; i++) {
        newRow[headers[i]] = row[i];
      }
      return newRow;
    });
    return realData;
  }

  async loadDataset(datasetId: string): Promise<Row[]> {
    // TODO: Overriding the datasetID for now since the datasets aren't actually hooked up
    // datasetId = "state_names";
    if (datasetId === "fake_state_data") {
      await new Promise((res) => {
        setTimeout(res, 1000);
      });
      const url = this.getUrl("state_names");
      const data = await this.loadData(url);
      const fakeData = generateFakeStateData(data, [
        "black_covid_rate",
        "white_covid_rate",
      ]);
      const convertedData = this.convertJson(fakeData);
      return convertedData;
    }
    const url = this.getUrl(datasetId);
    const data = await this.loadData(url);
    return this.convertJson(data);
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
