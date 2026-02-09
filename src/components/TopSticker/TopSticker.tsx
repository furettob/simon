import styles from "./TopSticker.module.scss";
import classNames from "classnames";

const TopSticker = () => {
  return (
      <div className={styles.wrapper}>
        <div className={styles.silverBg}>
          <div className={styles.content}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoContent}>
                <span className={classNames(styles.logo, styles.firstLetter)}>F</span>
                <span className={classNames(styles.logo, styles.secondLetter)}>B</span>
                <span className={styles.logoRegisteredSymbol}>Ⓡ</span>
              </div>
              <div className={styles.logoText}>FurettoB</div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TopSticker;