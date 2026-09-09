import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { ISLANDS } from "../sections.js";
import { WATER_LEVEL } from "../terrain/heightfield.js";

// Procedural wooden plank walkway between two island shores. Local +x runs
// along the span; the deck is flat, seated just above the waterline (mid-span
// is open water, so we never sample groundHeight there).
const PLANK_STEP = 0.32;
const DECK_Y = WATER_LEVEL + 0.55; // clear of the water plane, ~flush with the bank

export default function Bridge({ from, to }) {
  const a = ISLANDS.find((i) => i.id === from);
  const b = ISLANDS.find((i) => i.id === to);
  if (!a || !b) return null;

  const dx = b.center[0] - a.center[0];
  const dz = b.center[1] - a.center[1];
  const span = Math.hypot(dx, dz);
  const ux = dx / span;
  const uz = dz / span;

  // Foot points sit on the bank of each island (where the ground is near the
  // waterline), span runs foot -> foot.
  const footA = [a.center[0] + ux * (a.radius * 0.9), a.center[1] + uz * (a.radius * 0.9)];
  const footB = [b.center[0] - ux * (b.radius * 0.9), b.center[1] - uz * (b.radius * 0.9)];

  const fdx = footB[0] - footA[0];
  const fdz = footB[1] - footA[1];
  const length = Math.hypot(fdx, fdz);

  const midX = (footA[0] + footB[0]) / 2;
  const midZ = (footA[1] + footB[1]) / 2;
  const deckY = DECK_Y;

  // Negate the Y rotation if the deck renders perpendicular to the span.
  const yaw = -Math.atan2(fdz, fdx);

  const plankCount = Math.max(1, Math.round(length / PLANK_STEP));
  const railX = length / 2 - 0.3;

  return (
    <group position={[midX, deckY, midZ]} rotation={[0, yaw, 0]}>
      {Array.from({ length: plankCount }, (_, i) => {
        const localX = -length / 2 + (i + 0.5) * (length / plankCount);
        return (
          <mesh key={i} position={[localX, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.08, 1.6]} />
            <meshStandardMaterial
              color={i % 2 ? "#875636" : "#7a4a2c"}
              flatShading
              roughness={1}
            />
          </mesh>
        );
      })}

      {/* Side rails */}
      {[0.74, -0.74].map((z) => (
        <mesh key={`rail-${z}`} position={[0, 0.28, z]} castShadow>
          <boxGeometry args={[length, 0.1, 0.1]} />
          <meshStandardMaterial color="#5f3a22" flatShading roughness={1} />
        </mesh>
      ))}

      {/* Corner posts */}
      {[
        [railX, 0.74],
        [railX, -0.74],
        [-railX, 0.74],
        [-railX, -0.74],
      ].map(([x, z], i) => (
        <mesh key={`post-${i}`} position={[x, -0.9, z]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2, 6]} />
          <meshStandardMaterial color="#5f3a22" flatShading roughness={1} />
        </mesh>
      ))}

      {/* Colliders inherit the group transform: deck floor + two side rails so
          the player can't walk off the edge. */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[length / 2, 0.08, 0.8]} />
        <CuboidCollider args={[length / 2, 0.35, 0.08]} position={[0, 0.35, 0.8]} />
        <CuboidCollider args={[length / 2, 0.35, 0.08]} position={[0, 0.35, -0.8]} />
      </RigidBody>
    </group>
  );
}
