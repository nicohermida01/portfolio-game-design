import { Sparkles } from "@react-three/drei";
import { ISLANDS } from "../sections.js";

// Drifting fireflies — one low, island-sized cloud over each island so they
// hang over the grass instead of scattering out across open sea. Thin wrapper
// over drei <Sparkles>; swap for custom instanced points later only if finer
// control is needed.
export default function Fireflies() {
  return (
    <>
      {ISLANDS.map((isl) => (
        <Sparkles
          key={isl.id}
          count={Math.round(isl.radius * 3.2)}
          scale={[isl.radius * 1.9, 3.2, isl.radius * 1.9]}
          size={2.5}
          speed={0.3}
          color="#bff299"
          opacity={0.7}
          position={[isl.center[0], 1.6, isl.center[1]]}
        />
      ))}
    </>
  );
}
