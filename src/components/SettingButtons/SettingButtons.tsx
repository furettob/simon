import { useSelector, useDispatch } from "react-redux";
import styles from "./SettingButtons.module.scss";
import { GAME_STATUS, handleClickColorButtonThunk } from "@/utils/simonReducer";
import type { SimonState, AppDispatch } from "@/utils/simonReducer";
import classNames from "classnames";
import { Stack } from "@mui/system";
import RubberButton from "@/components/RubberButton/RubberButton";

const SettingButtons = () => {
  const dispatch = useDispatch<AppDispatch>();

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
        >
          <div id="lastGamebutton">
            <RubberButton
              color="blue"
              onClick={() => {
                console.log("last clicked");
              }}
              label="Last"
            />
          </div>
        </Stack>
        <div className={classNames(styles.gameName, styles.blackBorder)}>
          <svg width="100%" height="5.5em">
            <defs>
              <mask id="myMask">
                <rect width="100%" height="100%" fill="white" />
                <text id="title" x="50%" y="0" text-anchor="middle" dy="1em" fontSize="2em">
                  redux
                </text>
                <text id="subtitle" x="50%" y="0" text-anchor="middle" dy="1em" fontSize="4.5em">
                  simon
                </text>
              </mask>
            </defs>
            <rect width="100%" height="5.5em" fill="#242424" mask="url(#myMask)" rx=".5em" ry=".5em" />
          </svg>
        </div>
      </Stack>
    </div>
  );
};

export default SettingButtons;
