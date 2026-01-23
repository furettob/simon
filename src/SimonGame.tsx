import { useSelector, useDispatch } from "react-redux";
import "./App.css";
import {
  checkInput,
  COLORS,
  GAME_STATUS,
  addStepToSequence,
  playerInput,
  replaySequence,
  resetGame,
  setActiveButton,
  setStatus,
  playNewLevelThunk,
  toggleSkillLevel,
  handleClickColorButtonThunk,
  type SimonState,
} from "./utils/simonReducer";

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
        <p>Skill Level: {skillLevel}</p>
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

        <button
          onClick={() => dispatch(replaySequence())}
          disabled={
            gameStatus !== GAME_STATUS.WAITING &&
            gameStatus !== GAME_STATUS.SHOWING
          }
        >
          Replay Sequence
        </button>
      </div>

      <div>
        <h3>Debug Info:</h3>
        <p>Sequence: {sequence.map((i: number) => COLORS[i]).join(", ")}</p>
        <p>
          Player Input:{" "}
          {playerSequence.map((i: number) => COLORS[i]).join(", ")}
        </p>
      </div>
    </div>
  );
};

export default SimonGame;
