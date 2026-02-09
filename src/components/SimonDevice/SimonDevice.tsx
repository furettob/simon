import ColorButtons from "@/components/ColorButtons/ColorButtons";
import styles from "./SimonDevice.module.scss";
import SettingButtons from "@/components/SettingButtons/SettingButtons";
import { useEffect } from "react";
import { getSnackbarInfo } from "@/utils/snackbar";
import { useSnackbar } from "@/components/SnackbarProvider/SnackbarProvider";

const SimonDevice = () => {
  const { showSnackbar } = useSnackbar();
  useEffect(() => {
    showSnackbar(getSnackbarInfo({ snackbarKey: "idleHint" }));
  }, [showSnackbar]);
  return (
    <div className={styles.simonDeviceWrapper}>
      <div className={styles.topShell}>
        <ColorButtons />
      </div>
      <div className={styles.bottomShell}>
        <SettingButtons />
      </div>
    </div>
  );
};

export default SimonDevice;
