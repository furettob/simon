import classNames from "classnames";
import styles from "./SwitchButton.module.scss";

const SwitchButton = ({
  label,
  options,
  checkedOption,
  onClick,
}: {
  label: string;
  onClick?: () => void;
  options: (string | number)[];
  checkedOption: string | number;
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>{label}</div>
      <div className={styles.shell}>
        {options.map((option) => (
          <input
            key={option}
            type="radio"
            name={`radioGroup-${label}`}
            value={option}
            checked={option === checkedOption}
          />
        ))}
      </div>
      <div className={styles.labels}>
        {options.map((option) => (
          <div key={option} className={styles.labelContainer}>
            <div className={styles.label}>
              {option}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwitchButton;
