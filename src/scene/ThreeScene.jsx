import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import Experience from "./Experience.jsx";
import Panel from "../ui/Panel.jsx";
import ZoneBanner from "../ui/ZoneBanner.jsx";
import Joystick from "../ui/Joystick.jsx";

// Everything 3D lives behind this one module so App can lazy-load it. In page
// mode, none of three / rapier / drei / the character model is downloaded.

const KEY_MAP = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

export default function ThreeScene() {
  return (
    <KeyboardControls map={KEY_MAP}>
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 40 }}>
        {/* Rapier loads its physics engine (WASM) asynchronously. */}
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>

      <Panel />
      <ZoneBanner />
      <div className="hud">
        <span className="hud-keys">
          Move with <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>
        </span>
        <span className="hud-touch">Use the joystick</span>
        {" — walk up to a marker"}
      </div>
      <Joystick />
    </KeyboardControls>
  );
}
