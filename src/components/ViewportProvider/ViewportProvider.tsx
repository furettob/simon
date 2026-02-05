
import React, { createContext, useContext, useEffect, useState } from "react";

type ViewportType = "wide" | "tall" | "short";

const ViewportContext = createContext<ViewportType | null>(null);

const WIDE_BREAKPOINT = 1200; // 560 max SimonDevice width + 320px per side
const TALL_ASPECT_RATIO_THRESHOLD = 1.75;

export const ViewportProvider: React.FC<{
  children: React.ReactNode;
  breakpoint?: number;
}> = ({ children }) => {
  const getViewport = (): ViewportType => {
    if (typeof window === "undefined") return "wide"; // SSR fallback
    if (window.innerWidth > WIDE_BREAKPOINT) {
      return "wide";
    }
    if (window.innerHeight / Math.min(560, window.innerWidth) > TALL_ASPECT_RATIO_THRESHOLD) {
      return "tall"
    }
    return "short"
  };

  const [viewport, setViewport] = useState<ViewportType>(getViewport);

  useEffect(() => {
    let rafId: number | null = null;

    const onResize = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setViewport(getViewport());
      });
    };

    window.addEventListener("resize", onResize);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
};

export const useViewport = () => {
  const ctx = useContext(ViewportContext);
  if (!ctx) {
    throw new Error("useViewport must be used within ViewportProvider");
  }
  return ctx;
};
