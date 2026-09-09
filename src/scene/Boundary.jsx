import { RigidBody, CuboidCollider } from "@react-three/rapier";

// Wide invisible box around the whole archipelago — a last-resort backstop so
// the player can't wander infinitely over open water. Falling in the sea is
// handled by the water-fall respawn in Player.jsx.
const HALF = 30;

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
