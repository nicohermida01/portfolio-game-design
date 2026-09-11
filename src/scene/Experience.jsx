import { Physics } from "@react-three/rapier";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { MARKERS, BRIDGES, ISLANDS, HOUSES } from "../sections.js";
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
import Backdrop from "./Backdrop.jsx";
import IslandPointer from "./IslandPointer.jsx";

// Flip to true to see collider outlines while developing.
const DEBUG_PHYSICS = false;

export default function Experience() {
  return (
    <>
      {/* Deep night-blue backdrop + fog that only swallows the far edge, so
          bridged islands stay readable and the sea fades to a horizon. */}
      <color attach="background" args={["#0e2136"]} />
      {/* Lower camera pitch looks further toward the horizon — push the far
          plane out so the back islands don't haze, keep the near edge fading
          the void. */}
      <fog attach="fog" args={["#0e2136", 42, 122]} />

      {/* Night lighting: cool ambient fill + a moon directional bright enough
          to read the islands, while sky and water stay dark. */}
      <ambientLight intensity={0.52} color="#3f5a7d" />
      <directionalLight
        position={[10, 14, 6]}
        intensity={1.25}
        color="#9fb4d4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={65}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      {/* Ground half lifted off near-black so upward faces on the shadow side
          get a little sky/bounce instead of crushing to mud. */}
      <hemisphereLight args={["#2a3a58", "#121a26", 0.6]} />
      {/* Back-fill from the camera/shadow side — this is what keeps the far
          islands' shadowed faces readable rather than muddy. */}
      <directionalLight position={[-9, 6, -11]} intensity={0.42} color="#4a5a72" />

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
      <Backdrop />
      <Water />
      <Campfire />
      <Fireflies />
      <WaterRings />

      {/* One off-screen arrow per island — points the way to islands that have
          drifted off (or to) the frame edge; silent while the island is in view. */}
      {ISLANDS.map((isl) => (
        <IslandPointer
          key={`ptr-${isl.id}`}
          position={[
            isl.center[0],
            groundHeight(isl.center[0], isl.center[1]) + 2.6,
            isl.center[1],
          ]}
          color={isl.color ?? "#cdd9ea"}
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
        {/* Light touch — enough to settle the eye on the fire without
            crushing the corner islands or shrinking the playable area. */}
        <Vignette offset={0.35} darkness={0.5} />
      </EffectComposer>
    </>
  );
}
