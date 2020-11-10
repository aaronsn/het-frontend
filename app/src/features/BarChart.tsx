import React, { useEffect } from "react";
import { Vega, VisualizationSpec } from "react-vega";
import { Dataset } from "../utils/DatasetTypes";
import useDatasetStore from "../utils/useDatasetStore";

function getChartSpec(dataset: Dataset): VisualizationSpec {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    description:
      "A bar chart with highlighting on hover and selecting on click. (Inspired by Tableau's interaction style.)",
    data: {
      values: dataset.rows,
    },
    selection: {
      highlight: { type: "single", empty: "none", on: "mouseover" },
      select: { type: "multi" },
    },
    mark: {
      type: "bar",
      fill: "#4C78A8",
      stroke: "black",
      cursor: "pointer",
    },
    encoding: {
      x: { field: "State", type: "ordinal" },
      y: { field: "score", type: "quantitative" },
      fillOpacity: {
        condition: { selection: "select", value: 1 },
        value: 0.3,
      },
      strokeWidth: {
        condition: [
          {
            test: {
              and: [{ selection: "select" }, 'length(data("select_store"))'],
            },
            value: 2,
          },
          { selection: "highlight", value: 1 },
        ],
        value: 0,
      },
    },
    config: {
      scale: {
        bandPaddingInner: 0.2,
      },
    },
  };
}

function WithLoading({
  datasetId,
  children,
}: {
  datasetId: string;
  children: (dataset: Dataset) => JSX.Element;
}) {
  const datasetStore = useDatasetStore();
  useEffect(() => {
    datasetStore.loadDataset(datasetId);
  });
  switch (datasetStore.getDatasetLoadStatus(datasetId)) {
    case "loaded":
      const dataset = datasetStore.datasets[datasetId];
      return children(dataset);
    case "loading":
    case "unloaded":
      return <p>Loading...</p>;
    default:
      return <p>Oops, something went wrong.</p>;
  }
}

function BarChart() {
  return (
    <React.Fragment>
      <WithLoading datasetId={"fake_state_data"}>
        {(dataset) => <Vega spec={getChartSpec(dataset)} />}
      </WithLoading>
    </React.Fragment>
  );
}

export default BarChart;
