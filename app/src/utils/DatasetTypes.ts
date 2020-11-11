/* TODO: These are not yet comprehensive, final interfaces */

export interface DatasetMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly fields: Field[];
  readonly data_source_name: string;
  readonly data_source_link: string;
  readonly geographic_level: string;
  readonly demographic_granularity: string;
  readonly update_frequency: string;
  readonly update_time: string;
}

export interface Field {
  readonly data_type: string;
  readonly name: string;
  readonly description: string;
  readonly origin_dataset: string;
}

// TODO: make typedef for valid data types instead of any.
export type Row = Readonly<Record<string, any>>;

export class Dataset {
  readonly rows: Readonly<Row[]>;
  readonly metadata: Readonly<DatasetMetadata>;

  constructor(rows: Row[], metadata: DatasetMetadata) {
    this.rows = rows;
    this.metadata = metadata;
  }

  getRowsAsArrays() {
    return this.rows.map((row) => {
      return this.metadata.fields.map((field) => row[field.name]);
    });
  }

  sortBy(fn: (el1: Row, el2: Row) => number) {
    const newRows = this.rows.slice();
    newRows.sort(fn);
    return new Dataset(newRows, this.metadata);
  }

  addCol(name: string, fn: (row: Row) => any) {
    const newRows = this.rows
      .slice()
      .map((row) => ({ ...row, [name]: fn(row) }));
    // TODO metadata is wrong now.
    return new Dataset(newRows, this.metadata);
  }

  colsToRows(cols: string[], newColName: string, groupedByName: string): Row[] {
    const newData: Row[] = [];
    this.rows.forEach((row) => {
      const newRow = { ...row };
      const vals: Record<string, any> = {};
      cols.forEach((col) => {
        vals[col] = newRow[col];
        delete newRow[col];
      });
      Object.keys(vals).forEach((col) => {
        const copyRow = { ...newRow };
        copyRow[groupedByName] = col;
        copyRow[newColName] = vals[col];
        newData.push(copyRow);
      });
    });
    return newData;
  }
}

// Map of dataset id to DatasetMetadata
export type MetadataMap = Readonly<Record<string, DatasetMetadata>>;

export type LoadStatus = "unloaded" | "loading" | "loaded" | "error";

export interface DatasetStore {
  readonly loadDataset: (id: string) => Promise<Dataset | undefined>;
  readonly getDatasetLoadStatus: (id: string) => LoadStatus;
  readonly metadataLoadStatus: LoadStatus;
  readonly metadata: MetadataMap;
  readonly datasets: Readonly<Record<string, Dataset>>;
}
