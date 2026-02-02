import { useSelector, useDispatch } from "react-redux";
import styles from "./SettingButtons.module.scss";
import {
  playNewLevelThunk,
  setGameMode,
  setSkillLevel,
} from "@/utils/simonReducer";
import type { SimonState, AppDispatch } from "@/utils/simonReducer";
import classNames from "classnames";
import { Stack } from "@mui/system";
import RubberButton from "@/components/RubberButton/RubberButton";
import SwitchButton from "@/components/SwitchButton/SwitchButton";
import GameName from "@/components/GameName/GameName";

const SettingButtons = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { skillLevel, gameMode, gameStatus } = useSelector((state: SimonState) => state);

  const handleGameModeOptionClicked = ({
    option,
  }: {
    option: SimonState["gameMode"];
  }) => {
    dispatch(setGameMode(option));
  };

  const handleSkillLevelOptionClicked = ({
    option,
  }: {
    option: SimonState["skillLevel"];
  }) => {
    dispatch(setSkillLevel(option));
  };

  return (
    <div className={styles.settingButtonsWrapper}>
      <Stack
        className={styles.settingButtonsBorder}
        alignItems="stretch"
        flexDirection="column"
        justifyContent="flex-end"
      >
        <Stack
          className={classNames(styles.settingButtons, styles.blackBorder)}
          justifyContent="space-around"
        >
          <Stack justifyContent="space-around" spacing="6" flexDirection="row">
            <RubberButton
              color="blue"
              onClick={() => {
                console.log("last clicked");
              }}
              label="Last"
            />
            <RubberButton
              color="red"
              onClick={() => {
                if (gameStatus === "IDLE" && gameMode !== "OFF") {
                  dispatch(playNewLevelThunk());
                }
              }}
              label="Start"
            />
            <RubberButton
              color="blue"
              onClick={() => {
                console.log("last clicked");
              }}
              label="Longest"
            />
          </Stack>
          <Stack justifyContent="space-between" spacing="6" flexDirection="row">
            <SwitchButton
              label="game"
              options={["OFF", 1, 2, 3]}
              checkedOption={gameMode}
              onOptionClick={handleGameModeOptionClicked}
            />
            <SwitchButton
              label="skill level"
              options={[1, 2, 3, 4]}
              checkedOption={skillLevel}
              onOptionClick={handleSkillLevelOptionClicked}
            />
          </Stack>
        </Stack>
        <div className={styles.blackBorder}>
          <GameName />
        </div>
      </Stack>
    </div>
  );
};

export default SettingButtons;
