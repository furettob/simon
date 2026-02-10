import { useSelector } from "react-redux";
import styles from "./Dashboard.module.scss";
import type { SimonState, } from "@/utils/simonReducer";
import classNames from "classnames";
import ShareIcon from "@mui/icons-material/Share";
import InfoIcon from "@mui/icons-material/Info";
import { Stack } from "@mui/system";
import { useCallback } from "react";

const Dashboard = () => {
  // Use selectors to get state
  const {  sequenceLength } = useSelector(
    (state: SimonState) => state,
  );

  const level = sequenceLength > 0 ? `0${sequenceLength}`.slice(-2) : "--";

  const shareText = useCallback(async (): Promise<"shared" | "copied"> => {
    const text = "Visit www.google.com now!";

    console.log("BEFORE TRY!!!");
    // Try native share first 📤
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this out!",
          text: "Visit www.google.com now!",
          url: "https://www.google.com",
        });
        return "shared";
      } catch {
        // user cancelled or share failed → fallback
        console.log("CATCH!!!");
      }
    }

    // Clipboard fallback 📋
    await navigator.clipboard.writeText(text);
    return "copied";
  }, []);

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
