import { Stack } from "@mui/system";
import styles from "./SimonApp.module.scss";
import SimonDevice from "@/components/SimonDevice/SimonDevice";

const SimonGame = () => (
      <Stack alignItems="center" justifyContent="center" className={styles.simonAppContainer}>
        <SimonDevice />
      </Stack>
  );

export default SimonGame;
