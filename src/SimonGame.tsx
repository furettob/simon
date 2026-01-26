import { useSelector, useDispatch } from "react-redux";
import "./App.css";
import {
  COLORS,
  GAME_STATUS,
  resetGame,
  playNewLevelThunk,
  toggleSkillLevel,
  handleClickColorButtonThunk,
  type SimonState,
} from "./utils/simonReducer";
import { ColorIndicator } from "./ColorIndicator";
import { Stack } from "@mui/system";

// ==================== REACT COMPONENT ====================
const SimonGame = () => {
  const dispatch = useDispatch();

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

  const getStatusMessage = () => {
    switch (gameStatus) {
      case GAME_STATUS.IDLE:
        return "Press Start to Begin";
      case GAME_STATUS.SHOWING:
        return "Watch the sequence...";
      case GAME_STATUS.WAITING:
        return "Your turn!";
      case GAME_STATUS.SUCCESS:
        return "Correct! Next level...";
      case GAME_STATUS.GAME_OVER:
        return `Game Over! Final Score: ${score}`;
      default:
        return "";
    }
  };

  return (
    <div>
      <h1>Simon Game</h1>

      <div>
        <p>Level: {sequence.length}</p>
        <p>Score: {score}</p>
        <p>
          Status: {getStatusMessage()} - {gameStatus}
        </p>
      </div>

      <div className="color_buttons_container">
        {COLORS.map((color, index) => (
          <button
            key={color}
            onClick={() => handleButtonClick(index)}
            disabled={gameStatus !== GAME_STATUS.WAITING}
            style={{
              backgroundColor: color,
              opacity: activeButton === index ? 1 : 0.6,
            }}
          >
            {color}
          </button>
        ))}
      </div>

      <div>
        <button
          onClick={() => dispatch(playNewLevelThunk())}
          disabled={
            gameStatus !== GAME_STATUS.IDLE &&
            gameStatus !== GAME_STATUS.GAME_OVER
          }
        >
          Start Game
        </button>

        <button onClick={() => dispatch(resetGame())}>Reset</button>

        <div>
          <label>Skill Level (1,2,3,4)</label>
          <button onClick={() => dispatch(toggleSkillLevel())}>
            {skillLevel}
          </button>
        </div>
      </div>

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
        <Stack direction="row" spacing={1}>
          <span className="debugLabel">PS: </span>
          {playerSequence.map((colorIndex: number, index: number) => (
            <ColorIndicator
              key={`${index}_${colorIndex}`}
              colorIndex={colorIndex}
            />
          ))}
        </Stack>
      </div>
    </div>
  );
};

export default SimonGame;
