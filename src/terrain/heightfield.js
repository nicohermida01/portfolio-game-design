import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import { ISLANDS } from "../sections.js";

// --- Terrain shape (archipelago) -------------------------------------------
// The world is a handful of independent circular islands sitting in open water.
// `groundHeight(x, z)` is still the single "stand on the ground" API: it finds
// the nearest island, raises a smooth dome at its centre that falls away below
// the waterline at its rim, and drops to a deep sentinel out at sea. The mesh
// geometry and everything that rests on the terrain (player, props, markers)
// all sample this SAME function, so nothing floats or sinks.
//
// When you later swap this for a GLTF terrain model, this function becomes a
// downward raycast against that mesh instead — same idea, different source.

export const GROUND_SIZE = 40; // world units — kept for the Boundary walls
export const WATER_LEVEL = -0.9;

// Base grass colour + how many world units the zone tint fades over at its rim.
const BASE_COLOR = new THREE.Color("#3c6e46"); // muted, slightly cool green — night grass
const EDGE_BLEND = 1.6;

// Deterministic noise: same layout on every reload.
const noise2D = createNoise2D(mulberry32(hashString("portfolio-diorama")));

const ISLAND_TOP = 0.7;     // height at an island centre
const SHORE_BOTTOM = -0.6;  // height at the island rim (a low bank, just above the waterline)
const NOISE_AMP = 0.5; // gentle interior relief — the geometry now follows it

export function groundHeight(x, z) {
  let best = null, bestD = Infinity;
  for (const isl of ISLANDS) {
    const d = Math.hypot(x - isl.center[0], z - isl.center[1]);
    if (d < bestD) { bestD = d; best = isl; }
  }
  if (!best) return WATER_LEVEL - 3;
  const r = bestD / best.radius;                 // 0 centre .. 1 rim
  if (r > 1.15) return WATER_LEVEL - 3;          // open sea
  const dome = THREE.MathUtils.lerp(
    ISLAND_TOP, SHORE_BOTTOM,
    THREE.MathUtils.smoothstep(r, 0.1, 1.05),
  );
  const relief =
    noise2D(x / 6, z / 6) * NOISE_AMP *
    (1 - THREE.MathUtils.smoothstep(r, 0.35, 0.95));
  return dome + relief;
}

// A subdivided polar disc: one centre vertex plus RADIAL_SEGS concentric rings
// of ANGULAR_SEGS vertices, in the XZ plane. THREE.CircleGeometry is only a
// coarse centre fan (no radial resolution), so a displaced CircleGeometry is a
// smooth cone that ignores groundHeight's curve and noise — anything seated via
// groundHeight then floats or sinks. This has enough radial detail for the
// displaced surface (and its trimesh collider) to actually follow groundHeight.
const RADIAL_SEGS = 16;
const ANGULAR_SEGS = 48;

function polarDisc(radius) {
  const positions = [0, 0, 0]; // centre
  for (let r = 1; r <= RADIAL_SEGS; r++) {
    const rad = (r / RADIAL_SEGS) * radius;
    for (let a = 0; a < ANGULAR_SEGS; a++) {
      const ang = (a / ANGULAR_SEGS) * Math.PI * 2;
      positions.push(Math.cos(ang) * rad, 0, Math.sin(ang) * rad);
    }
  }

  const ringStart = (r) => 1 + (r - 1) * ANGULAR_SEGS;
  const indices = [];
  for (let a = 0; a < ANGULAR_SEGS; a++) {
    const a2 = (a + 1) % ANGULAR_SEGS;
    indices.push(0, ringStart(1) + a, ringStart(1) + a2);
  }
  for (let r = 1; r < RADIAL_SEGS; r++) {
    for (let a = 0; a < ANGULAR_SEGS; a++) {
      const a2 = (a + 1) % ANGULAR_SEGS;
      const i0 = ringStart(r) + a;
      const i1 = ringStart(r) + a2;
      const j0 = ringStart(r + 1) + a;
      const j1 = ringStart(r + 1) + a2;
      indices.push(i0, j0, j1, i0, j1, i1);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  // Make sure the disc faces +Y (flip the winding if it came out inverted).
  g.computeVertexNormals();
  if (g.attributes.normal.getY(0) < 0) {
    for (let i = 0; i < indices.length; i += 3) {
      const t = indices[i];
      indices[i] = indices[i + 2];
      indices[i + 2] = t;
    }
    g.setIndex(indices);
  }
  return g;
}

// Builds one displaced, faceted disc per island. Geometry is pre-translated to
// world coords so the mesh can stay at the origin. `zones` (from sections.js)
// paint a soft-edged colour patch into the vertex-colour attribute — the
// material renders it with `vertexColors`, so it's one mesh, no extra draw call.
export function createIslandGeometry(island, zones = []) {
  const geo = polarDisc(island.radius * 1.12);
  geo.translate(island.center[0], 0, island.center[1]);

  const zoneColors = zones.map((z) => new THREE.Color(z.color));
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, groundHeight(x, z));

    c.copy(BASE_COLOR);
    for (let j = 0; j < zones.length; j++) {
      const d = Math.hypot(x - zones[j].center[0], z - zones[j].center[1]);
      const mix =
        1 - THREE.MathUtils.smoothstep(d, zones[j].radius - EDGE_BLEND, zones[j].radius);
      if (mix > 0) c.lerp(zoneColors[j], mix);
    }
    // Darken toward the shore so the waterline reads.
    const rr = Math.hypot(x - island.center[0], z - island.center[1]) / island.radius;
    c.multiplyScalar(THREE.MathUtils.lerp(1, 0.5, THREE.MathUtils.smoothstep(rr, 0.72, 1.1)));

    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  pos.needsUpdate = true;
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

// --- tiny seeded RNG helpers ----------------------------------------------
function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
