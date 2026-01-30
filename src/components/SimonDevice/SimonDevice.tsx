import ColorButtons from "@/components/ColorButtons/ColorButtons";
import styles from "./SimonDevice.module.scss";
import SettingButtons from "@/components/SettingButtons/SettingButtons";

const SimonDevice = () => (
  <div className={styles.simonDeviceWrapper}>
    <div className={styles.topShell}>
      <ColorButtons />
    </div>
    <div className={styles.bottomShell}>
      <SettingButtons />
    </div>
  </div>
);

export default SimonDevice;
