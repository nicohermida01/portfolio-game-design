import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ISLANDS } from "../sections.js";
import { WATER_LEVEL } from "../terrain/heightfield.js";

// Gentle ripples spreading from each island's shoreline out into the water.
// They start just clear of the island geometry (radius * 1.12) and sit on the
// water surface, so they read as ripples on the sea — not a marker drawn on the
// grass, which is how the earlier versions came across. Opacity eases in then
// fades as the ring spreads, so there's no spawn pop and no radar-sweep feel.
const RINGS_PER_ISLAND = 2;
const PERIOD = 5.5; // seconds per ripple
const START = 1.14; // × island radius — just outside the island skirt
const GROW = 0.3; // expands to (START + GROW) × radius
const PEAK_OPACITY = 0.24;
const COLOR = "#4d93ac";

export default function WaterRings() {
  const rings = useMemo(
    () =>
      ISLANDS.flatMap((island, idx) =>
        Array.from({ length: RINGS_PER_ISLAND }, (_, i) => ({
          key: `${island.id}-${i}`,
          center: [island.center[0], WATER_LEVEL + 0.06, island.center[1]],
          radius: island.radius,
          // Stagger within the island, and offset each island.
          phase: (i / RINGS_PER_ISLAND) * PERIOD + idx * 1.3,
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
      m.material.opacity = PEAK_OPACITY * Math.sin(p * Math.PI); // in then out
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
          {/* Thin unit ring — per-frame scale sets the real radius. */}
          <ringGeometry args={[0.98, 1, 72]} />
          <meshBasicMaterial
            color={COLOR}
            transparent
            depthWrite={false}
            opacity={0}
          />
        </mesh>
      ))}
    </>
  );
}
