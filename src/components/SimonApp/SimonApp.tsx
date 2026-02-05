import { Stack } from "@mui/system";
import styles from "./SimonApp.module.scss";
import SimonDevice from "@/components/SimonDevice/SimonDevice";
import { SnackbarProvider } from "@/components/SnackbarProvider/SnackbarProvider";

const SimonGame = () => (
  <SnackbarProvider>
    <Stack
      alignItems="center"
      justifyContent="center"
      className={styles.simonAppContainer}
    >
      <SimonDevice />
    </Stack>
  </SnackbarProvider>
);

export default SimonGame;
