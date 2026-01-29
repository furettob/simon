import { useSelector, useDispatch } from "react-redux";
import {
  GAME_STATUS,
  resetGame,
  playNewLevelThunk,
  toggleSkillLevel,
} from "@/utils/simonReducer";
import type { SimonState, AppDispatch } from "@/utils/simonReducer";
import { ColorIndicator } from "@/components/ColorIndicator/ColorIndicator";
import { Stack } from "@mui/system";
import ColorButtons from "@/components/ColorButtons/ColorButtons";
import styles from "./SimonGame.module.scss";

const SimonGame = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    gameStatus,
    sequence,
    playerSequence,
    score,
    skillLevel,
  } = useSelector((state: SimonState) => state);

  return (
    <div>
      <Stack
        spacing={6}
        direction="row"
        alignItems="center"
        justifyContent="stretch"
      >
        <div>
          <h1>Simon Game</h1>

          <div>
            <p>Level: {sequence.length}</p>
            <p>Score: {score}</p>
          </div>
        </div>
        <div className={styles.simonDeviceWrapper}>
          <ColorButtons />
          <div>
            <button
              onClick={() => dispatch(playNewLevelThunk())}
              disabled={gameStatus !== GAME_STATUS.IDLE}
              aria-label="Start"
            />

            <button onClick={() => dispatch(resetGame())}>Reset</button>

            <div>
              <label>Skill Level (1,2,3,4)</label>
              <button onClick={() => dispatch(toggleSkillLevel())}>
                {skillLevel}
              </button>
            </div>
          </div>
        </div>
      </Stack>
      <div className={styles.debugContainer}>
        <h3>Debug Info:</h3>
        <Stack direction="row" spacing={1}>
          <span className={styles.debugLabel}>GS: </span>
          {sequence.map((colorIndex: number, index: number) => (
            <ColorIndicator
              key={`${index}_${colorIndex}`}
              colorIndex={colorIndex}
              isHighlighted={index === playerSequence.length}
            />
          ))}
        </Stack>
      </div>
    </div>
  );
};

export default SimonGame;
