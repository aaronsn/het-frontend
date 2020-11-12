import React, { useState } from "react";
import BarChart from "../features/BarChart";
import VisxBarchart from "../features/VisxBarChart";
import WithDataset from "../features/WithDataset";
import { Dataset, Row } from "../utils/DatasetTypes";
import styles from "./Charts.module.scss";

function getRows(measure: string, dataset: Dataset): Row[] {
  return dataset.rows
    .slice()
    .sort((r1, r2) => r2[measure] - r1[measure])
    .slice(0, 20);
}

function TopNBarChart(props: {
  dataset: Dataset;
  measures: string[];
  breakdown: string;
  sortCol: string;
}) {
  const [topRows, setTopRows] = useState<Row[]>(() =>
    getRows(props.sortCol, props.dataset)
  );

  return (
    <VisxBarchart
      rows={topRows}
      breakdown={props.breakdown}
      measures={props.measures}
      onSelectMeasure={(measure) => {
        setTopRows(getRows(measure, props.dataset));
      }}
    />
  );
}

function ExploreDataPage() {
  return (
    <>
      <p>
        Research questions; explore key relationships across datasets, chosen by
        us; explore the data freely
      </p>
      <strong>DISCLAIMER: THESE ARE RANDOM NUMBERS</strong>
      {/* <BarChart /> */}
      <WithDataset datasetId={"fake_state_data"}>
        {(dataset) => {
          return (
            <div className={styles.Charts}>
              <div style={{ padding: "5px" }}>
                <VisxBarchart
                  // TODO use memo
                  rows={getRows("black_covid_rate", dataset)}
                  breakdown={"NAME"}
                  measures={["black_covid_rate"]}
                />
              </div>
              <div style={{ padding: "5px" }}>
                <TopNBarChart
                  dataset={dataset}
                  breakdown={"NAME"}
                  measures={[
                    "black_covid_rate",
                    "white_covid_rate",
                    "hispanic_covid_rate",
                  ]}
                  sortCol={"black_covid_rate"}
                />
              </div>
            </div>
          );
        }}
      </WithDataset>
    </>
  );
}

export default ExploreDataPage;
