import React from "react";
import { Vega, VisualizationSpec } from "react-vega";
import { Row } from "../../utils/DatasetTypes";

function getSpec(
  data: Record<string, any>[],
  dim1: string,
  dim2: string,
  measure: string
): VisualizationSpec {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v4.json",
    data: { values: data },
    mark: "bar",
    width: 400,
    height: 120,
    encoding: {
      x: {
        aggregate: "sum",
        field: measure,
        scale: { type: "linear", domain: [0, 100] },
        axis: { title: "Percent of population" },
      },
      y: {
        field: dim1,
        axis: { title: "" },
      },
      color: {
        field: dim2,
        legend: { title: "" },
      },
    },
  };
}

function StackedBarChart(props: { data: Row[]; measure: string }) {
  return (
    <Vega spec={getSpec(props.data, "state_name", "race", props.measure)} />
  );
}

export default StackedBarChart;
