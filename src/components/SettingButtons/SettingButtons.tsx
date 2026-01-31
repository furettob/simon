import { useSelector, useDispatch } from "react-redux";
import styles from "./SettingButtons.module.scss";
import {
  GAME_STATUS,
  playNewLevelThunk,
  resetGame,
  toggleSkillLevel,
} from "@/utils/simonReducer";
import type { SimonState, AppDispatch } from "@/utils/simonReducer";
import classNames from "classnames";
import { Stack } from "@mui/system";
import RubberButton from "@/components/RubberButton/RubberButton";
import SwitchButton from "../SwitchButton/SwitchButton";

const SettingButtons = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { gameStatus, skillLevel } = useSelector((state: SimonState) => state);

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
          justifyContent="flex-end"
          spacing={2}
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
                console.log("last clicked");
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
            options={["OFF",1,2,3]}
            checkedOption={1}
            />
            <div>SKILL LEVEL</div>
          </Stack>
          {/* <div id="lastGamebutton">
            <div>
              <button
                onClick={() => dispatch(playNewLevelThunk())}
                disabled={gameStatus !== GAME_STATUS.IDLE}
                aria-label="Start"
              />

              <button onClick={() => dispatch(resetGame())}>Reset</button>

              {/* <div>
                <label>Skill Level (1,2,3,4)</label>
                <button onClick={() => dispatch(toggleSkillLevel())}>
                  {skillLevel}
                </button>
              </div>
            </div>
          </div>  */}
        </Stack>
        <div className={classNames(styles.gameName, styles.blackBorder)}>
          <svg width="100%" height="5.5em">
            <defs>
              <mask id="myMask">
                <rect width="100%" height="100%" fill="white" />
                <text
                  id="title"
                  x="50%"
                  y="0"
                  textAnchor="middle"
                  dy="1em"
                  fontSize="2em"
                  stroke="black"
                  strokeWidth="0.05em"
                >
                  redux
                </text>
                <text
                  id="subtitle"
                  x="50%"
                  y="0"
                  textAnchor="middle"
                  dy="1em"
                  fontSize="4.5em"
                  stroke="black"
                  strokeWidth="0.05em"
                >
                  simon
                </text>
              </mask>
            </defs>
            <rect
              width="100%"
              height="5.5em"
              fill="#242424"
              mask="url(#myMask)"
              rx=".5em"
              ry=".5em"
            />
          </svg>
        </div>
      </Stack>
    </div>
  );
};

export default SettingButtons;
