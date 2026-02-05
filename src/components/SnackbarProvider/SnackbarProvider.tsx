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

  const showSnackbar = useCallback(
    (snackbarInfo: SnackbarProps | null ) => {
      // Replace current message
      setSnackbarInfo(snackbarInfo);

      // Reset timer
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setSnackbarInfo(null);
        timeoutRef.current = null;
      }, 5000);
    },
    [],
  );

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
};

const Snackbar = ({ content, severity }: SnackbarProps) => (
  <div className={styles.wrapper}>
    <div
      className={classNames(styles.content, {
        [styles.success]: severity === "success",
        [styles.info]: severity === "info",
        [styles.warning]: severity === "warning",
        [styles.error]: severity === "error",
      })}
    >
      {content}
    </div>
  </div>
);
