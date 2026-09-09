import { WATER_LEVEL } from "../terrain/heightfield.js";

// One large flat sea plane the islands sit in. No shader wobble in v1.
export default function Water() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, WATER_LEVEL, 0]} receiveShadow>
      <planeGeometry args={[160, 160]} />
      <meshStandardMaterial color="#12314f" roughness={0.15} metalness={0.6} />
    </mesh>
  );
}
