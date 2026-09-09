import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ISLANDS } from "../sections.js";
import { groundHeight } from "../terrain/heightfield.js";

const RINGS_PER_ISLAND = 2;
const PERIOD = 4.5; // seconds for one expand-and-fade cycle

// Fake concentric shoreline ripples around each island. Each ring expands just
// past the shore (radius*0.85 -> radius*1.15) while fading 0.22 -> 0,
// phase-staggered so a fresh one starts before the last has gone.
export default function WaterRings() {
  const rings = useMemo(
    () =>
      ISLANDS.flatMap((island) => {
        const y = groundHeight(island.center[0], island.center[1]) - 0.05;
        return Array.from({ length: RINGS_PER_ISLAND }, (_, i) => ({
          key: `${island.id}-${i}`,
          center: [island.center[0], y, island.center[1]],
          radius: island.radius,
          // Stagger the start of each ring across the cycle.
          phase: (i / RINGS_PER_ISLAND) * PERIOD,
        }));
      }),
    [],
  );

  const meshRefs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < rings.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      // p: 0 -> 1 progress through this ring's cycle.
      const p = (((t + rings[i].phase) % PERIOD) + PERIOD) % PERIOD / PERIOD;
      const s = rings[i].radius * (0.85 + p * 0.3);
      mesh.scale.set(s, s, s);
      mesh.material.opacity = 0.22 * (1 - p);
    }
  });

  return (
    <>
      {rings.map((ring, i) => (
        <mesh
          key={ring.key}
          ref={(el) => (meshRefs.current[i] = el)}
          position={ring.center}
          rotation-x={-Math.PI / 2}
        >
          {/* Unit ring — per-frame scale sets the real radius. */}
          <ringGeometry args={[0.92, 1, 48]} />
          <meshBasicMaterial
            color="#357f9e"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}
