import { Sparkles } from "@react-three/drei";

// Drifting fireflies over the play area. Thin wrapper over drei <Sparkles>;
// swap for custom instanced points later only if finer control is needed.
export default function Fireflies() {
  return (
    <Sparkles
      count={60}
      scale={[38, 6, 38]}
      size={2.5}
      speed={0.3}
      color="#bff299"
      opacity={0.7}
      position={[0, 1.5, 0]}
    />
  );
}
