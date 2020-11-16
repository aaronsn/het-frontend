import React from "react";
import CompareStatesForVariableReport from "../features/charts/CompareStatesForVariableReport";

function ExploreDataPage() {
  return (
    <>
      <p>
        Research questions; explore key relationships across datasets, chosen by
        us; explore the data freely
      </p>
      <CompareStatesForVariableReport
        state1={"Alabama"}
        state2={"California"}
        variable={"Diabetes"}
      />
    </>
  );
}

export default ExploreDataPage;
