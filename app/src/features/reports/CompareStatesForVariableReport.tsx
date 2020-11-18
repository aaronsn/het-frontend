import React from "react";
import WithDatasets from "../../utils/WithDatasets";
import { LinkWithStickyParams } from "../../utils/urlutils";
import GroupedBarChart from "../charts/GroupedBarChart";
import { Dataset, Row } from "../../utils/DatasetTypes";
import StackedBarChart from "../charts/StackedBarChart";
import { Button, Grid } from "@material-ui/core";

const USA_STRING = "the USA";

interface CompareStatesForVariableProps {
  state1: string;
  state2: string;
  variable: string;
}

type GetChartData = (
  datasets: Record<string, Dataset>,
  state1: string,
  state2: string
) => Row[];

interface SimpleChartConfig {
  title: string;
  measure: string;
  getData: GetChartData;
}

interface VariableConfig {
  datasetIds: string[];
  groupedBarChart: SimpleChartConfig;
  stackedPopulationBreakdownChart: SimpleChartConfig;
}

function getDiabetesBarChartData(
  datasets: Record<string, Dataset>,
  state1: string,
  state2: string
) {
  const brfss_diabetes = datasets["brfss_diabetes"];
  const acs_state_population_by_race = datasets["acs_state_population_by_race"];
  if (!brfss_diabetes || !acs_state_population_by_race) {
    throw new Error("Datasets not loaded properly");
  }

  const keySelector = (row: any) =>
    JSON.stringify({ state_name: row.state_name, race: row.race });
  const joined = brfss_diabetes
    .toDataFrame()
    .join(
      acs_state_population_by_race.toDataFrame(),
      keySelector,
      keySelector,
      (dia, acs) => ({ ...acs, ...dia })
    );
  return (
    joined
      .concat(
        joined.pivot("race", {
          state_name: (series) => USA_STRING,
          diabetes_count: (series) => series.sum(),
          population: (series) => series.sum(),
        })
      )
      // After joining, reset index to prevent generated series from applying to
      // the wrong rows.
      .resetIndex()
      .where((row) => [state1, state2, USA_STRING].includes(row.state_name))
      .generateSeries({
        diabetes_per_100k: (row) =>
          Math.round(row.diabetes_count / (row.population / 100000)),
      })
      .toArray()
  );
}

function getStackedPopulationBreakdownChart(
  datasets: Record<string, Dataset>,
  state1: string,
  state2: string
) {
  const acs_state_population_by_race = datasets["acs_state_population_by_race"];
  if (!acs_state_population_by_race) {
    throw new Error("Datasets not loaded properly");
  }

  const df = acs_state_population_by_race.toDataFrame();
  const dfWithUs = df
    .concat(
      df.pivot("race", {
        state_name: (series) => USA_STRING,
        population: (series) => series.sum(),
      })
    )
    .where((row) => [state1, state2, USA_STRING].includes(row.state_name));
  const dfGroupedByState = dfWithUs
    .groupBy((row) => row.state_name)
    .select((group) => {
      const statePop = group.where((r) => r.race === "All Races").first()
        .population;
      return group
        .where((row) => row.race !== "All Races")
        .transformSeries({
          population: (pop) => Math.round((1000 * pop) / statePop) / 10,
        });
    });
  return dfGroupedByState
    .skip(1)
    .aggregate(dfGroupedByState.first(), (prev, next) => prev.concat(next))
    .resetIndex()
    .renameSeries({ population: "population_pct" })
    .toArray();
}

const variableConfigs: Record<string, VariableConfig> = {
  Diabetes: {
    datasetIds: ["brfss_diabetes", "acs_state_population_by_race"],
    groupedBarChart: {
      title: "Number of people with diabetes per 100k population",
      measure: "diabetes_per_100k",
      getData: getDiabetesBarChartData,
    },
    stackedPopulationBreakdownChart: {
      title: "Population breakdown by race/ethnicity",
      measure: "population_pct",
      getData: getStackedPopulationBreakdownChart,
    },
  },
};

function CompareStatesForVariableReport(props: CompareStatesForVariableProps) {
  const {
    datasetIds,
    groupedBarChart,
    stackedPopulationBreakdownChart,
  } = variableConfigs[props.variable];
  return (
    <WithDatasets datasetIds={datasetIds}>
      {(datasets) => {
        return (
          <>
            <Grid container spacing={1} alignItems="flex-start">
              <Grid item xs={12} sm={12} md={6}>
                <strong>{groupedBarChart.title}</strong>
                <GroupedBarChart
                  data={groupedBarChart.getData(
                    datasets,
                    props.state1,
                    props.state2
                  )}
                  measure={groupedBarChart.measure}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <strong>{stackedPopulationBreakdownChart.title}</strong>
                <StackedBarChart
                  data={stackedPopulationBreakdownChart.getData(
                    datasets,
                    props.state1,
                    props.state2
                  )}
                  measure={stackedPopulationBreakdownChart.measure}
                />
              </Grid>
            </Grid>
            <Button>
              <LinkWithStickyParams
                to={`/datacatalog?dpf=${Object.keys(datasets).join(",")}`}
              >
                View Data Sources
              </LinkWithStickyParams>
            </Button>
          </>
        );
      }}
    </WithDatasets>
  );
}

export default CompareStatesForVariableReport;
