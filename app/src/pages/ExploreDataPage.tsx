import React from "react";
import WithDatasets from "../utils/WithDatasets";
import { LinkWithStickyParams } from "../utils/urlutils";
import { joinPopulation } from "../utils/datasetutils";
import GroupedBarChart from "../features/charts/GroupedBarChart";

// TODOs before PR:
// - move this comparison into a new page for the appropriate mad lib
// - full diabetes dataset
// - generalize joining
function ExploreDataPage() {
  return (
    <>
      <p>
        Research questions; explore key relationships across datasets, chosen by
        us; explore the data freely
      </p>
      <WithDatasets
        datasetIds={["brfss_diabetes", "acs_state_population_by_race"]}
      >
        {([brfss_diabetes, acs_state_population_by_race]) => {
          const joint = joinPopulation(
            brfss_diabetes.asDataFrame(),
            acs_state_population_by_race.asDataFrame()
          ).where((row) => ["Alabama", "California"].includes(row.state_name));
          return (
            <>
              <p>Number of people with diabetes per 100k population</p>
              <GroupedBarChart
                data={joint.toArray()}
                measure={"diabetes_per_100k"}
              />
              <LinkWithStickyParams
                to={`/datacatalog?dpf=${brfss_diabetes.metadata.id},${acs_state_population_by_race.metadata.id}`}
              >
                View Data Sources
              </LinkWithStickyParams>
            </>
          );
        }}
      </WithDatasets>
    </>
  );
}

export default ExploreDataPage;
