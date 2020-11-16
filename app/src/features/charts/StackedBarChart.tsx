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
    width: 500,
    height: 120,
    encoding: {
      x: {
        aggregate: "sum",
        field: measure,
        scale: { type: "linear", domain: [0, 100] },
      },
      y: { field: dim1 },
      color: { field: dim2 },
    },
  };

  // return {
  //   "$schema": "https://vega.github.io/schema/vega/v5.json",
  //   "description": "A basic stacked bar chart example.",
  //   "width": 200,
  //   "height": 200,
  //   "padding": 5,

  //   "data": [
  //     {
  //       "name": "table",
  //       "values": data,
  //       "transform": [
  //         {
  //           "type": "stack",
  //           "groupby": [dim1],
  //           "field": measure
  //         }
  //       ]
  //     }
  //   ],

  //   "scales": [
  //     {
  //       "name": dim1,
  //       "type": "band",
  //       "range": "height",
  //       "domain": {"data": "table", "field": dim1}
  //     },
  //     {
  //       "name": measure,
  //       "type": "linear",
  //       "range": "width",
  //       "nice": true, "zero": true,
  //       "domain": {"data": "table", "field": "x1"}
  //     },
  //     {
  //       "name": "color",
  //       "type": "ordinal",
  //       "range": "category",
  //       "domain": {"data": "table", "field": dim2}
  //     }
  //   ],

  //   "axes": [
  //     {"orient": "bottom", "scale": measure, "zindex": 1},
  //     {"orient": "left", "scale": dim1, "zindex": 1}
  //   ],

  //   "marks": [
  //     {
  //       "type": "rect",
  //       "from": {"data": "table"},
  //       "encode": {
  //         "enter": {
  //           "y": {"scale": dim1, "field": dim1},
  //           "width": {"scale": dim1, "band": 1, "offset": -1},
  //           "x": {"scale": measure, "field": "x0"},
  //           "x2": {"scale": measure, "field": "x1"},
  //           "fill": {"scale": "color", "field": dim2}
  //         },
  //         "update": {
  //           "fillOpacity": {"value": 1}
  //         },
  //         "hover": {
  //           "fillOpacity": {"value": 0.5}
  //         }
  //       }
  //     }
  //   ]
  // };
}

function StackedBarChart(props: { data: Row[]; measure: string }) {
  return (
    // TODO change to pop %
    <Vega spec={getSpec(props.data, "state_name", "race", props.measure)} />
  );
}

export default StackedBarChart;
