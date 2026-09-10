import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import { ISLANDS, BRIDGE_AXES, HOUSES, MARKERS } from "../sections.js";

// --- Terrain shape (archipelago) -----------------------------------------------
// A handful of independent islands in open water. `groundHeight(x, z)` is the
// single "stand on the ground" API — the mesh geometry and everything that
// rests on the terrain (player, props, markers, cabins, campfire) sample this
// SAME function, so nothing floats or sinks.
//
// Shape language: a low, near-flat GRASS MESA with an IRREGULAR faceted
// coastline, dropping to the water in two rocky steps. Not a smooth dome, not a
// perfect circle.
//   - the plateau is flat (gentle noise only) out to `RIM_START`
//   - from there a 2-step terrace falls to `SHORE_BOTTOM`, well under water
//   - the effective radius is perturbed by angular noise, so the coast lobes
//     in and out instead of being a circle
//   - near a bridge mouth, or near a placed object (cabin / sign / spawn), the
//     rim is forced back to a smooth grass ramp / extended plateau so nothing
//     ends up stranded on a cliff and every bridge foot meets graded land

export const GROUND_SIZE = 40; // world units — kept for the Boundary walls
export const WATER_LEVEL = -0.9;
export const BRIDGE_DECK_Y = WATER_LEVEL + 0.55; // shared with Bridge.jsx

// Palette. Grass on the mesa, bare rock on the steps.
const GRASS = new THREE.Color("#3c6e46"); // muted, slightly cool night grass
const ROCK = new THREE.Color("#5b5b64");
const ROCK_DARK = new THREE.Color("#3c3c44");
const EDGE_BLEND = 1.6; // world units the zone tint fades over at its rim

// Deterministic noise: same layout on every reload.
const noise2D = createNoise2D(mulberry32(hashString("portfolio-diorama")));

// --- profile constants -------------------------------------------------------
const PLATEAU = 0.35; // flat mesa height — low, ~1.25u of island side above water
const RIM_START = 0.78; // effR where the flat top ends and the rocky rim begins
const SHORE_BOTTOM = -1.6; // rim base — well below the waterline
const TOP_NOISE_AMP = 0.09; // gentle undulation on the mesa (faded near the rim)
const COAST_AMP = 0.13; // ± fraction of radius the coastline lobes in / out
const SEA_SENTINEL = WATER_LEVEL - 3; // deep open water, triggers the fall respawn

// Points that must stay on flat ground regardless of the coastline wobble.
// Strong: spawn/campfire + cabins — a big flat pad (a cabin on a rock step
// looks broken). Light: signposts — just enough flat ground for the sign and
// its pad, so the rocky rim survives on the arcs between them.
const FLAT_STRONG = [[0, 0], ...HOUSES.map((h) => [h.position[0], h.position[2]])];
const FLAT_LIGHT = MARKERS.map((m) => [m.position[0], m.position[2]]);

// Smooth, periodic-in-angle coastline wobble, unique per island, roughly [-1, 1].
// Sampling the 2D noise around a circle makes it inherently seamless at ±π; a
// second higher-frequency octave adds the angular facets.
function coastWobble(ang, seedIdx) {
  const sx = seedIdx * 21.7;
  const sz = seedIdx * 9.3;
  const o1 = noise2D(Math.cos(ang) * 1.7 + sx, Math.sin(ang) * 1.7 + sz);
  const o2 = noise2D(Math.cos(ang) * 4.1 + sx + 50, Math.sin(ang) * 4.1 + sz - 50);
  return o1 * 0.72 + o2 * 0.28;
}

// 1 near a bridge landing angle, easing to 0 within ~0.6 rad of it.
function bridgeInfluence(islandId, ang) {
  const axes = BRIDGE_AXES[islandId] || [];
  let m = 0;
  for (const ax of axes) {
    const d = Math.abs(Math.atan2(Math.sin(ang - ax), Math.cos(ang - ax)));
    const f = 1 - THREE.MathUtils.smoothstep(d, 0.16, 0.62);
    if (f > m) m = f;
  }
  return m;
}

function flatInfluence(x, z) {
  let m = 0;
  for (let i = 0; i < FLAT_STRONG.length; i++) {
    const d = Math.hypot(x - FLAT_STRONG[i][0], z - FLAT_STRONG[i][1]);
    const f = 1 - THREE.MathUtils.smoothstep(d, 2.2, 3.6);
    if (f > m) m = f;
  }
  for (let i = 0; i < FLAT_LIGHT.length; i++) {
    const d = Math.hypot(x - FLAT_LIGHT[i][0], z - FLAT_LIGHT[i][1]);
    const f = 1 - THREE.MathUtils.smoothstep(d, 1.3, 2.2);
    if (f > m) m = f;
  }
  return m;
}

// 2-step terrace across t in [0, 1]: a flat tread then a sloped riser per level.
function terrace(t) {
  const N = 2;
  const s = THREE.MathUtils.clamp(t, 0, 1) * N;
  const level = Math.min(Math.floor(s), N - 1);
  const frac = s - level;
  const riser = THREE.MathUtils.smoothstep(frac, 0.55, 1.0);
  return (level + riser) / N;
}

// Core field sample: nearest island, the perturbed radial ratio (`effR`), the
// rock/ramp blend used for colouring, and the height.
function islandField(x, z) {
  let best = null;
  let bestD = Infinity;
  let bestIdx = -1;
  for (let i = 0; i < ISLANDS.length; i++) {
    const isl = ISLANDS[i];
    const d = Math.hypot(x - isl.center[0], z - isl.center[1]);
    if (d < bestD) {
      bestD = d;
      best = isl;
      bestIdx = i;
    }
  }
  if (!best) return { island: null, effR: 99, bInf: 0, height: SEA_SENTINEL };

  const ang = Math.atan2(z - best.center[1], x - best.center[0]);
  const bInf = bridgeInfluence(best.id, ang);
  // A bridge mouth wins over the flat-pinning around a nearby object, so the
  // ramp down to the deck isn't cancelled by a marker sitting near the foot.
  const fInf = flatInfluence(x, z) * (1 - bInf);
  const suppress = Math.max(bInf, fInf); // where the coast wobble is cancelled

  const wob = coastWobble(ang, bestIdx) * COAST_AMP * (1 - suppress);
  const effR = bestD / (best.radius * (1 + wob));

  const topNoise = () => {
    const fade = 1 - THREE.MathUtils.smoothstep(effR, RIM_START - 0.3, RIM_START);
    return noise2D(x / 7, z / 7) * TOP_NOISE_AMP * fade;
  };

  // The bridge ramp only needs to reach deck level at the foot (~effR 0.9);
  // past that it fades out so the shore drops under water like everywhere else
  // (the bridge deck geometry spans the gap).
  const bRamp = bInf * (1 - THREE.MathUtils.smoothstep(effR, 0.92, 1.15));

  let base;
  if (effR <= RIM_START) {
    base = PLATEAU + topNoise();
  } else if (effR <= 1.0) {
    const t = (effR - RIM_START) / (1.0 - RIM_START);
    const stepped = THREE.MathUtils.lerp(PLATEAU, SHORE_BOTTOM, terrace(t));
    const ramp = THREE.MathUtils.lerp(
      PLATEAU,
      BRIDGE_DECK_Y - 0.05,
      THREE.MathUtils.smoothstep(t, 0, 0.69),
    );
    base = THREE.MathUtils.lerp(stepped, ramp, bRamp);
  } else if (effR <= 1.9) {
    // Submerged skirt — hidden under the water plane. Kept continuous so the
    // trimesh collider has no gap at the shore.
    base = THREE.MathUtils.lerp(SHORE_BOTTOM, BRIDGE_DECK_Y - 0.05, bRamp);
  } else {
    return { island: best, islandIdx: bestIdx, effR, ang, bInf, height: SEA_SENTINEL };
  }

  // Placed-object flat pad: lift toward the plateau near a cabin / sign / the
  // spawn, so nothing is stranded on the rocky rim even where its coords hug
  // the island edge. The mesh samples this too, so the coastline bulges out to
  // wrap those spots in flat grass.
  const flat = PLATEAU + topNoise();
  const height = fInf > 0 ? THREE.MathUtils.lerp(base, flat, fInf) : base;

  return { island: best, islandIdx: bestIdx, effR, ang, bInf, height };
}

export function groundHeight(x, z) {
  return islandField(x, z).height;
}

// --- Island mesh -----------------------------------------------------------
// A subdivided polar disc: one centre vertex plus RADIAL_SEGS concentric rings
// of ANGULAR_SEGS vertices, in the XZ plane. THREE.CircleGeometry is only a
// coarse centre fan (no radial resolution), so it can't follow the mesa / rim
// profile — this has the radial detail for the displaced surface (and its
// trimesh collider) to actually match groundHeight.
const RADIAL_SEGS = 22;
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
  // Reaches past the widest possible coastline lobe; the extra is submerged
  // skirt, hidden under the water plane.
  const geo = polarDisc(island.radius * 1.32);
  geo.translate(island.center[0], 0, island.center[1]);

  const zoneColors = zones.map((z) => new THREE.Color(z.color));
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const rock = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const f = islandField(x, z);
    pos.setY(i, Math.max(f.height, SHORE_BOTTOM - 0.3));

    // Grass base + zone tint.
    c.copy(GRASS);
    for (let j = 0; j < zones.length; j++) {
      const d = Math.hypot(x - zones[j].center[0], z - zones[j].center[1]);
      const mix =
        1 -
        THREE.MathUtils.smoothstep(d, zones[j].radius - EDGE_BLEND, zones[j].radius);
      if (mix > 0) c.lerp(zoneColors[j], mix);
    }

    // Rim: grass -> rock as effR passes ~0.82, darkening with depth, with a
    // little per-vertex jitter so it's not a flat grey. Suppressed at bridge
    // mouths (that rim is a plain grass ramp).
    const rockMix =
      THREE.MathUtils.smoothstep(f.effR, 0.82, 0.92) * (1 - f.bInf);
    if (rockMix > 0) {
      const jitter = 0.5 + 0.5 * noise2D(x * 1.3 + 11, z * 1.3 - 7);
      const depth = THREE.MathUtils.clamp((PLATEAU - f.height) / 1.6, 0, 1);
      rock.copy(ROCK).lerp(ROCK_DARK, depth * 0.75 + jitter * 0.2);
      c.lerp(rock, rockMix);
    }

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
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
