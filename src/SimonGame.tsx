import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./App.css";
import { playSound } from "./utils/sound";
import { checkInput, COLORS, GAME_STATUS, addStepToSequence, playerInput, replaySequence, resetGame, setActiveButton, setStatus, startGame, toggleStrictMode } from "./utils/simonReducer";

// ==================== REACT COMPONENT ====================
const SimonGame = () => {
  const dispatch = useDispatch();
  
  // Use selectors to get state
  const gameStatus = useSelector((state) => state.gameStatus);
  const sequence = useSelector((state) => state.sequence);
  const playerSequence = useSelector((state) => state.playerSequence);
  const score = useSelector((state) => state.score);
  const strictMode = useSelector((state) => state.strictMode);
  const activeButton = useSelector((state) => state.activeButton);
  const highScore = useSelector((state) => state.highScore);

  // Handle SUCCESS status
  // useEffect(() => {
  //   if (gameStatus === GAME_STATUS.SUCCESS) {
  //     const timer = setTimeout(() => {
  //       dispatch(addStepToSequence());
  //     }, 1100);
  //     return () => clearTimeout(timer);
  //   }
  // }, [gameStatus, dispatch]);

  const handleButtonClick = (colorIndex: number) => {
    if (gameStatus !== GAME_STATUS.WAITING) return;

    // Visual and audio feedback
    dispatch(setActiveButton(colorIndex));
    playSound(colorIndex);

    setTimeout(() => {
      dispatch(setActiveButton(null));
    }, 300);

    // Record player input
    dispatch(playerInput(colorIndex));

    // Check the input
    setTimeout(() => {
      dispatch(checkInput());
    }, 100);
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
        <p>High Score: {highScore}</p>
        <p>
          Status: {getStatusMessage()} - {gameStatus}
        </p>
        <p>Strict Mode: {strictMode ? "ON" : "OFF"}</p>
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
          onClick={() => dispatch(startGame())}
          disabled={
            gameStatus !== GAME_STATUS.IDLE &&
            gameStatus !== GAME_STATUS.GAME_OVER
          }
        >
          Start Game
        </button>

        <button onClick={() => dispatch(resetGame())}>Reset</button>

        <button onClick={() => dispatch(toggleStrictMode())}>
          Toggle Strict Mode
        </button>

        <button onClick={() => dispatch(replaySequence())} disabled={gameStatus !== GAME_STATUS.WAITING && gameStatus !== GAME_STATUS.SHOWING}>
            Replay Sequence
          </button>
      </div>

      <div>
        <h3>Debug Info:</h3>
        <p>Sequence: {sequence.map((i: number) => COLORS[i]).join(", ")}</p>
        <p>Player Input: {playerSequence.map((i: number) => COLORS[i]).join(", ")}</p>
      </div>
    </div>
  );
};

export default SimonGame;
