import React, { useState } from "react";
import DatasetFilter from "./DatasetFilter";
import DataTable from "./DataTable";
import DatasetListing from "./DatasetListing";
import styles from "./DatasetExplorer.module.scss";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import DatasetStore, { Dataset } from "../../utils/DatasetStore";
import { observer } from "mobx-react-lite";

function renderTableOrPlaceholder(
  datasetStore: DatasetStore,
  datasetId: string
) {
  const loadStatus = datasetStore.getDatasetLoadStatus(datasetId);
  switch (loadStatus) {
    case "loaded":
      const dataset = datasetStore.datasets.get(datasetId) as Dataset;
      return (
        <DataTable
          columns={dataset.getTableViewColumns()}
          data={dataset.rows}
        />
      );
    case "loading":
      return <p>Loading...</p>;
    case "unloaded":
      return <p>Select a data source to view.</p>;
    default:
      return <p>Oops, something went wrong.</p>;
  }
}

function DatasetExplorer({ datasetStore }: { datasetStore: DatasetStore }) {
  const [previewedSourceId, setPreviewedSourceId] = useState("");
  const [activeFilter, setActiveFilter] = useState<Array<string>>([]);

  const loadPreview = (sourceId: string) => {
    setPreviewedSourceId(sourceId);
    datasetStore.loadDataset(sourceId);
  };

  function filterSources(filtered: Array<string>) {
    setActiveFilter(filtered);
  }

  const datasets = datasetStore.metadata;

  return (
    <div className={styles.DatasetExplorer}>
      <div className={styles.DatasetList}>
        <div className={styles.DatasetListItem}>
          <DatasetFilter
            datasets={datasets}
            onSelectionChange={filterSources}
          />
        </div>
        {Object.keys(datasets)
          .filter(
            (dataset_id) =>
              activeFilter.length === 0 || activeFilter.includes(dataset_id)
          )
          .map((dataset_id, index) => (
            <div className={styles.Dataset} key={index}>
              <div className={styles.DatasetListItem}>
                <DatasetListing
                  dataset={datasets[dataset_id]}
                  onPreview={() => loadPreview(dataset_id)}
                />
              </div>
              {previewedSourceId === dataset_id ? <ChevronRightIcon /> : null}
            </div>
          ))}
      </div>
      <div className={styles.Table}>
        {renderTableOrPlaceholder(datasetStore, previewedSourceId)}
      </div>
    </div>
  );
}

export default observer(DatasetExplorer);
