import React, { useState } from "react";
import Carousel from "react-material-ui-carousel";
import { Paper } from "@material-ui/core";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import DemoReport from "../features/reports/DemoReport";
import DemoReport2 from "../features/reports/DemoReport2";
import { MADLIB_LIST, MadLib, PhraseSegment } from "../utils/MadLibs";
import styles from "./ExploreDataPage.module.scss";

function ExploreDataPage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phraseSelectionIds, setPhraseValues] = useState(
    MADLIB_LIST[0].phrase.map(() => 0)
  );

  function changeMadLib(index: number) {
    setPhraseValues(MADLIB_LIST[index].phrase.map(() => 0));
    setPhraseIndex(index);
  }

  return (
    <React.Fragment>
      <div className={styles.CarouselContainer}>
        <Carousel
          className={styles.Carousel}
          timeout={200}
          autoPlay={false}
          indicators={false}
          animation="slide"
          navButtonsAlwaysVisible={true}
          onChange={(index: number) => {
            changeMadLib(index);
          }}
        >
          {MADLIB_LIST.map((madlib: MadLib, i) => (
            <Paper elevation={3} className={styles.CarouselItem} key={i}>
              <CarouselMadLib
                madlib={madlib}
                phraseSelectionIds={phraseSelectionIds}
                setPhraseValues={setPhraseValues}
                key={i}
              />
            </Paper>
          ))}
        </Carousel>
      </div>
      <div className={styles.ReportContainer}>
        {phraseIndex === 0 && (
          <DemoReport
            madlib={MADLIB_LIST[0]}
            phraseSelectionIds={phraseSelectionIds}
          />
        )}
        {phraseIndex === 1 && (
          <DemoReport2
            madlib={MADLIB_LIST[1]}
            phraseSelectionIds={phraseSelectionIds}
          />
        )}
      </div>
    </React.Fragment>
  );
}

function CarouselMadLib(props: {
  madlib: MadLib;
  phraseSelectionIds: number[];
  setPhraseValues: (newArray: number[]) => void;
}) {
  return (
    <React.Fragment>
      {props.madlib.phrase.map(
        (phraseSegment: PhraseSegment, index: number) => (
          <React.Fragment>
            {typeof phraseSegment === "string" ? (
              <React.Fragment>{phraseSegment}</React.Fragment>
            ) : (
              <FormControl>
                <Select
                  className={styles.MadLibSelect}
                  name={index.toString()}
                  value={props.phraseSelectionIds[index]}
                  onChange={(event) => {
                    let phraseIndex: number = Number(event.target.name);
                    let updatedArray: number[] = [...props.phraseSelectionIds];
                    updatedArray[phraseIndex] = Number(event.target.value);
                    props.setPhraseValues(updatedArray);
                  }}
                >
                  {Object.keys(phraseSegment).map(
                    (value: string, index: number) => (
                      <MenuItem key={index} value={index}>
                        {phraseSegment[index]}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            )}
          </React.Fragment>
        )
      )}
    </React.Fragment>
  );
}

export default ExploreDataPage;
