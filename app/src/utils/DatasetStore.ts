import { makeAutoObservable, observable, runInAction } from "mobx";
import DataFetcher from "./DataFetcher";
import { DatasetMetadata, Field } from "./DatasetMetadata";

export type LoadStatus = "unloaded" | "loading" | "loaded" | "error";

// TODO make typedef for valid data types instead of any.
export type Row = Record<string, any>;

export class Dataset {
  readonly rows: Row[];
  readonly metadata: DatasetMetadata;

  constructor(rows: Row[], metadata: DatasetMetadata) {
    makeAutoObservable(this);
    this.rows = rows;
    this.metadata = metadata;
  }

  getTableViewColumns() {
    return this.metadata.fields.map((field: Field) => ({
      Header: field.name,
      accessor: field.name,
    }));
  }
}

class DatasetStore {
  metadataLoadStatus: LoadStatus;
  metadata: Record<string, DatasetMetadata>;
  datasetsLoadStatus: Map<string, LoadStatus>;
  datasets: Map<string, Dataset>;
  fetcher: DataFetcher;
  private metadataLoadPromise:
    | Promise<Record<string, DatasetMetadata>>
    | undefined;

  constructor() {
    makeAutoObservable(this, { fetcher: false });
    this.metadataLoadStatus = "unloaded";
    this.metadata = {};
    this.datasetsLoadStatus = observable.map(new Map());
    this.datasets = observable.map(new Map());
    this.fetcher = new DataFetcher();
  }

  getDatasetLoadStatus(id: string): LoadStatus {
    return this.datasetsLoadStatus.get(id) || "unloaded";
  }

  async loadMetadata() {
    try {
      this.metadataLoadStatus = "loading";
      this.metadataLoadPromise = this.fetcher.getMetadata();
      const metadata = await this.metadataLoadPromise;
      runInAction(() => {
        this.metadata = metadata;
        this.metadataLoadStatus = "loaded";
      });
    } catch (e) {
      runInAction(() => {
        this.metadataLoadStatus = "error";
      });
    }
  }

  async loadDataset(id: string) {
    if (this.datasetsLoadStatus.has(id)) {
      console.log("already loaded or loading " + id);
      return;
    }
    console.log("loading " + id);
    this.datasetsLoadStatus.set(id, "loading");

    try {
      if (!this.metadataLoadPromise) {
        throw new Error("Tried to load dataset before metadata");
      }
      const [response, metadata] = await Promise.all([
        this.fetcher.loadDataset(id),
        this.metadataLoadPromise,
      ]);
      runInAction(() => {
        this.datasets.set(id, new Dataset(response.data, metadata[id]));
        this.datasetsLoadStatus.set(id, "loaded");
      });
    } catch (e) {
      // TODO report error
      runInAction(() => {
        this.datasetsLoadStatus.set(id, "error");
      });
    }
  }
}

export default DatasetStore;
