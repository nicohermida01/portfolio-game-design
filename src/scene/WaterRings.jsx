import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ISLANDS } from "../sections.js";
import { WATER_LEVEL } from "../terrain/heightfield.js";

// Gentle ripples spreading from each island's shoreline out into the water.
// They start just clear of the island geometry and sit on the water surface, so
// they read as ripples on the sea. Earlier versions used a hard 1px
// `ringGeometry` band, which read as a drawn contour line / sonar sweep; this
// one feathers both edges with a shared alpha texture and spreads wider and
// slower so it disperses instead of marching in lockstep.
const RINGS_PER_ISLAND = 2;
const PERIOD = 7; // seconds per ripple — unhurried
const START = 1.1; // × island radius — just outside the island skirt
const GROW = 0.5; // expands to (START + GROW) × radius, then dissipates
const PEAK_OPACITY = 0.17;
const COLOR = "#4d93ac";

// One shared soft-annulus alpha texture: transparent core, a feathered band
// near the rim, transparent again at the very edge. `RingGeometry` maps UVs
// planar (a square over the ring's bounding box), so a radial gradient drawn
// here lands concentric on the mesh.
function makeRingAlpha() {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, "rgba(0,0,0,0)");
  g.addColorStop(0.62, "rgba(0,0,0,0)");
  g.addColorStop(0.82, "rgba(255,255,255,1)");
  g.addColorStop(0.93, "rgba(255,255,255,0.5)");
  g.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

export default function WaterRings() {
  const alphaMap = useMemo(makeRingAlpha, []);

  const rings = useMemo(
    () =>
      ISLANDS.flatMap((island, idx) =>
        Array.from({ length: RINGS_PER_ISLAND }, (_, i) => ({
          key: `${island.id}-${i}`,
          center: [island.center[0], WATER_LEVEL + 0.06, island.center[1]],
          radius: island.radius,
          // Stagger within the island, and offset each island.
          phase: (i / RINGS_PER_ISLAND) * PERIOD + idx * 1.7,
        })),
      ),
    [],
  );

  const refs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < rings.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const p = ((((t + rings[i].phase) % PERIOD) + PERIOD) % PERIOD) / PERIOD;
      const s = rings[i].radius * (START + p * GROW);
      m.scale.set(s, s, s);
      // Ease in, then fade a touch faster as it disperses.
      m.material.opacity = PEAK_OPACITY * Math.pow(Math.sin(p * Math.PI), 1.5);
    }
  });

  return (
    <>
      {rings.map((ring, i) => (
        <mesh
          key={ring.key}
          ref={(el) => (refs.current[i] = el)}
          position={ring.center}
          rotation-x={-Math.PI / 2}
        >
          {/* Wide band — the alphaMap feathers it; per-frame scale sets the
              real radius. */}
          <ringGeometry args={[0.4, 1, 64]} />
          <meshBasicMaterial
            color={COLOR}
            alphaMap={alphaMap}
            transparent
            depthWrite={false}
            opacity={0}
          />
        </mesh>
      ))}
    </>
  );
}
