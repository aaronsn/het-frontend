import React, { useEffect } from "react";
import { Vega, VisualizationSpec } from "react-vega";
import { Dataset, Row } from "../utils/DatasetTypes";
import useDatasetStore from "../utils/useDatasetStore";

const COLOR_RANGE = ["#675193", "#ca8861"];

function getGroupedSpecNew(
  rows: Row[],
  measure: string,
  breakdown: string,
  secondaryBreakdown?: string
): VisualizationSpec {
  const xaxis: any = {
    x: {
      field: measure,
      type: "quantitative",
      title: "",
      axis: { grid: false },
    },
  };

  const yaxis = secondaryBreakdown
    ? {
        row: {
          field: breakdown,
          type: "nominal",
          spacing: 10,
        },
        y: {
          field: secondaryBreakdown,
          axis: { title: "", labels: false },
        },
      }
    : {
        y: {
          field: breakdown,
          axis: { title: "" },
        },
      };

  const axes = { ...xaxis, ...yaxis };

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    description: `A bar chart measuring ${measure} grouped by ${
      breakdown + (secondaryBreakdown ? ` and ${secondaryBreakdown}` : "")
    }`,
    data: { values: rows },
    height: { step: 18 },
    selection: {
      highlight: { type: "single", empty: "none", on: "mouseover" },
      select: { type: "multi" },
    },
    mark: {
      type: "bar",
      cursor: "pointer",
    },
    encoding: {
      ...axes,
      color: secondaryBreakdown
        ? {
            field: secondaryBreakdown,
            scale: { range: COLOR_RANGE },
          }
        : {
            value: COLOR_RANGE[0],
          },
      fillOpacity: {
        condition: { selection: "select", value: 1 },
        value: 0.3,
      },
      tooltip: [
        { field: measure },
        { field: breakdown },
        { field: secondaryBreakdown },
      ],
    },
    config: {
      scale: {
        bandPaddingInner: 0.2,
      },
      view: { stroke: "transparent" },
      axis: { domainWidth: 1 },
    },
  };
}

function WithDataset(props: {
  datasetId: string;
  children: (dataset: Dataset) => JSX.Element;
}) {
  const datasetStore = useDatasetStore();
  useEffect(() => {
    datasetStore.loadDataset(props.datasetId);
  });
  switch (datasetStore.getDatasetLoadStatus(props.datasetId)) {
    case "loaded":
      const dataset = datasetStore.datasets[props.datasetId];
      return props.children(dataset);
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
      <p>THESE ARE RANDOM NUMBERS</p>
      <WithDataset datasetId={"fake_state_data"}>
        {(dataset) => {
          const newDataset = dataset
            .addCol(
              "covid_rate_diff",
              (row) => row["white_covid_rate"] - row["black_covid_rate"]
            )
            .sortBy(
              (el1, el2) => el1["covid_rate_diff"] - el2["covid_rate_diff"]
            );
          const rows2 = newDataset.colsToRows(
            ["black_covid_rate", "white_covid_rate"],
            "covid_rate",
            "race"
          );
          return (
            <>
              <Vega
                spec={getGroupedSpecNew(
                  newDataset.rows.slice(),
                  "black_covid_rate",
                  "NAME"
                )}
              />
              <Vega
                spec={getGroupedSpecNew(rows2, "covid_rate", "NAME", "race")}
              />
              ,
            </>
          );
        }}
      </WithDataset>
    </React.Fragment>
  );
}

export default BarChart;
