import { useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";
import { RigidBody, CylinderCollider, BallCollider } from "@react-three/rapier";
import { groundHeight, WATER_LEVEL } from "../terrain/heightfield.js";
import { MARKERS, HOUSES, TO_CAMERA, ISLANDS, BRIDGE_FEET } from "../sections.js";

const SPAWN_CLEARANCE = 3; // keep the world-origin spawn + campfire area clear
const MARKER_CLEARANCE = 2.5; // keep section markers clear
const HOUSE_CLEARANCE = 3.2; // keep cabins clear
const BRIDGE_FOOT_CLEARANCE = 2.6; // keep bridge approaches walkable + unblocked
// Keep a clear sightline from every sign toward the fixed camera: no scatter
// within this half-width of the marker->camera ray, out to this far.
const SIGHTLINE_HALF_WIDTH = 1.9;
const SIGHTLINE_LENGTH = 9;

// How many of each prop lands on each island.
const TREE_COUNTS = { index: 5, contact: 5, work: 9, projects: 9 };
const ROCK_COUNTS = { index: 2, contact: 2, work: 3, projects: 3 };

// Deterministic scatter across one island's disc: polar around its centre,
// same props in the same spots every reload. Coords are absolute world units,
// so the marker / house / sightline rejection checks work unchanged. `y` is
// sampled here so both the instanced mesh and its collider use one value.
function scatter(count, seed, island, innerR, outerR) {
  const rand = seededRandom(seed);
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const angle = rand() * Math.PI * 2;
    const r = innerR + rand() * (outerR - innerR);
    const x = Math.cos(angle) * r + island.center[0];
    const z = Math.sin(angle) * r + island.center[1];

    // Drop anything the irregular coastline left over water or on a rock step.
    if (groundHeight(x, z) < WATER_LEVEL - 0.15) continue;

    // Keep the spawn + campfire area at the world origin clear.
    if (island.id === "index" && Math.hypot(x, z) < SPAWN_CLEARANCE) continue;

    const onMarker = MARKERS.some(
      (m) =>
        Math.hypot(x - m.position[0], z - m.position[2]) < MARKER_CLEARANCE,
    );
    if (onMarker) continue;

    const onHouse = HOUSES.some(
      (h) =>
        Math.hypot(x - h.position[0], z - h.position[2]) < HOUSE_CLEARANCE,
    );
    if (onHouse) continue;

    const onBridgeFoot = BRIDGE_FEET.some(
      ([bx, bz]) => Math.hypot(x - bx, z - bz) < BRIDGE_FOOT_CLEARANCE,
    );
    if (onBridgeFoot) continue;

    // Reject anything sitting on a sign's line of sight to the camera.
    const blocksSign = MARKERS.some((m) => {
      const wx = x - m.position[0];
      const wz = z - m.position[2];
      const along = wx * TO_CAMERA[0] + wz * TO_CAMERA[1];
      if (along <= 0 || along > SIGHTLINE_LENGTH) return false;
      const px = wx - along * TO_CAMERA[0];
      const pz = wz - along * TO_CAMERA[1];
      return Math.hypot(px, pz) < SIGHTLINE_HALF_WIDTH;
    });
    if (blocksSign) continue;

    out.push({
      x,
      z,
      y: groundHeight(x, z),
      rot: rand() * Math.PI * 2,
      scale: 0.8 + rand() * 0.6,
    });
  }
  return out;
}

// The whole scatter is deterministic and layout-static, so build it once.
function buildScatter(counts, seedBase) {
  return ISLANDS.flatMap((isl, i) =>
    scatter(
      counts[isl.id] ?? 0,
      seedBase + i * 17,
      isl,
      isl.radius * 0.15,
      // Keep clear of the rocky rim (RIM_START ~0.78 of the radius).
      isl.radius * 0.72,
    ),
  );
}

export default function Props() {
  const trees = useMemo(() => buildScatter(TREE_COUNTS, 1337), []);
  const rocks = useMemo(() => buildScatter(ROCK_COUNTS, 4242), []);

  return (
    <>
      {/* --- Visuals: one instanced draw per part, no physics body. --- */}
      {/* Trunk */}
      <Instances limit={trees.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.16, 1, 6]} />
        <meshStandardMaterial color="#8a5a3c" flatShading roughness={1} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t.x, t.y + 0.5 * t.scale, t.z]}
            rotation={[0, t.rot, 0]}
            scale={t.scale}
          />
        ))}
      </Instances>
      {/* Lower canopy */}
      <Instances limit={trees.length} castShadow>
        <coneGeometry args={[0.7, 1.6, 7]} />
        <meshStandardMaterial color="#3f8f4f" flatShading roughness={1} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t.x, t.y + 1.5 * t.scale, t.z]}
            rotation={[0, t.rot, 0]}
            scale={t.scale}
          />
        ))}
      </Instances>
      {/* Upper canopy */}
      <Instances limit={trees.length} castShadow>
        <coneGeometry args={[0.5, 1.2, 7]} />
        <meshStandardMaterial color="#4a9d5b" flatShading roughness={1} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t.x, t.y + 2.3 * t.scale, t.z]}
            rotation={[0, t.rot, 0]}
            scale={t.scale}
          />
        ))}
      </Instances>
      {/* Rocks */}
      <Instances limit={rocks.length} castShadow receiveShadow>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#8d8d99" flatShading roughness={1} />
        {rocks.map((r, i) => (
          <Instance
            key={i}
            position={[r.x, r.y + 0.15 * r.scale, r.z]}
            rotation={[r.rot * 0.3, r.rot, r.rot * 0.2]}
            scale={r.scale}
          />
        ))}
      </Instances>

      {/* --- Physics: every collider on one fixed body. --- */}
      <RigidBody type="fixed" colliders={false}>
        {trees.map((t, i) => (
          <CylinderCollider
            key={`tc-${i}`}
            args={[1.4 * t.scale, 0.5 * t.scale]}
            position={[t.x, t.y + 1.4 * t.scale, t.z]}
          />
        ))}
        {rocks.map((r, i) => (
          <BallCollider
            key={`rc-${i}`}
            args={[0.4 * r.scale]}
            position={[r.x, r.y + 0.15 * r.scale, r.z]}
          />
        ))}
      </RigidBody>
    </>
  );
}

function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
