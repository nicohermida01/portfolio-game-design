import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import Experience from "./Experience.jsx";
import Panel from "../ui/Panel.jsx";
import InteractPrompt from "../ui/InteractPrompt.jsx";
import Joystick from "../ui/Joystick.jsx";
import Intro from "../ui/Intro.jsx";
import { useGameStore } from "../store.js";

// Everything 3D lives behind this one module so App can lazy-load it. In page
// mode, none of three / rapier / drei / the character model is downloaded.

const KEY_MAP = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

export default function ThreeScene() {
  // The move hint retires once the player has reached their first signpost
  // (persisted, so a returning visitor never sees it).
  const seenFirstMarker = useGameStore((s) => s.firstMarkerSeen);

  return (
    <KeyboardControls map={KEY_MAP}>
      <Canvas shadows camera={{ position: [15.5, 11.5, 15.5], fov: 40 }}>
        {/* Rapier loads its physics engine (WASM) asynchronously. */}
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>

      <Panel />
      <InteractPrompt />
      <Intro />
      <div className={`hud${seenFirstMarker ? " is-dismissed" : ""}`}>
        <span className="hud-keys">
          Move with <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>
        </span>
        <span className="hud-touch">Use the joystick</span>
        {" — walk up to a signpost to read it"}
      </div>
      <Joystick />
    </KeyboardControls>
  );
}
