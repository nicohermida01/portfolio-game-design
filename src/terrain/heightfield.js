import * as THREE from "three";
import { createNoise2D } from "simplex-noise";

// --- Terrain shape -----------------------------------------------------------
// One source of truth for the ground. `groundHeight(x, z)` is a pure function;
// the mesh geometry and everything that "stands on" the terrain (player, props,
// section markers) all sample the SAME function, so nothing floats or sinks.
//
// When you later swap this for a GLTF terrain model, this function becomes a
// downward raycast against that mesh instead — same idea, different source.

export const GROUND_SIZE = 40; // world units, square
const SEGMENTS = 72; // grid resolution of the plane

// Base grass colour + how many world units the zone tint fades over at its rim.
const BASE_COLOR = new THREE.Color("#4c9a5a");
const EDGE_BLEND = 1.6;

// Deterministic noise: same layout on every reload.
const noise2D = createNoise2D(mulberry32(hashString("portfolio-diorama")));

export function groundHeight(x, z) {
  // Two octaves of noise: broad hills + finer bumps.
  const broad = noise2D(x / 18, z / 18) * 2.2;
  const detail = noise2D(x / 6, z / 6) * 0.6;
  let h = broad + detail;

  // 0 at the centre, 1 at the edge.
  const t = Math.min(Math.hypot(x, z) / (GROUND_SIZE / 2), 1);

  // Keep the middle calm so the play area and markers sit on gentle ground,
  // then let the rim rise into a shallow bowl (the diorama "tray" edge).
  h *= THREE.MathUtils.smoothstep(t, 0.12, 0.85);
  h += Math.pow(t, 3) * 3.5;

  return h;
}

// Builds the displaced, faceted plane geometry once. `zones` (from sections.js)
// paint a soft-edged colour patch into the vertex-colour attribute — the
// material renders it with `vertexColors`, so it's one mesh, no extra draw call.
export function createTerrainGeometry(zones = []) {
  const geometry = new THREE.PlaneGeometry(
    GROUND_SIZE,
    GROUND_SIZE,
    SEGMENTS,
    SEGMENTS,
  );
  geometry.rotateX(-Math.PI / 2); // lay it flat; +y is up

  const zoneColors = zones.map((z) => new THREE.Color(z.color));
  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, groundHeight(x, z));

    // Start from grass, then blend each zone's colour in by proximity to its
    // centre (full inside, fading to nothing across EDGE_BLEND at the rim).
    c.copy(BASE_COLOR);
    for (let j = 0; j < zones.length; j++) {
      const d = Math.hypot(x - zones[j].center[0], z - zones[j].center[1]);
      const mix =
        1 -
        THREE.MathUtils.smoothstep(d, zones[j].radius - EDGE_BLEND, zones[j].radius);
      if (mix > 0) c.lerp(zoneColors[j], mix);
    }
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  pos.needsUpdate = true;
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
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
