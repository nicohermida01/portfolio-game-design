// The portfolio, laid out on the terrain.
//
// Two kinds of thing live on the map:
//   - POINTS: a single standalone marker (index, contact).
//   - ZONES:  a differentiated area of terrain (its own tint + a region-name
//             banner when you enter) that scatters several markers inside it,
//             one per real entry in content.js.
//
// `position` is [x, y, z] in world space. y is ignored for placement — markers
// are dropped onto the terrain surface via groundHeight() — so keep it 0.
//
// Every marker `id` matches an id in content.js so the panel can pull the real
// content (see resolveMarker below).

import { experience, projects, profile, hero, contact } from "./content.js";

// The iso camera is fixed, looking in from +X / +Z. Every sign and cabin faces
// this way so the "front" is always toward the viewer.
export const FACING_YAW = Math.PI / 4;

// Unit vector from anywhere on the ground toward the camera, on the XZ plane.
// Used to keep occluders (trees, cabins) off the sightline to each sign.
export const TO_CAMERA = [Math.SQRT1_2, Math.SQRT1_2];

export const POINTS = [
  // `house` sits on the far side (−X/−Z) of the marker so it never stands
  // between the sign and the camera.
  { id: "index", label: "Index", position: [0, 0, -3], house: [-3, 0, -5.5] },
  { id: "contact", label: "Contact", position: [0, 0, 12], house: [-3, 0, 10] },
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
// Resolve a marker id to what the panel renders. Standalone points map to
// page-level content; zone markers map to a projects[] / experience[] entry.

export function resolveMarker(id) {
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
      body: project.description,
      stack: project.stack,
      href: project.href,
      hrefLabel: project.hrefLabel || "Open",
    };
  }

  const job = experience.find((e) => e.id === id);
  if (job) {
    return {
      tag: "work",
      title: job.company,
      subtitle: `${job.role} · ${job.period.join(" – ")}`,
      body: job.description,
      stack: job.stack,
      href: job.companyUrl,
      hrefLabel: "Site",
    };
  }

  return { tag: id, title: id, body: "" };
}
