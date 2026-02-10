import { Stack } from "@mui/system";
import styles from "./SimonApp.module.scss";
import SimonDevice from "@/components/SimonDevice/SimonDevice";
import { SnackbarProvider } from "@/components/SnackbarProvider/SnackbarProvider";
import { ViewportProvider } from "../ViewportProvider/ViewportProvider";
import Dashboard from "../Dashboard/Dashboard";

const SimonGame = () => (
  <ViewportProvider>
    <SnackbarProvider>
      <Stack
        alignItems="center"
        justifyContent="center"
        className={styles.container}
      >
        <SimonDevice />
        <div className={styles.dashboardWrapper}>
          <Dashboard/>
        </div>
      </Stack>
    </SnackbarProvider>
  </ViewportProvider>
);

export default SimonGame;
