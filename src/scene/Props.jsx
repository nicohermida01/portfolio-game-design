import { useMemo } from "react";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import { groundHeight } from "../terrain/heightfield.js";
import { MARKERS, HOUSES, TO_CAMERA } from "../sections.js";

const TREE_COUNT = 26;
const ROCK_COUNT = 10;
const SPAWN_CLEARANCE = 3; // keep the centre (spawn point) clear
const MARKER_CLEARANCE = 2.5; // keep section markers clear
const HOUSE_CLEARANCE = 3.2; // keep cabins clear
// Keep a clear sightline from every sign toward the fixed camera: no scatter
// within this half-width of the marker->camera ray, out to this far.
const SIGHTLINE_HALF_WIDTH = 1.9;
const SIGHTLINE_LENGTH = 9;

// Deterministic scatter: same trees in the same spots every reload.
function scatter(count, seed, minRadius, maxRadius) {
  const rand = seededRandom(seed);
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const angle = rand() * Math.PI * 2;
    const r = minRadius + rand() * (maxRadius - minRadius);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    if (Math.hypot(x, z) < SPAWN_CLEARANCE) continue;
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

    out.push({ x, z, rot: rand() * Math.PI * 2, scale: 0.8 + rand() * 0.6 });
  }
  return out;
}

function Tree({ x, z, rot, scale }) {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[x, groundHeight(x, z), z]}
      rotation={[0, rot, 0]}
    >
      {/* One simple cylinder collider around the trunk / lower canopy. */}
      <CylinderCollider
        args={[1.4 * scale, 0.5 * scale]}
        position={[0, 1.4 * scale, 0]}
      />
      <group scale={scale}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.12, 0.16, 1, 6]} />
          <meshStandardMaterial color="#8a5a3c" flatShading roughness={1} />
        </mesh>
        <mesh castShadow position={[0, 1.5, 0]}>
          <coneGeometry args={[0.7, 1.6, 7]} />
          <meshStandardMaterial color="#3f8f4f" flatShading roughness={1} />
        </mesh>
        <mesh castShadow position={[0, 2.3, 0]}>
          <coneGeometry args={[0.5, 1.2, 7]} />
          <meshStandardMaterial color="#4a9d5b" flatShading roughness={1} />
        </mesh>
      </group>
    </RigidBody>
  );
}

function Rock({ x, z, rot, scale }) {
  return (
    <RigidBody
      type="fixed"
      colliders="hull"
      position={[x, groundHeight(x, z) + 0.15 * scale, z]}
      rotation={[rot * 0.3, rot, rot * 0.2]}
    >
      <mesh castShadow receiveShadow scale={scale}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#8d8d99" flatShading roughness={1} />
      </mesh>
    </RigidBody>
  );
}

export default function Props() {
  const trees = useMemo(() => scatter(TREE_COUNT, 1337, 4, 18), []);
  const rocks = useMemo(() => scatter(ROCK_COUNT, 4242, 3, 17), []);

  return (
    <>
      {trees.map((t, i) => (
        <Tree key={`tree-${i}`} {...t} />
      ))}
      {rocks.map((r, i) => (
        <Rock key={`rock-${i}`} {...r} />
      ))}
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
