// The portfolio, laid out on the terrain.
//
// Two kinds of thing live on the map:
//   - POINTS: a single standalone marker (index, contact).
//   - ZONES:  a differentiated area of terrain (its own tint + a region-name
//             banner when you enter) that scatters several markers inside it,
//             one per real entry in the locale dictionaries (src/i18n).
//
// `position` is [x, y, z] in world space. y is ignored for placement — markers
// are dropped onto the terrain surface via groundHeight() — so keep it 0.
//
// Every marker `id` matches an id in the locale dictionaries (src/i18n) so the
// panel can pull the real content (see resolveMarker below).

import { getDict } from "./i18n/index.js";

// The iso camera is fixed, looking in from +X / +Z. Every sign and cabin faces
// this way so the "front" is always toward the viewer.
export const FACING_YAW = Math.PI / 4;

// Unit vector from anywhere on the ground toward the camera, on the XZ plane.
// Used to keep occluders (trees, cabins) off the sightline to each sign.
export const TO_CAMERA = [Math.SQRT1_2, Math.SQRT1_2];

export const POINTS = [
  // `house` sits on the far side (−X/−Z) of the marker so it never stands
  // between the sign and the camera. Pulled in off the island rim (the terrain
  // now has a rocky edge) while keeping the same bearing.
  { id: "index", label: "Home", position: [0, 0, -3], house: [-2, 0, -4.66] },
  { id: "contact", label: "Contact", position: [0, 0, 12], house: [-1.87, 0, 10.75] },
];

export const ZONES = [
  {
    id: "work",
    title: "Work",
    // Centre + radius in world units (x, z). Terrain within `radius` of
    // `center` is tinted `color`; crossing in raises the region banner.
    center: [-14, -7],
    radius: 6,
    color: "#3f7d8c",
    // Two cabins, read as a little hamlet — clustered on the back (−X/−Z) edge
    // of the zone so they never occlude the markers.
    houses: [
      [-17.5, 0, -8.5],
      [-15, 0, -11],
    ],
    // Markers live in the front (+X/+Z) half of the zone, nearer the camera.
    markers: [
      { id: "autoinspector", position: [-12, 0, -5] },
      { id: "cepa", position: [-16, 0, -4] },
      { id: "academia-perrupato", position: [-11, 0, -8] },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    center: [14, -6],
    radius: 6,
    color: "#8c6f3f",
    houses: [
      [10.5, 0, -7.5],
      [12.5, 0, -10],
    ],
    markers: [
      { id: "necto", position: [17, 0, -5] },
      { id: "estudio-nodo", position: [12, 0, -3] },
      { id: "bit-by-bit", position: [15.5, 0, -2] },
    ],
  },
];

// Each portfolio location is its own island. Points get a small disc; zones
// reuse their tint radius. `index` is the hub the player spawns on.
export const ISLANDS = [
  { id: "index",    center: [0, -3],          radius: 5,   kind: "hub" },
  { id: "contact",  center: [0, 12],          radius: 4.5, kind: "point" },
  { id: "work",     center: ZONES[0].center,  radius: ZONES[0].radius, kind: "zone", color: ZONES[0].color },
  { id: "projects", center: ZONES[1].center,  radius: ZONES[1].radius, kind: "zone", color: ZONES[1].color },
];

// Walkable graph. `index` is the hub; every other island hangs off it.
export const BRIDGES = [
  { from: "index", to: "work" },
  { from: "index", to: "projects" },
  { from: "index", to: "contact" },
];

// The [x, z] points where each bridge lands on an island shore. Must match the
// foot maths in Bridge.jsx (`center + unit * radius * 0.9`). Prop scatter keeps
// clear of these so nothing spawns across a bridge approach.
export const BRIDGE_FEET = BRIDGES.flatMap(({ from, to }) => {
  const a = ISLANDS.find((i) => i.id === from);
  const b = ISLANDS.find((i) => i.id === to);
  const dx = b.center[0] - a.center[0];
  const dz = b.center[1] - a.center[1];
  const s = Math.hypot(dx, dz) || 1;
  const ux = dx / s;
  const uz = dz / s;
  return [
    [a.center[0] + ux * a.radius * 0.9, a.center[1] + uz * a.radius * 0.9],
    [b.center[0] - ux * b.radius * 0.9, b.center[1] - uz * b.radius * 0.9],
  ];
});

// Per-island list of bridge landing angles (radians, measured from the island
// centre on the XZ plane). `heightfield.js` uses these to flatten the coastline
// into a smooth grass ramp at each bridge mouth — no rocky steps, no wobble —
// so every bridge foot meets graded land.
export const BRIDGE_AXES = Object.fromEntries(ISLANDS.map((i) => [i.id, []]));
for (const { from, to } of BRIDGES) {
  const a = ISLANDS.find((i) => i.id === from);
  const b = ISLANDS.find((i) => i.id === to);
  const ab = Math.atan2(b.center[1] - a.center[1], b.center[0] - a.center[0]);
  BRIDGE_AXES[from].push(ab);
  BRIDGE_AXES[to].push(ab + Math.PI);
}

// Flat list of every marker on the map, each carrying the zone tint it renders
// in (null for standalone points). Player proximity + Experience iterate this.
export const MARKERS = [
  ...POINTS.map((p) => ({ ...p, zoneId: null, color: null })),
  ...ZONES.flatMap((z) =>
    z.markers.map((m) => ({ ...m, zoneId: z.id, color: z.color })),
  ),
];

// Every cabin on the map, flattened for rendering + prop-scatter clearance.
// Standalone points get one; each zone gets two. All face the camera
// (FACING_YAW); only `scale` varies so a cluster isn't a dead copy-paste.
export const HOUSES = [
  { id: "h-index", position: POINTS[0].house, scale: 1 },
  { id: "h-contact", position: POINTS[1].house, scale: 0.95 },
  { id: "h-work-1", position: ZONES[0].houses[0], scale: 1.1 },
  { id: "h-work-2", position: ZONES[0].houses[1], scale: 0.85 },
  { id: "h-projects-1", position: ZONES[1].houses[0], scale: 1.05 },
  { id: "h-projects-2", position: ZONES[1].houses[1], scale: 0.88 },
];

// How close (in world units) the player must be for a marker to activate.
export const ACTIVATION_RADIUS = 2.6;

// --- Panel content ------------------------------------------------------------
// Resolve a marker id to what the panel renders, in the given locale's language.
// Standalone points map to page-level content; zone markers map to a
// projects[] / experience[] entry. `dict` defaults to English so callers that
// don't care about language (or run before the store exists) still work.

export function resolveMarker(id, dict = getDict("en")) {
  const { profile, hero, contact, projects, experience, ui } = dict;

  if (id === "index") {
    return { tag: "index", title: profile.name, body: hero.body };
  }

  if (id === "contact") {
    return {
      tag: "contact",
      title: contact.heading,
      body: contact.body,
      links: profile.links,
    };
  }

  const project = projects.find((p) => p.id === id);
  if (project) {
    return {
      tag: "project",
      title: project.name,
      meta: project.badge,
      image: project.image,
      body: project.description,
      stack: project.stack,
      href: project.href,
      hrefLabel: project.hrefLabel || ui.open,
    };
  }

  const job = experience.find((e) => e.id === id);
  if (job) {
    return {
      tag: "work",
      title: job.company,
      subtitle: `${job.role} · ${job.period.join(" – ")}`,
      image: job.image,
      body: job.description,
      stack: job.stack,
      href: job.companyUrl,
      hrefLabel: ui.site,
    };
  }

  return { tag: id, title: id, body: "" };
}
