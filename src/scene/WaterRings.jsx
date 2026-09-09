import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ZONES } from "../sections.js";
import { groundHeight } from "../terrain/heightfield.js";

const RINGS_PER_ZONE = 3;
const PERIOD = 4; // seconds for one expand-and-fade cycle

// Fake concentric shoreline ripples around each zone. Each ring expands from
// radius*0.7 to radius*1.4 while fading 0.5 -> 0, phase-staggered so a fresh
// one starts before the last has gone.
export default function WaterRings() {
  const rings = useMemo(
    () =>
      ZONES.flatMap((zone) => {
        const y = groundHeight(zone.center[0], zone.center[1]) - 0.05;
        return Array.from({ length: RINGS_PER_ZONE }, (_, i) => ({
          key: `${zone.id}-${i}`,
          center: [zone.center[0], y, zone.center[1]],
          radius: zone.radius,
          // Stagger the start of each ring across the cycle.
          phase: (i / RINGS_PER_ZONE) * PERIOD,
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
      const s = rings[i].radius * (0.7 + p * 0.7);
      mesh.scale.set(s, s, s);
      mesh.material.opacity = 0.5 * (1 - p);
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
            color="#5fd2ff"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}
