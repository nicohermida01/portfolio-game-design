import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { GROUND_SIZE } from "../terrain/heightfield.js";

const HALF = GROUND_SIZE / 2 - 0.5;

// Four invisible static walls so the player can't walk off the terrain.
export default function Boundary() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[HALF, 3, 0.5]} position={[0, 3, -HALF]} />
      <CuboidCollider args={[HALF, 3, 0.5]} position={[0, 3, HALF]} />
      <CuboidCollider args={[0.5, 3, HALF]} position={[-HALF, 3, 0]} />
      <CuboidCollider args={[0.5, 3, HALF]} position={[HALF, 3, 0]} />
    </RigidBody>
  );
}
