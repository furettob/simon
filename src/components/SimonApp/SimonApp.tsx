import { useSelector } from "react-redux";
import type { SimonState } from "@/utils/simonReducer";
import { ColorIndicator } from "@/components/ColorIndicator/ColorIndicator";
import { Stack } from "@mui/system";
import styles from "./SimonApp.module.scss";
import SimonDevice from "@/components/SimonDevice/SimonDevice";

const SimonGame = () => {
  const { sequenceLength, completeSequence, playerSequence } = useSelector(
    (state: SimonState) => state,
  );

  return (
    <div>
      <Stack alignItems="center" className={styles.simonAppContainer}>
        <SimonDevice />
      </Stack>
      <div className={styles.tmp}>
        <Stack
          spacing={6}
          padding={6}
          direction="row"
          alignItems="center"
          justifyContent="stretch"
        >
          <div>
            <h1>Simon Game</h1>
            <div>
              <p>Level: {sequenceLength}</p>
            </div>
          </div>
        </Stack>
        <div className={styles.debugContainer}>
          <h3>Debug Info:</h3>
          <Stack direction="row" spacing={1}>
            <span className={styles.debugLabel}>GS: </span>
            {completeSequence.map((colorIndex: number, index: number) => (
              <ColorIndicator
                key={`${index}_${colorIndex}`}
                colorIndex={colorIndex}
                isHighlighted={index === playerSequence.length}
              />
            ))}
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default SimonGame;
