import styles from "./InfoDialog.module.scss";
import Dialog from "@mui/material/Dialog";
import { Stack } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";
import InstructionsPic from "@/assets/images/instructions_simon_game_pic.png";
import ReactLogo from "@/assets/images/react.png";
import ReduxLogo from "@/assets/images/redux.png";
import SassLogo from "@/assets/images/sass.png";
import MuiLogo from "@/assets/images/mui.png";

const InfoDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void | undefined;
}) => {
  return (
    <Dialog open={isOpen} onClose={() => onClose()} className={styles.root}>
      <div className={styles.contentWrapper}>
        <Stack
          direction="column"
          gap={1}
          justifyContent="space-around"
          className={styles.contentStack}
        >
          <Stack
            direction="row"
            className={styles.titleWrapper}
            justifyContent="space-between"
          >
            <div className={styles.title}>
              REPEAT THE SEQUENCE OF
              <br />
              FLASHING LIGHTS & SOUNDS!
            </div>
            <button className={styles.closeButton} onClick={() => onClose()}>
              <CloseIcon className={styles.closeIcon} />
            </button>
          </Stack>
          <div>
            <p>
              <a target="_blank" href="https://github.com/furettob/simon">Side project</a>{" "}
              implemented with: React + Redux, thunks, SCSS, Mui.
            </p>
            <p>
              Some fun challenges came from reproducing small details, e.g. using
              an SVG mask for the game name at the bottom, or adapt UX from a
              physical object to a single page digital game.
            </p>
          </div>
          <hr className={styles.redDivider} />
          <div>
            <Stack direction="row" gap={2} alignItems="center">
              <div className={styles.imageWrapper}>
                <img
                  alt="Simon Instructions Pic"
                  src={InstructionsPic}
                  className={styles.image}
                />
              </div>
              <div className={styles.text}>
                <p>
                  Think quickly. React fast. Watch the colored lights flash!
                  Listen to the sound signals. Repeat them exactly!
                  Ever-changing and ever-challenging sequences make this classic
                  electronic memory game unforgettable fun!
                </p>
                <ul>
                  <li>3 EXCITING GAMES</li>
                  <li>4 DIFFERENT SKILL LEVELS</li>
                  <li>COMPLETELY PORTABLE </li>
                </ul>
              </div>
            </Stack>
            <p>
              Simon Game (<a
                target="_blank" href="https://en.wikipedia.org/wiki/Simon_(game)"
                aria-label="Simon wiki page"
              >
                Wikipedia
              </a>) had many models and firmwares. The one
              reproduced here has 3 game modes and 4 skill levels. Use the
              switch to change them, and an info message will descrbe the new
              mode.
            </p>
          </div>
          <hr className={styles.redDivider} />
          <div>
            <p className={styles.subtitle}>For more elctronic fun...</p>
            <Stack direction="row" justifyContent="space-between" >
              <a className={styles.logoContainer} target="_blank" href="https://react.dev/">
                  <img src={ReactLogo} alt="React" />
                  <span>React</span>
              </a>
               <a className={styles.logoContainer} target="_blank" href="https://redux.js.org/">
                  <img src={ReduxLogo} alt="Redux"/>
                  <span>Redux</span>
              </a>
              <a className={styles.logoContainer} target="_blank" href="https://sass-lang.com/">
                  <img src={SassLogo} alt="Sass"/>
                  <span>Sass</span>
              </a>
               <a className={styles.logoContainer} target="_blank" href="https://mui.com/">
                  <img src={MuiLogo} alt="Mui"/>
                  <span>Mui</span>
              </a>
            </Stack>
            <p>Hosted on <a target="_blank" href="https://docs.github.com/en/pages">GitHub Pages</a>. Tracked with <a target="_blank" href="https://developers.google.com/analytics">GA4</a>. Made with fun by <a target="_blank" href="https://github.com/furettob/">FurettoB</a>.</p>
          </div>
        </Stack>
      </div>
    </Dialog>
  );
};

export default InfoDialog;
