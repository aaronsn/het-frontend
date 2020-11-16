import React from "react";
import WithDatasets from "../../utils/WithDatasets";
import { LinkWithStickyParams } from "../../utils/urlutils";
import GroupedBarChart from "../../features/charts/GroupedBarChart";
import { Dataset, Row } from "../../utils/DatasetTypes";

interface CompareStatesForVariableProps {
  state1: string;
  state2: string;
  variable: string;
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
  return brfss_diabetes
    .toDataFrame()
    .where((row) => [state1, state2].includes(row.state_name))
    .join(
      acs_state_population_by_race.toDataFrame(),
      keySelector,
      keySelector,
      (dia, acs) => ({ ...acs, ...dia })
    )
    .generateSeries({
      diabetes_per_100k: (row) =>
        Math.round(row.diabetes_count / (row.population / 100000)),
    })
    .toArray();
}

interface VariableConfig {
  datasetIds: string[];
  groupedBarChart: {
    title: string;
    measure: string;
    getData: (
      datasets: Record<string, Dataset>,
      state1: string,
      state2: string
    ) => Row[];
  };
}

const variableConfigs: Record<string, VariableConfig> = {
  Diabetes: {
    datasetIds: ["brfss_diabetes", "acs_state_population_by_race"],
    groupedBarChart: {
      title: "Number of people with diabetes per 100k population",
      measure: "diabetes_per_100k",
      getData: getDiabetesBarChartData,
    },
  },
};

function CompareStatesForVariableReport(props: CompareStatesForVariableProps) {
  const { datasetIds, groupedBarChart } = variableConfigs[props.variable];
  return (
    <WithDatasets datasetIds={datasetIds}>
      {(datasets) => {
        return (
          <>
            <p>{groupedBarChart.title}</p>
            <GroupedBarChart
              data={groupedBarChart.getData(
                datasets,
                props.state1,
                props.state2
              )}
              measure={groupedBarChart.measure}
            />
            <LinkWithStickyParams
              to={`/datacatalog?dpf=${Object.keys(datasets).join(",")}`}
            >
              View Data Sources
            </LinkWithStickyParams>
          </>
        );
      }}
    </WithDatasets>
  );
}

export default CompareStatesForVariableReport;
