// Note: this Will be replaced with real API calls. Leaving data fetches
// untyped for now, but we should define types for the API calls once we
// establish the API types.

import { DatasetMetadata } from "./DatasetMetadata";

class DataFetcher {
  private async loadData(url: string) {
    const r = await fetch(url);
    return await r.json();
  }

  private getUrl(datasetId: string) {
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

  private convertJson(data: any) {
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
    const realHeaders = headers.map((col: string) => ({
      Header: col,
      accessor: col,
    }));
    return { columns: realHeaders, data: realData };
  }

  async loadDataset(datasetId: string) {
    if (datasetId === "state_names") {
      await new Promise((res) => {
        setTimeout(res, 5000);
      });
    }
    const url = this.getUrl(datasetId);
    const data = await this.loadData(url);
    return this.convertJson(data);
  }

  async getMetadata(): Promise<Record<string, DatasetMetadata>> {
    /* TODO: populate this with real API call */
    let state_names: DatasetMetadata = {
      id: "state_names",
      name: "State Names",
      description: "List of states and their FIPS codes.",
      fields: [
        {
          data_type: "string",
          name: "NAME",
          description: "Name of the state",
          origin_dataset: "DS1",
        },
        {
          data_type: "string",
          name: "state",
          description: "State FIPS code",
          origin_dataset: "DS1",
        },
      ],
    };
    let county_names: DatasetMetadata = {
      id: "county_names",
      name: "County Names",
      description: "List of counties and their FIPS codes.",
      fields: [
        {
          data_type: "string",
          name: "NAME",
          description: "Name of the state",
          origin_dataset: "DS1",
        },
        {
          data_type: "string",
          name: "state",
          description: "State FIPS code",
          origin_dataset: "DS1",
        },
        {
          data_type: "string",
          name: "county",
          description: "FIPS code of the county",
          origin_dataset: "DS1",
        },
      ],
    };
    let pop_by_race: DatasetMetadata = {
      id: "pop_by_race",
      name: "County Population by Race",
      description: "The population of each county broken down by race.",
      fields: [
        {
          data_type: "string",
          name: "NAME",
          description: "name of the county",
          origin_dataset: "DS1",
        },
        {
          data_type: "integer",
          name: "DP05_0070E",
          description: "???",
          origin_dataset: "DS2",
        },
        {
          data_type: "integer",
          name: "DP05_0071E",
          description: "???",
          origin_dataset: "DS2",
        },
        {
          data_type: "integer",
          name: "DP05_0077E",
          description: "???",
          origin_dataset: "DS2",
        },
        {
          data_type: "integer",
          name: "DP05_0078E",
          description: "???",
          origin_dataset: "DS2",
        },
        {
          data_type: "integer",
          name: "DP05_0080E",
          description: "???",
          origin_dataset: "DS2",
        },
        {
          data_type: "string",
          name: "state",
          description: "State FIPS code",
          origin_dataset: "DS1",
        },
        {
          data_type: "string",
          name: "county",
          description: "FIPS code of the county",
          origin_dataset: "DS1",
        },
      ],
    };

    return {
      state_names: state_names,
      county_names: county_names,
      pop_by_race: pop_by_race,
    };
  }
}

export default DataFetcher;
