import { useSelector, useDispatch } from "react-redux";
import styles from "./ColorButtons.module.scss";
import {
  COLORS,
  GAME_STATUS,
  handleClickColorButtonThunk,
} from "@/utils/simonReducer";
import type { SimonState, AppDispatch, ColorIndex } from "@/utils/simonReducer";
import classNames from "classnames";
import TopSticker from "@/components/TopSticker/TopSticker";
import { useSnackbar } from "@/components/SnackbarProvider/SnackbarProvider";

const ColorButtons = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {showSnackbar} = useSnackbar()

  // Use selectors to get state
  const { gameStatus, activeButton } = useSelector(
    (state: SimonState) => state,
  );

  const handleButtonClick = (colorIndex: ColorIndex) => {
    if (gameStatus !== GAME_STATUS.WAITING) return;
    dispatch(handleClickColorButtonThunk(colorIndex, showSnackbar));
  };

  return (
    <div className={styles.colorButtonsWrapper}>
      <div className={styles.colorButtons}>
        {[COLORS[0], COLORS[1], COLORS[3], COLORS[2]].map((color) => (
          <div
            className={classNames(
              styles.colorButton,
              styles[`colorButton--${color}`],
              styles[`bgColor--${color}`],
              {
                [styles.colorLightUp]:
                  activeButton !== null && COLORS[activeButton] === color,
              },
            )}
            key={color}
            onClick={() => handleButtonClick(COLORS.indexOf(color) as ColorIndex)}
          >
            <div className={styles.ligtherBackground} />
            <div className={classNames(styles.light, styles.light1)} />
            <div className={classNames(styles.light, styles.light2)} />
            <div
              className={classNames(
                styles.offColor,
                `bgColor--${color.toLowerCase()}`,
              )}
            />
          </div>
        ))}
      </div>
      <TopSticker/>   
    </div>
  );
};

export default ColorButtons;
