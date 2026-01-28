import { useSelector, useDispatch } from "react-redux";
import * as styles from "./SimonGame.module.scss";
import {
  COLORS,
  GAME_STATUS,
  resetGame,
  playNewLevelThunk,
  toggleSkillLevel,
  handleClickColorButtonThunk,
  type SimonState,
  type AppDispatch,
} from '@/utils/simonReducer'
import { ColorIndicator } from "../../ColorIndicator";
import { Stack } from "@mui/system";
import classNames from "classnames";

// ==================== REACT COMPONENT ====================
const SimonGame = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Use selectors to get state
  const {
    gameStatus,
    sequence,
    playerSequence,
    score,
    activeButton,
    skillLevel,
  } = useSelector((state: SimonState) => state);

  const handleButtonClick = (colorIndex: number) => {
    if (gameStatus !== GAME_STATUS.WAITING) return;
    dispatch(handleClickColorButtonThunk(colorIndex));
  };

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
          <div className={styles.colorButtonsWrapper}>
            <div className={"colorButtons"}>
              {[COLORS[0], COLORS[1], COLORS[3], COLORS[2]].map((color) => (
                <div
                  className={classNames(
                    "colorButton",
                    `colorButton--${color}`,
                    `bgColor--${color.toLowerCase()}`,
                    {
                      ["colorLightUp"]:
                        activeButton !== null && COLORS[activeButton] === color,
                    },
                  )}
                  key={color}
                  onClick={() => handleButtonClick(COLORS.indexOf(color))}
                >
                  <div className="ligtherBackground" />
                  <div className="light1" />
                  <div className="light2" />
                  <div
                    className={classNames(
                      "offColor",
                      `bgColor--${color.toLowerCase()}`,
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="trademarkWrapper">
              <div className="trademarkSticker">
                <div className="trademarkContent">
                  <div className="trademarkLogoWrapper">
                    <div>
                      <span className="trademarkTextDecoration" style={{ opacity: 0 }}>Ⓡ</span>
                      <span className="trademarkLogo trademarkLogoF">F</span>
                      <span className="trademarkLogo trademarkLogoB">B</span>
                      <span className="trademarkTextDecoration">Ⓡ</span>
                    </div>
                    <div className="trademarkText">FurettoB</div>
                  </div>
                </div>
              </div>
            </div>
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
      </Stack>
      <div className="debug_container">
        <h3>Debug Info:</h3>
        <Stack direction="row" spacing={1}>
          <span className="debugLabel">GS: </span>
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
