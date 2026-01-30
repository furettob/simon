import styles from "./TopSticker.module.scss";
import classNames from "classnames";

const TopSticker = () => {
  return (
      <div className={styles.topStickerWrapper}>
        <div className={styles.topStickerSticker}>
          <div className={styles.topStickerContent}>
            <div className={styles.topStickerLogoWrapper}>
              <div className={styles.topStickerLogoWithDecoration}>
                <span className={classNames(styles.topStickerLogo, styles.topStickerLogoF)}>F</span>
                <span className={classNames(styles.topStickerLogo, styles.topStickerLogoB)}>B</span>
                <span className={styles.topStickerTextDecoration}>Ⓡ</span>
              </div>
              <div className={styles.topStickerText}>FurettoB</div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TopSticker;