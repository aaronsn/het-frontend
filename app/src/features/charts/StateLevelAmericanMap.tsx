import React, { useState, useEffect, useRef } from "react";
import { Vega } from "react-vega";

const HEIGHT_WIDTH_RATIO = 0.5;
const LEGEND_WIDTH = 100;
const GEO_DATASET = "GEO_DATASET";
const GEO_ID = "id";

const VAR_DATASET = "VAR_DATASET";
const VAR_FIPS = "FIPS";

function StateLevelAmericanMap(props: {
  dataUrl: string;
  varField: string;
  legendTitle: string;
  filter?: string;
  signalListeners: any;
  op: string;
  countyLevel?: boolean;
}) {
  const [width, setWidth] = useState<number | undefined>();
  // Initial spec state is set in useEffect when default geo is set
  const [spec, setSpec] = useState({});

  const myRef = useRef(document.createElement("div"));

  useEffect(() => {
    // Transform geo dataset by adding varField from VAR_DATASET
    let geoTransformers: any[] = [
      {
        type: "lookup",
        from: VAR_DATASET,
        key: VAR_FIPS,
        fields: [GEO_ID],
        values: [props.varField],
      },
    ];

    let varTransformer: any[] = [];
    if (props.filter && props.filter !== "All") {
      varTransformer.push({
        type: "filter",
        expr: "datum.BRFSS2019_IMPLIED_RACE === '" + props.filter + "'",
      });
    }

    varTransformer.push({
      type: "aggregate",
      groupby: [VAR_FIPS],
      fields: [props.varField],
      ops: [props.op],
      as: [props.varField],
    });

    let tooltipDatum =
      props.op === "mean"
        ? "format(datum." + props.varField + ", '0.1%')"
        : "datum." + props.varField;
    let tooltipValue = 'datum.properties.name + ": " + ' + tooltipDatum;

    let legend: any = {
      fill: "colorScale",
      orient: "top-right",
      title: props.legendTitle,
      font: "monospace",
      labelFont: "monospace",
      offset: 10,
    };

    if (props.op === "mean") {
      legend["format"] = "0.1%";
    }

    var ext = props.dataUrl.substr(props.dataUrl.length - 3);
    let format =
      ext === "tsv"
        ? { type: "tsv", parse: "auto", delimiter: "\t" }
        : { type: "csv" };

    setSpec({
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description:
        "A choropleth map depicting U.S. diabetesloyment temp_maxs by county in 2009.",
      data: [
        {
          name: VAR_DATASET,
          url: props.dataUrl,
          format: format,
          transform: varTransformer,
        },
        {
          name: GEO_DATASET,
          transform: geoTransformers,
          url: "counties-10m.json",
          format: {
            type: "topojson",
            feature: "states",
          },
        },
        {
          name: "selected",
          on: [
            { trigger: "click", insert: "click" },
            { trigger: "shiftClick", remove: "true" },
          ],
        },
      ],
      projections: [
        {
          name: "usProjection",
          type: "albersUsa",
          fit: { signal: "data('" + GEO_DATASET + "')" },
          size: {
            signal:
              "[" +
              (width! - LEGEND_WIDTH) +
              ", " +
              width! * HEIGHT_WIDTH_RATIO +
              "]",
          },
        },
      ],
      scales: [
        {
          name: "colorScale",
          type: "quantize",
          domain: { data: GEO_DATASET, field: props.varField },
          range: { scheme: "yellowgreenblue", count: 7 },
        },
      ],
      legends: [legend],
      marks: [
        {
          type: "shape",
          from: { data: GEO_DATASET },
          encode: {
            enter: {
              tooltip: {
                signal: tooltipValue,
              },
            },
            update: {
              fill: [
                {
                  test: "indata('selected', 'id', datum.id)",
                  value: "red",
                },
                { scale: "colorScale", field: props.varField },
              ],
            },
            hover: { fill: { value: "pink" } },
          },
          transform: [{ type: "geoshape", projection: "usProjection" }],
        },
      ],
      signals: [
        {
          name: "click",
          value: 0,
          on: [{ events: "*:mousedown", update: "datum" }],
        },
        {
          name: "shiftClick",
          on: [{ events: "click[event.shiftKey]", update: "datum" }],
        },
      ],
    });
  }, [
    width,
    props.varField,
    props.legendTitle,
    props.filter,
    props.dataUrl,
    props.op,
  ]);

  // TODO: useLayoutEffect ?
  useEffect(() => {
    if (myRef && myRef.current) {
      setWidth(myRef.current.offsetWidth);
    }

    const handleResize = () => {
      if (myRef && myRef.current) {
        setWidth(myRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [myRef]);

  return (
    <div
      ref={myRef}
      style={{
        width: "80%",
        margin: "auto",
      }}
    >
      <div
        style={{
          margin: "auto",
          marginBottom: "40px",
        }}
      ></div>
      <Vega spec={spec} width={width} signalListeners={props.signalListeners} />
    </div>
  );
}

export default StateLevelAmericanMap;
