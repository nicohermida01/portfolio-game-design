import { Physics } from "@react-three/rapier";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { MARKERS, POINTS, ZONES, BRIDGES } from "../sections.js";
import { groundHeight } from "../terrain/heightfield.js";
import Terrain from "./Terrain.jsx";
import Props from "./Props.jsx";
import Buildings from "./Buildings.jsx";
import Boundary from "./Boundary.jsx";
import Bridge from "./Bridge.jsx";
import Player from "./Player.jsx";
import PointOfInterest from "./PointOfInterest.jsx";
import Campfire from "./Campfire.jsx";
import Fireflies from "./Fireflies.jsx";
import Water from "./Water.jsx";
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

      {/* Night lighting: cool ambient fill + a moon directional bright enough
          to read the islands, while sky and water stay dark. */}
      <ambientLight intensity={0.6} color="#4a6a90" />
      <directionalLight
        position={[10, 14, 6]}
        intensity={1.1}
        color="#9fb4d4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />
      <hemisphereLight args={["#2a3a58", "#0a0f16", 0.62]} />

      <Physics debug={DEBUG_PHYSICS}>
        <Terrain />
        <Props />
        <Buildings />
        <Boundary />
        {BRIDGES.map((b) => (
          <Bridge key={`${b.from}-${b.to}`} from={b.from} to={b.to} />
        ))}
        <Player />
      </Physics>

      {/* Markers are pure visuals — no physics body. */}
      {MARKERS.map((marker) => (
        <PointOfInterest key={marker.id} marker={marker} />
      ))}

      {/* Night atmosphere — all outside <Physics>, pure visuals. */}
      <Water />
      <Campfire />
      <Fireflies />
      <WaterRings />

      {ZONES.map((zone) => (
        <ZoneLabel
          key={`label-${zone.id}`}
          position={[
            zone.center[0],
            groundHeight(zone.center[0], zone.center[1]) + 2.8,
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
            groundHeight(point.position[0], point.position[2]) + 2.6,
            point.position[2],
          ]}
          label={point.label}
        />
      ))}

      {/* Post-processing: only windows / fire / fireflies clear the threshold. */}
      <EffectComposer>
        <Bloom
          mipmapBlur
          luminanceThreshold={0.78}
          luminanceSmoothing={0.2}
          intensity={0.8}
        />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  );
}
