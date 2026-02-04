import { type CSSProperties, useEffect, useMemo } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { setOfflineMode } from "@/offline/mode";
import { Game, Games, Home } from "@/pages";

function RouterView() {
  const { pathname } = useLocation();
  const safeArea = useMemo(() => {
    if (pathname.startsWith("/play")) {
      return {
        top: "#0C1806",
        bottom: "var(--black-100)",
      };
    }
    if (pathname.startsWith("/games")) {
      return {
        top: "#0C1806",
        bottom: "var(--black-100)",
      };
    }
    return {
      top: "#0C1806",
      bottom: "var(--black-100)",
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.setProperty("--safe-area-top", safeArea.top);
    document.body.style.setProperty("--safe-area-bottom", safeArea.bottom);
    document.documentElement.style.setProperty("--safe-area-top", safeArea.top);
    document.documentElement.style.setProperty(
      "--safe-area-bottom",
      safeArea.bottom,
    );
  }, [safeArea]);

  useEffect(() => {
    if (pathname.startsWith("/games") || pathname.startsWith("/play")) return;
    setOfflineMode(false);
  }, [pathname]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-cover bg-center bg-black">
      <div
        className="safe-area-bar safe-area-top"
        style={
          {
            "--safe-area-top": safeArea.top,
            "--safe-area-top-fallback": "6px",
          } as CSSProperties
        }
        aria-hidden="true"
      />
      <div
        className="safe-area-bar safe-area-bottom"
        style={
          {
            "--safe-area-bottom": safeArea.bottom,
            "--safe-area-bottom-fallback": "0px",
          } as CSSProperties
        }
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute inset-0 bg-green-gradient-100 transition-opacity duration-700 ease-in-out",
          // isRoot ? "opacity-100" : "opacity-0",
        )}
        aria-hidden="true"
      />
      <div className="relative z-10 h-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/play" element={<Game />} />
        </Routes>
      </div>
    </div>
  );
}

function Router() {
  return (
    <BrowserRouter>
      <RouterView />
    </BrowserRouter>
  );
}

export default Router;
