import React from "react";
import DatasetExplorer from "../features/dataset_explorer/DatasetExplorer";
import DatasetStore from "../utils/DatasetStore";

function DataCatalogPage({ datasetStore }: { datasetStore: DatasetStore }) {
  return (
    <React.Fragment>
      <p>Data downloads and methodology/citations page</p>
      <DatasetExplorer datasetStore={datasetStore} />
    </React.Fragment>
  );
}

export default DataCatalogPage;
