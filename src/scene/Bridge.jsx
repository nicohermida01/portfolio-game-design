import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { ISLANDS } from "../sections.js";
import { WATER_LEVEL } from "../terrain/heightfield.js";

// Procedural wooden plank footbridge between two island shores. Local +x runs
// along the span; the deck is flat, seated just above the waterline (mid-span
// is open water, so we never sample groundHeight there). Planks sit nearly
// flush and there's a continuous handrail with posts — otherwise the regular
// slat gaps read as railroad ties.
const PLANK_W = 0.26; // span-wise size of one deck plank
const PLANK_GAP = 0.05; // tight gap so the deck reads as a walkway, not track
const DECK_HALF_Z = 0.85; // half-width of the walkway
const DECK_Y = WATER_LEVEL + 0.55; // clear of the water plane, ~flush with the bank
const RAIL_Y = 0.52; // handrail height above the deck
const POST_SPACING = 1.5; // target gap between rail posts

const PLANK = "#7a4a2c";
const PLANK_ALT = "#875636";
const FRAME = "#5f3a22";

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

  // Negate the Y rotation if the deck renders perpendicular to the span.
  const yaw = -Math.atan2(fdz, fdx);

  const step = PLANK_W + PLANK_GAP;
  const plankCount = Math.max(2, Math.round(length / step));
  const postCount = Math.max(2, Math.round(length / POST_SPACING));

  return (
    <group position={[midX, DECK_Y, midZ]} rotation={[0, yaw, 0]}>
      {/* Deck planks — near-flush, laid across the span. */}
      {Array.from({ length: plankCount }, (_, i) => {
        const localX = -length / 2 + (i + 0.5) * (length / plankCount);
        return (
          <mesh key={`p-${i}`} position={[localX, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[PLANK_W, 0.09, DECK_HALF_Z * 2]} />
            <meshStandardMaterial
              color={i % 2 ? PLANK_ALT : PLANK}
              flatShading
              roughness={1}
            />
          </mesh>
        );
      })}

      {/* Continuous stringer beams under each deck edge — the structural read. */}
      {[DECK_HALF_Z - 0.06, -(DECK_HALF_Z - 0.06)].map((z) => (
        <mesh key={`str-${z}`} position={[0, -0.11, z]} castShadow receiveShadow>
          <boxGeometry args={[length + 0.2, 0.18, 0.14]} />
          <meshStandardMaterial color={FRAME} flatShading roughness={1} />
        </mesh>
      ))}

      {/* Handrails — thick top rail running the full span, both sides. */}
      {[DECK_HALF_Z - 0.05, -(DECK_HALF_Z - 0.05)].map((z) => (
        <mesh key={`rail-${z}`} position={[0, RAIL_Y, z]} castShadow>
          <boxGeometry args={[length, 0.1, 0.1]} />
          <meshStandardMaterial color={FRAME} flatShading roughness={1} />
        </mesh>
      ))}

      {/* Rail posts at a regular pitch along both edges. */}
      {Array.from({ length: postCount + 1 }, (_, i) => {
        const px = -length / 2 + i * (length / postCount);
        return [DECK_HALF_Z - 0.05, -(DECK_HALF_Z - 0.05)].map((z) => (
          <mesh key={`post-${i}-${z}`} position={[px, RAIL_Y / 2 - 0.05, z]} castShadow>
            <boxGeometry args={[0.11, RAIL_Y + 0.1, 0.11]} />
            <meshStandardMaterial color={FRAME} flatShading roughness={1} />
          </mesh>
        ));
      })}

      {/* Colliders inherit the group transform: deck floor + two side rails so
          the player can't walk off the edge. */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[length / 2, 0.09, DECK_HALF_Z]} />
        <CuboidCollider
          args={[length / 2, RAIL_Y / 2 + 0.1, 0.06]}
          position={[0, RAIL_Y / 2, DECK_HALF_Z]}
        />
        <CuboidCollider
          args={[length / 2, RAIL_Y / 2 + 0.1, 0.06]}
          position={[0, RAIL_Y / 2, -DECK_HALF_Z]}
        />
      </RigidBody>
    </group>
  );
}
