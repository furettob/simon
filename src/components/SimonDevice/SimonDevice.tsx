import { useSelector, useDispatch } from "react-redux";
import {
  GAME_STATUS,
  resetGame,
  playNewLevelThunk,
  toggleSkillLevel,
} from "@/utils/simonReducer";
import type { SimonState, AppDispatch } from "@/utils/simonReducer";
import ColorButtons from "@/components/ColorButtons/ColorButtons";
import styles from "./SimonDevice.module.scss";
import SettingButtons from "@/components/SettingButtons/SettingButtons";

const SimonDevice = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { gameStatus, skillLevel } = useSelector((state: SimonState) => state);

  return (
    <div className={styles.simonDeviceWrapper}>
      <div className={styles.topShell}>
        <ColorButtons />
      </div>
      <div className={styles.bottomShell}>
        <SettingButtons />
      </div>
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
  );
};

export default SimonDevice;
