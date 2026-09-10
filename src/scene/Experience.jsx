import { Physics } from "@react-three/rapier";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { MARKERS, POINTS, ZONES, BRIDGES, ISLANDS, HOUSES } from "../sections.js";
import { groundHeight } from "../terrain/heightfield.js";

// One soft warm fill light per island, sat over its building cluster. This
// replaces the ~14 per-cabin / per-sign point lights that used to muddy the
// scene — now it's the campfire (the only shadow-caster) plus these four, all
// shadowless.
const ISLAND_FILLS = ISLANDS.map((isl) => {
  const houses = HOUSES.filter((h) => h.id.includes(isl.id));
  const cx = houses.reduce((s, h) => s + h.position[0], isl.center[0]) /
    (houses.length + 1);
  const cz = houses.reduce((s, h) => s + h.position[2], isl.center[1]) /
    (houses.length + 1);
  return { id: isl.id, position: [cx, groundHeight(cx, cz) + 2.4, cz], distance: isl.radius * 2.4 };
});
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
      {/* Deep night-blue backdrop + fog that only swallows the far edge, so
          bridged islands stay readable and the sea fades to a horizon. */}
      <color attach="background" args={["#0e2136"]} />
      <fog attach="fog" args={["#0e2136", 38, 104]} />

      {/* Night lighting: cool ambient fill + a moon directional bright enough
          to read the islands, while sky and water stay dark. */}
      <ambientLight intensity={0.52} color="#3f5a7d" />
      <directionalLight
        position={[10, 14, 6]}
        intensity={1.25}
        color="#9fb4d4"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-near={1}
        shadow-camera-far={65}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      <hemisphereLight args={["#2a3a58", "#0a0f16", 0.5]} />
      {/* Dim back-fill so the shadow side of far islands never goes pure black. */}
      <directionalLight position={[-9, 6, -11]} intensity={0.16} color="#3a4a6a" />

      {/* Warm fill over each island's cabins (see ISLAND_FILLS above). */}
      {ISLAND_FILLS.map((f) => (
        <pointLight
          key={f.id}
          position={f.position}
          color="#ffb266"
          intensity={4.2}
          distance={f.distance}
          decay={2}
          castShadow={false}
        />
      ))}

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

      {/* Mounted well clear of the tallest cabin ridge (~2.1u) so the label
          reads as floating over the island, not pasted on a roof. */}
      {ZONES.map((zone) => (
        <ZoneLabel
          key={`label-${zone.id}`}
          position={[
            zone.center[0],
            groundHeight(zone.center[0], zone.center[1]) + 4.4,
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
            groundHeight(point.position[0], point.position[2]) + 4.1,
            point.position[2],
          ]}
          label={point.label}
        />
      ))}

      {/* Post-processing: only windows / fire / fireflies clear the threshold. */}
      <EffectComposer>
        <Bloom
          mipmapBlur
          luminanceThreshold={0.8}
          luminanceSmoothing={0.2}
          intensity={0.5}
        />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  );
}
