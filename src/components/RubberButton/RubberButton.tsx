import { useSelector, useDispatch } from "react-redux";
import styles from "./RubberButton.module.scss";
import {
  COLORS,
  GAME_STATUS,
  handleClickColorButtonThunk,
} from "@/utils/simonReducer";
import type { SimonState, AppDispatch } from "@/utils/simonReducer";
import classNames from "classnames";
import TopSticker from "../TopSticker/TopSticker";

const RubberButton = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Use selectors to get state
  const { gameStatus, activeButton } = useSelector(
    (state: SimonState) => state,
  );

  const handleButtonClick = (colorIndex: number) => {
    if (gameStatus !== GAME_STATUS.WAITING) return;
    dispatch(handleClickColorButtonThunk(colorIndex));
  };

  return (
    <div className={styles.rubberButtonWrapper}>
      <button>Ciao</button>
    </div>
  );
};

export default RubberButton;
