import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./Snackbar.module.scss";
import classNames from "classnames";
import { getInterval } from "@/utils/intervals";
import { CSSTransition } from "react-transition-group";
import { useViewport } from "@/components/ViewportProvider/ViewportProvider";

// Snackbar context
type SnackbarContextType = {
  showSnackbar: (snackbarInfo: SnackbarProps | null) => void;
};

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [snackbarInfo, setSnackbarInfo] = useState<SnackbarProps | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const showSnackbar = useCallback((snackbarInfo: SnackbarProps | null) => {
    // Replace current message
    setSnackbarInfo(snackbarInfo ? { ...snackbarInfo, isVisible: true } : null);

    // Reset timer
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(
      () => {
        setSnackbarInfo(
          snackbarInfo ? { ...snackbarInfo, isVisible: false } : null,
        );
        timeoutRef.current = null;
      },
      getInterval({ intervalType: "snackbar" }),
    );
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbarInfo && <Snackbar {...snackbarInfo} />}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return ctx;
};

// Snackbar UI
export type SnackbarProps = {
  content: ReactNode;
  severity: "info" | "error" | "warning" | "success";
  isVisible?: boolean;
};

const Snackbar = ({ content, severity, isVisible }: SnackbarProps) => {
  const ref = useRef(null);

  const viewportType = useViewport();

  return (
    <CSSTransition
      nodeRef={ref}
      in={isVisible}
      timeout={300}
      className={styles.transitionWrapper}
      unmountOnExit
      classNames={{
        enter: styles.enter,
        enterActive: styles.enterActive,
        exit: styles.exit,
        exitActive: styles.exitActive,
      }}
    >
      <div ref={ref}>
        <div
          className={classNames(styles.wrapper, {
            [styles.wide]: viewportType === "wide",
            [styles.tall]: viewportType === "tall",
            [styles.short]: viewportType === "short",
          })}
        >
          <div
            className={classNames(styles.content, {
              [styles[severity]]: true,
            })}
          >
            {content}
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};
