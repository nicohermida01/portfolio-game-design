import { Physics } from "@react-three/rapier";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { MARKERS, POINTS, ZONES } from "../sections.js";
import { groundHeight } from "../terrain/heightfield.js";
import Terrain from "./Terrain.jsx";
import Props from "./Props.jsx";
import Buildings from "./Buildings.jsx";
import Boundary from "./Boundary.jsx";
import Player from "./Player.jsx";
import PointOfInterest from "./PointOfInterest.jsx";
import Campfire from "./Campfire.jsx";
import Fireflies from "./Fireflies.jsx";
import WaterRings from "./WaterRings.jsx";
import ZoneLabel from "./ZoneLabel.jsx";

// Flip to true to see collider outlines while developing.
const DEBUG_PHYSICS = false;

export default function Experience() {
  return (
    <>
      {/* Deep night-blue backdrop + tight fog so the world fades into dark. */}
      <color attach="background" args={["#0b1a2b"]} />
      <fog attach="fog" args={["#0b1a2b", 22, 55]} />

      {/* Night lighting: faint cool ambient fill + a dim moon directional. */}
      <ambientLight intensity={0.12} color="#3a5a80" />
      <directionalLight
        position={[10, 14, 6]}
        intensity={0.35}
        color="#8fa6c8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />
      <hemisphereLight args={["#22304a", "#0a0f16", 0.2]} />

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

      {/* Night atmosphere — all outside <Physics>, pure visuals. */}
      <Campfire />
      <Fireflies />
      <WaterRings />

      {ZONES.map((zone) => (
        <ZoneLabel
          key={`label-${zone.id}`}
          position={[
            zone.center[0],
            groundHeight(zone.center[0], zone.center[1]) + 4,
            zone.center[1],
          ]}
          label={zone.title}
        />
      ))}
      {POINTS.map((point) => (
        <ZoneLabel
          key={`label-${point.id}`}
          position={[
            point.position[0],
            groundHeight(point.position[0], point.position[2]) + 3.5,
            point.position[2],
          ]}
          label={point.label}
        />
      ))}

      {/* Post-processing: only windows / fire / fireflies clear the threshold. */}
      <EffectComposer>
        <Bloom
          mipmapBlur
          luminanceThreshold={0.6}
          luminanceSmoothing={0.2}
          intensity={0.9}
        />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  );
}
