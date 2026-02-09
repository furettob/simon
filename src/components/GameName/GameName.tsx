import styles from "./GameName.module.scss";

const GameName = () => (
  <div className={styles.gameName}>
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
        fill="$color-black-device"
        mask="url(#myMask)"
        rx=".5em"
        ry=".5em"
      />
    </svg>
  </div>
);

export default GameName;
