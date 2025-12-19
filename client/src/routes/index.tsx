import { useMemo } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home } from "@/pages";

function Router() {
  const isRoot = useMemo(() => {
    return window.location.pathname === "/";
  }, []);

  return (
    <BrowserRouter>
      <div className="relative w-full h-full overflow-hidden select-none bg-cover bg-center bg-black">
        <div
          className={cn(
            "absolute inset-0 bg-green-100 transition-opacity duration-700 ease-in-out",
            isRoot ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            "absolute inset-0 bg-grim-200 transition-opacity duration-700 ease-in-out",
            isRoot ? "opacity-0" : "opacity-100",
          )}
          aria-hidden="true"
        />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default Router;
