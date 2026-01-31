import classNames from "classnames";
import styles from "./RubberButton.module.scss";

const RubberButton = ({
  color = "blue",
  label,
  onClick,
}: {
  color?: "blue" | "red";
  onClick: () => void;
  label: string;
}) => {
  return (
    <div className={classNames(styles.wrapper, {
          [styles.blue]: color === "blue",
          [styles.red]: color === "red",
        })}>
      <div
        className={styles.shell}
      >
        <button className={styles.button} onClick={onClick} />
      </div>
      <div className={styles.label} >{label.toUpperCase()}</div>
    </div>
  );
};

export default RubberButton;
