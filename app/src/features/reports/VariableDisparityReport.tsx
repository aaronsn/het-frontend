import React, { useState } from "react";
import { Grid } from "@material-ui/core";
import WithDatasets from "../../utils/WithDatasets";
import useDatasetStore from "../../utils/useDatasetStore";
import { Breakdowns } from "../../utils/Breakdowns";
import variableProviders, { VariableId } from "../../utils/variableProviders";
import VariableProvider from "../../utils/variables/VariableProvider";
import DisparityBarChartCard from "../cards/DisparityBarChartCard";
import TableChart from "../charts/TableChart";
import { DropdownVarId } from "../../utils/MadLibs";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Alert from "@material-ui/lab/Alert";
import Card from "@material-ui/core/Card";
import cardStyles from "../cards/Card.module.scss";

const VARIABLE_DISPLAY_NAMES: Record<string, Record<string, string>> = {
  covid: {
    covid_cases_pct_of_geo: "COVID-19 Cases",
    covid_deaths_pct_of_geo: "COVID-19  Deaths",
    covid_hosp_pct_of_geo: "COVID-19 Hospitalizations",
  },
};

function asDate(dateStr: string) {
  const parts = dateStr.split("-").map(Number);
  // Date expects month to be 0-indexed so need to subtract 1.
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function DisVarGeo(props: {
  dropdownVarId: DropdownVarId;
  stateFips: string;
  vertical?: boolean;
}) {
  // TODO Remove hard coded fail safe value
  const validDropdownVariable = Object.keys(
    VARIABLE_DISPLAY_NAMES
  ) as DropdownVarId[];
  const [metric, setMetric] = useState<VariableId>(
    validDropdownVariable.includes(props.dropdownVarId)
      ? (Object.keys(
          VARIABLE_DISPLAY_NAMES[props.dropdownVarId]
        )[0] as VariableId)
      : "covid_cases_pct_of_geo"
  );

  const datasetStore = useDatasetStore();
  const varProvider = variableProviders[metric];
  const popProvider = variableProviders["population_pct"];
  const datasetIds = VariableProvider.getUniqueDatasetIds([
    varProvider,
    popProvider,
  ]);

  return (
    <>
      {!Object.keys(VARIABLE_DISPLAY_NAMES).includes(props.dropdownVarId) && (
        <Grid container xs={12} spacing={1} justify="center">
          <Grid item xs={5}>
            <Alert severity="error">Data not currently available</Alert>
          </Grid>
        </Grid>
      )}

      {Object.keys(VARIABLE_DISPLAY_NAMES).includes(props.dropdownVarId) && (
        <Grid container spacing={1} justify="center">
          <WithDatasets datasetIds={datasetIds}>
            {() => {
              const data = varProvider
                .getData(
                  datasetStore.datasets,
                  Breakdowns.byState().andTime().andRace(true)
                )
                .concat(
                  varProvider.getData(
                    datasetStore.datasets,
                    Breakdowns.national().andTime().andRace(true)
                  )
                )
                .filter((row) => row.state_fips === props.stateFips)
                .filter(
                  (row) =>
                    row.race_and_ethnicity !== "Total" &&
                    row.race_and_ethnicity !== "Not Hispanic or Latino"
                );

              const dateTimes = data.map((row) => asDate(row.date).getTime());
              const lastDate = new Date(Math.max(...dateTimes));
              const dataset = data.filter(
                (row) => asDate(row.date).getTime() === lastDate.getTime()
              );

              return (
                <>
                  <Grid item xs={12}>
                    <ToggleButtonGroup
                      exclusive
                      value={metric}
                      onChange={(e, v) => {
                        if (v !== null) {
                          setMetric(v);
                        }
                      }}
                      aria-label="text formatting"
                    >
                      {Object.entries(
                        VARIABLE_DISPLAY_NAMES[props.dropdownVarId]
                      ).map(([variableId, displayName]: [string, string]) => (
                        <ToggleButton value={variableId as VariableId}>
                          {displayName}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid item xs={props.vertical ? 12 : 6}>
                    <DisparityBarChartCard
                      dataset={dataset}
                      datasetIds={datasetIds}
                      variableId={varProvider.variableId}
                      variableDisplayName={
                        VARIABLE_DISPLAY_NAMES[props.dropdownVarId][metric]
                      }
                      breakdownVar="race_and_ethnicity"
                      breakdownVarDisplayName="Race/Ethnicity"
                    />
                    <DisparityBarChartCard
                      datasetIds={datasetIds}
                      variableId={varProvider.variableId}
                      variableDisplayName={
                        VARIABLE_DISPLAY_NAMES[props.dropdownVarId][metric]
                      }
                      breakdownVar="age"
                      breakdownVarDisplayName="Age"
                    />
                    <DisparityBarChartCard
                      datasetIds={datasetIds}
                      variableId={varProvider.variableId}
                      variableDisplayName={
                        VARIABLE_DISPLAY_NAMES[props.dropdownVarId][metric]
                      }
                      breakdownVar="gender"
                      breakdownVarDisplayName="Gender"
                    />
                  </Grid>
                  <Grid item xs={props.vertical ? 12 : 6}>
                    <Card raised={true} className={cardStyles.ChartCard}>
                      <TableChart
                        data={dataset}
                        fields={[
                          {
                            name: "race_and_ethnicity",
                            displayName: "Race",
                          },
                          { name: "population", displayName: "Population" },
                          {
                            name: "population_pct",
                            displayName: "Population %",
                          },
                          {
                            name: metric,
                            displayName:
                              VARIABLE_DISPLAY_NAMES[props.dropdownVarId][
                                metric
                              ] + " as % of Geo",
                          },
                        ]}
                      />
                    </Card>
                  </Grid>
                </>
              );
            }}
          </WithDatasets>
        </Grid>
      )}
    </>
  );
}

export default DisVarGeo;