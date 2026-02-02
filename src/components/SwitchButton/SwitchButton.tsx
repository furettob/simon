import styles from "./SwitchButton.module.scss";

type SwitchButtonProps<T> = {
  label: string;
  options: T[];
  checkedOption: T;
  onOptionClick: ({ option }: { option: T }) => void;
  getKey?: (option: T) => string | number;
  renderLabel?: (option: T) => React.ReactNode;
  disabled?: boolean;
};

const SwitchButton = <T,>({
  label,
  options,
  checkedOption,
  onOptionClick,
  getKey = (option) => String(option),
  renderLabel = (option) => String(option),
  disabled,
}: SwitchButtonProps<T>) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>{label}</div>
      <div className={styles.shell}>
        {options.map((option) => (
          <input
            key={getKey(option)}
            type="radio"
            name={`radioGroup-${label}`}
            value={getKey(option)}
            checked={option === checkedOption}
            onChange={() => onOptionClick({ option })}
            disabled={disabled}
          />
        ))}
      </div>
      <div className={styles.labels}>
        {options.map((option) => (
          <div key={getKey(option)} className={styles.labelContainer}>
            <div
              className={styles.label}
              onClick={() => !disabled && onOptionClick({ option })}
            >
              {renderLabel(option)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwitchButton;
