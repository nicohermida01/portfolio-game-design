import { lazy, Suspense } from "react";
import { useGameStore } from "./store.js";
import PagePortfolio from "./ui/PagePortfolio.jsx";
import ModeSwitch from "./ui/ModeSwitch.jsx";

// The whole 3D bundle (three, rapier, drei, the model) is split out here and
// only fetched when the visitor switches to 3D mode.
const ThreeScene = lazy(() => import("./scene/ThreeScene.jsx"));

export default function App() {
  const mode = useGameStore((s) => s.mode);

  return (
    <>
      {mode === "page" ? (
        <PagePortfolio />
      ) : (
        <Suspense
          fallback={<div className="scene-loading">Loading 3D mode…</div>}
        >
          <ThreeScene />
        </Suspense>
      )}
      <ModeSwitch />
    </>
  );
}
