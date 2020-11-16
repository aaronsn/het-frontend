import { Button } from "@material-ui/core";
import React, { useEffect } from "react";
import { Dataset, LoadStatus } from "../utils/DatasetTypes";
import useDatasetStore from "../utils/useDatasetStore";

function getJointLoadStatus(statuses: LoadStatus[]) {
  if (statuses.includes("error")) {
    return "error";
  }
  if (statuses.includes("loading") || statuses.includes("unloaded")) {
    return "loading";
  }
  return "loaded";
}

function WithDatasets(props: {
  datasetIds: string[];
  children: (datasets: Record<string, Dataset>) => JSX.Element;
}) {
  const datasetStore = useDatasetStore();
  // No need to make sure this only loads once, since the dataset store handles
  // making sure it's not loaded too many times.
  useEffect(() => {
    props.datasetIds.forEach((id) => {
      datasetStore.loadDataset(id);
    });
  });
  const statuses = props.datasetIds.map((id) =>
    datasetStore.getDatasetLoadStatus(id)
  );
  switch (getJointLoadStatus(statuses)) {
    case "loaded":
      const datasets = props.datasetIds.map((id) => datasetStore.datasets[id]);
      return props.children(
        Object.fromEntries(datasets.map((d) => [d.metadata.id, d]))
      );
    case "loading":
      return <p>Loading...</p>;
    default:
      return (
        <div>
          <p>Oops, something went wrong.</p>
          <Button onClick={() => window.location.reload()}>reload</Button>
        </div>
      );
  }
}

export default WithDatasets;
