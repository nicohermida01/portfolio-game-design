# Night Diorama — Polish Backlog

Follow-up polish for the 3D mode after the night atmosphere (Phase 1) and
archipelago (Phase 2) work landed on `main` (`0907f7a`, `53fac98`).

Status flags: `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` won't do / dropped

---

## High impact

- [x] **Floating 3D labels are broken visually.** `ZoneLabel.jsx` billboards were
  huge up close, never faded with distance, and overlapped geometry. Multiple
  showed at once and doubled up with the DOM `ZoneBanner`.
  → Kept both channels but demoted the 3D label to quiet wayfinding:
  `fontSize` 0.8 → 0.5, mounted lower (`+2.8` / `+2.6` instead of `+4` / `+3.5`),
  and per-frame opacity by camera distance (0.12 when you're on the island →
  ~0.75 a couple of islands away → 0 past the fog). DOM `ZoneBanner` still owns
  the punchy "Entering X" moment.
  Files: `src/scene/ZoneLabel.jsx`, `src/scene/Experience.jsx`.

- [x] **Everything falls off into pure black.** Bridges led to islands you
  couldn't see. Fog `22/55` → `30/92` (only the far edge fades), bg/fog color
  a touch bluer (`#0b1a2b` → `#0e2136`), hemisphere up + a dim non-shadow
  back-fill directional so shadow sides never go pure black. The readable water
  (below) now gives a horizon instead of a void edge.
  Files: `src/scene/Experience.jsx`.

- [x] **Water is an empty black plane.** Two lit-material tries came out as a
  dark slab — night lighting is too weak to lift blue off black. Switched to an
  unlit `meshBasicMaterial` sea driven purely by vertex colours: a coarse plane
  rides three crossed sine waves and each vertex is repainted trough-blue →
  crest-blue every frame, so faceted bands roll across it. Palette graded down
  to keep the night mood after it first read too tropical.
  Files: `src/scene/Water.jsx`.

## Medium impact

- [ ] **Content panel covers the scene.** The right-side `Panel` card is large
  and opaque — it hides a bridge and part of an island. Make it narrower or
  reposition (e.g. bottom-left, or auto-flip away from the marker).
  Files: `src/ui/Panel.jsx`, `src/ui/page.css` (or panel styles).

- [x] **Directional shadow frustum too small for the new layout.** Bounds ±22 →
  ±30 (covers the whole archipelago + margin); `shadow-mapSize` 2048 → 4096 to
  hold density over the bigger area; explicit `near/far` (1/65); added
  `shadow-bias -0.0004` + `shadow-normalBias 0.04` against acne. Note: 4096 map
  is ~64MB VRAM — drop to 3072 if it bites on low-end.
  Files: `src/scene/Experience.jsx`.

- [x] **Re-check building seating after the heightfield change.** Real cause
  wasn't cabin positioning — the island mesh was a `THREE.CircleGeometry` centre
  fan with no radial subdivision, so the visible/collider surface was a smooth
  cone that ignored `groundHeight`'s curve and noise; anything seated via
  `groundHeight` floated or sank against it. Replaced it with a hand-built
  subdivided polar disc (16 rings × 48) that follows `groundHeight`, so mesh,
  trimesh collider and seated objects agree. Then nudged `NOISE_AMP` 0.35 → 0.5
  now that the geometry can carry the relief.
  Files: `src/terrain/heightfield.js`.

## Low impact

- [x] **Water rings still read as a "radar ping".** Root cause was position: the
  rings sat at grass height and started inside the island radius, so they read
  as a marker on the ground. Now they start at `1.14 ×` radius (clear of the
  island skirt), sit on the water surface (`WATER_LEVEL + 0.06`), expand a
  gentle `0.3 ×`, and ease opacity in-then-out (`sin(p·π)`) so there's no spawn
  pop. 2 per island, staggered.
  Files: `src/scene/WaterRings.jsx`.

- [x] **Campfire embers form a thin vertical line.** Spawned in a ±0.15 column
  with near-zero drift and a 2.5 s life. Now spawn across a 0.3-radius disc,
  each ember has a fixed outward angle and fans out as it ages, life is shorter
  and varied (~1.3–2.2 s), and each fades in fast / out over its back half via a
  per-particle `vertexColors` buffer (no death pop). Count 30 → 40.
  Files: `src/scene/Campfire.jsx`.

- [x] **Activation ring is a big bright yellow.** Active color `#ffd166` →
  soft warm white `#ffdf9e`; opacity 0.95/0.5 → 0.55/0.24; thinner band
  (0.9–1.1 → 1.02–1.14, 48 segs), slower spin, `depthWrite` off. Inactive
  points now a softer lavender `#7f86c8`.
  Files: `src/scene/PointOfInterest.jsx`.

- [x] **Grass is too saturated for a night scene.** `BASE_COLOR` `#4c9a5a`
  (bright lime) → `#3c6e46` (muted, slightly cool). Zone tints still blend on
  top. Tree canopy greens left as-is for now.
  Files: `src/terrain/heightfield.js` (`BASE_COLOR`).

- [ ] **HUD hint text** ("Move with W A S D — walk up to a marker") is low
  contrast and clips at the bottom-left edge.
  Files: `src/scene/ThreeScene.jsx` / HUD styles.
