import { useSelector } from "react-redux";
import styles from "./Dashboard.module.scss";
import { COLORS_EMOJI, type SimonState } from "@/utils/simonReducer";
import classNames from "classnames";
import ShareIcon from "@mui/icons-material/Share";
import InfoIcon from "@mui/icons-material/Info";
import { Stack } from "@mui/system";
import { useCallback } from "react";
import ReactGA from "react-ga4";
import { getLongestSequenceInMemory } from "@/utils/sequence";

const Dashboard = () => {
  // Use selectors to get state
  const { sequenceLength, longestSequence: longestSequenceInState} = useSelector((state: SimonState) => state);

  const level = sequenceLength > 0 ? `0${sequenceLength}`.slice(-2) : "--";

  const shareText = useCallback(async (): Promise<"shared" | "copied"> => {
    const longestSequence = getLongestSequenceInMemory({longestSequenceInState})
    const introText = longestSequence.length >= 5 ? `I reached level ${longestSequence.length} at 'Simon Says' game!`: `I just played 'Simon Says' game!`
    const title =  `80s nostalgia!`
    const text = `${introText} Try it at https://furettob.github.io/simon ${COLORS_EMOJI[0]}${COLORS_EMOJI[1]}${COLORS_EMOJI[2]}${COLORS_EMOJI[3]}`

    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: "https://furettob.github.io/simon",
        });
        ReactGA.event({
          category: "share",
          action: "share button clicked",
          label: "sharing", 
          value: 2
        });
        return 'shared'
      } catch {
        // user cancelled or share failed → fallback
      }
    }
    // Clipboard fallback
    await navigator.clipboard.writeText(`${title} ${text}`);
    return "copied";
  }, [longestSequenceInState]);

  return (
    <div className={styles.container}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <div className={styles.item}>
          <div className={styles.level}>{level}</div>
        </div>
        <div className={styles.item} onClick={shareText}>
          <ShareIcon
            fontSize="medium"
            className={classNames(styles.icon, styles.share)}
          />
        </div>
        <div className={styles.item}>
          <InfoIcon
            fontSize="medium"
            className={classNames(styles.icon, styles.info)}
          />
        </div>
      </Stack>
    </div>
  );
};

export default Dashboard;
