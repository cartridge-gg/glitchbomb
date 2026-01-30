import { useMemo, type CSSProperties } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Game, Games, Home } from "@/pages";

function Router() {
  const { pathname } = useLocation();
  const safeAreaStyle = useMemo(() => {
    if (pathname.startsWith("/play")) {
      return {
        "--safe-area-top": "var(--green-900)",
        "--safe-area-bottom": "var(--black-100)",
      } as CSSProperties;
    }
    if (pathname.startsWith("/games")) {
      return {
        "--safe-area-top": "var(--green-900)",
        "--safe-area-bottom": "var(--green-950)",
      } as CSSProperties;
    }
    return {
      "--safe-area-top": "var(--green-900)",
      "--safe-area-bottom": "var(--green-950)",
    } as CSSProperties;
  }, [pathname]);

  return (
    <BrowserRouter>
      <div
        className="safe-area-paint relative w-full h-full overflow-hidden select-none bg-cover bg-center bg-black"
        style={safeAreaStyle}
      >
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
    </BrowserRouter>
  );
}

export default Router;
