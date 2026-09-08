import { Physics } from "@react-three/rapier";
import { MARKERS } from "../sections.js";
import Terrain from "./Terrain.jsx";
import Props from "./Props.jsx";
import Buildings from "./Buildings.jsx";
import Boundary from "./Boundary.jsx";
import Player from "./Player.jsx";
import PointOfInterest from "./PointOfInterest.jsx";

// Flip to true to see collider outlines while developing.
const DEBUG_PHYSICS = false;

export default function Experience() {
  return (
    <>
      {/* Soft off-white backdrop + distance fog, like the diorama reference. */}
      <color attach="background" args={["#dfeae0"]} />
      <fog attach="fog" args={["#dfeae0", 34, 62]} />

      {/* Lighting: ambient fill plus one directional "sun" that casts shadows. */}
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />

      <Physics debug={DEBUG_PHYSICS}>
        <Terrain />
        <Props />
        <Buildings />
        <Boundary />
        <Player />
      </Physics>

      {/* Markers are pure visuals — no physics body. */}
      {MARKERS.map((marker) => (
        <PointOfInterest key={marker.id} marker={marker} />
      ))}
    </>
  );
}
