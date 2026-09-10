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

- [x] **Content panel covers the scene.** It was vertically centred on the right
  edge — right over the bridges/islands. Moved to the top-right corner (sky /
  water in 3D; clear of the bottom-right mode button), narrowed 360 → 320px,
  and made more translucent (bg `0.82` → `0.66`, blur 12 → 14). `max-height` +
  scroll kept for text-heavy sections.
  Files: `src/styles.css` (`.panel`).

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

- [x] **HUD hint text** was `rgba(30,40,32,0.7)` (a dark green for the old light
  backdrop) — invisible on the night scene, and the `kbd` caps were dark-on-dark.
  Now white 78% + `text-shadow`; `kbd` caps light translucent bg/border/text;
  `bottom` 24 → 28 and `max-width: calc(100vw - 48px)` so it wraps instead of
  clipping; on touch it moves to the top, clear of the joystick corner.
  Files: `src/styles.css` (`.hud`).

---

# Round 2 — post-screenshot review (2026-09-09)

Findings from a fresh look at the running build against the code. Same status
flags as above (`[ ]` todo · `[~]` in progress · `[x]` done · `[-]` dropped).

## High impact — breaks the read (visible in the screenshot)

- [x] **Zone / point labels get occluded and clipped.** `PROJECTS` rendered as
  `ROJECTS` (a tree in front of it); `INDEX` floated over open water, barely
  legible. `ZoneLabel.jsx` `<Text>` used normal depth-testing, so any tree or
  cabin between it and the camera cut into it, and near-distance opacity was
  `0.12` (deferring to the DOM `ZoneBanner`) — but only ZONES raise that banner,
  so `index` / `contact` (POINTS) were permanent ghosts.
  → `material.depthTest/depthWrite = false` + `renderOrder` 10, mounted higher
  (`+3.7` / `+3.4`), dim per-character-sized backing plate at `renderOrder` 9,
  `outlineBlur` halo, and near-opacity `0.12` → `0.42` (min), clear `0.75` →
  `0.95`. Verified in a headless render: `INDEX` sits on its plate, on top of
  the cabin behind it, fully readable.
  Files: `src/scene/ZoneLabel.jsx`, `src/scene/Experience.jsx`.

- [x] **Signposts carry no information.** Every `Signpost` was the same amber
  rectangle. Now the marker name is baked onto the board face with a drei
  `<Text>` (0.13 font, wraps at `maxWidth` 0.96, warm off-white, dark outline),
  wrapped with the board in a pitched sub-group so it tilts to face the camera.
  `PointOfInterest` passes `marker.label ?? resolveMarker(id).title`, so POINTS
  read "Index" / "Contact" and zone markers read the real content title.
  Verified: "CEPA ARGENTINA", "AUTOINSPECTOR", "ACADEMIA PERRUPATO",
  "ESTUDIO NODO", "INDEX" all legible from across the water.
  Files: `src/scene/Signpost.jsx`, `src/scene/PointOfInterest.jsx`.

- [x] **Lighting balance between islands is off.** Projects was blown out orange
  (2 cabin lights intensity 6 / dist 7 + 3 sign lights intensity 3, clustered);
  Work was nearly black. Cabin light 6 → 2.4, dist 7 → 5; sign light 3 → 1.3,
  dist 4.5 → 3.4; window/lantern `emissiveIntensity` 2 → 1.6; ambient 0.42 →
  0.52 and moon 1.1 → 1.25 to lift the unlit islands; `Bloom` intensity 0.8 →
  0.5 so the warm glow stops washing. Verified: Work island now reads teal and
  lit, Index cabin glow is warm but contained, campfire still the key light.
  Files: `src/scene/Cabin.jsx`, `src/scene/Signpost.jsx`, `src/scene/Experience.jsx`.

- [x] **Too many real-time point lights.** Dropped every per-signpost and
  per-cabin `pointLight` (~14). The lantern/window emissive (bumped to 2.4 / 2.6)
  + bloom carry the glow; `Experience.jsx` now runs one shadowless warm fill
  (`ISLAND_FILLS`) over each island's cabin cluster. Down to 5 point lights,
  campfire still the only shadow-caster. Verified: all four islands read, no
  orange blowout, signs still legible.
  Files: `src/scene/Cabin.jsx`, `src/scene/Signpost.jsx`, `src/scene/Experience.jsx`.

- [x] **Activation ring reads as a broken spinning arc**, not a "stand here" pad.
  Replaced the single spinning ring with a filled `circleGeometry` disc + a thin
  static rim. No rotation; both breathe on a slow sine (`~3.5s`). On activate
  the disc brightens (0.08 → 0.24 base), the rim firms up (0.16 → 0.5) and swells
  ~3%. Opacity is driven in `useFrame` off refs, so no re-render churn.
  Files: `src/scene/PointOfInterest.jsx`.

## Medium impact — scene / world

- [x] **Bridges read as railroad track.** Thin cross-planks with a regular gap
  and an invisible handrail read as sleepers. Rebuilt `Bridge.jsx`: deck planks
  near-flush (`PLANK_W` 0.26 / `PLANK_GAP` 0.05), continuous stringer beams
  under both deck edges, a thick top handrail running the full span, and rail
  posts at a regular `POST_SPACING` (1.5) pitch on both sides. Colliders updated
  to the new deck half-width (0.85) and rail height (0.52). Verified in render:
  now reads as a boardwalk / footbridge.
  Files: `src/scene/Bridge.jsx`.
  Still open: the `index→work` bridge still runs toward the frame edge — that's
  framing (see the "Framing" item), not the bridge.

- [x] **Unidentified dark object clipping the Projects bridge** (at its foot in
  the screenshot). `scatter()` in `Props.jsx` rejected props near markers, houses
  and sightlines but not the bridge footprints. Added `BRIDGE_FEET` to
  `sections.js` (the shore landing points, matching Bridge.jsx's `radius * 0.9`
  foot maths) and a `BRIDGE_FOOT_CLEARANCE` 2.6 rejection in `scatter()`.
  Verified in render: approaches are clear.
  Files: `src/scene/Props.jsx`, `src/sections.js` (`BRIDGE_FEET`).

- [x] **Framing.** Fixed iso camera + follow left Work half off-screen with its
  label cut. Pulled the camera back on the same diagonal: `CAMERA_OFFSET`
  `(10,10,10)` → `(13.5,13.5,13.5)` (and the matching `<Canvas>` initial
  position). Scaling uniformly keeps the iso angle and the movement basis
  unchanged. Fog pushed out `30/92` → `38/104` so the extra distance doesn't
  haze the far islands. Verified: standing on the hub you now see Work, Contact
  and both their labels in one frame; Projects still sits just off the right
  edge (the archipelago is wider than any single view), and walking that way
  brings it in. Chose zoom over moving island centres — that would ripple
  through every hard-coded house/marker coord in `sections.js`.
  Files: `src/scene/Player.jsx`, `src/scene/ThreeScene.jsx`, `src/scene/Experience.jsx`.

## Medium impact — code / consistency

- [x] **Mixed language + invisible loader.** `"Cargando modo 3D…"` → `"Loading
  3D mode…"`. `.scene-loading` now paints a full-bleed `#0e2136` with light
  text (was dark-on-dark), and `body` background `#dfeae0` → `#0e2136` so the
  pre-mount frame no longer flashes white (page mode's `.pp` already covers the
  body with `#07090f`, so nothing else regresses). Verified: loader is a clean
  dark screen.
  Files: `src/App.jsx`, `src/styles.css` (`.scene-loading`, `body`).

- [x] **`groundHeight` called on every render** inside `Tree` / `Rock`
  (`Props.jsx`). Both now `useMemo` it, matching `Cabin` / `Signpost`.
  Files: `src/scene/Props.jsx`.

- [x] **No instancing.** Trees (3 meshes each) + rocks were each their own
  `RigidBody` + `mesh` (~114 objects / ~84 draw calls). Now 4 `drei` `<Instances>`
  draws (trunk / lower canopy / upper canopy / rock) + one shared fixed
  `RigidBody` holding every collider (tree `CylinderCollider`, rock
  `BallCollider`). Scatter unchanged and still deterministic. Cabins left as-is
  (only 6, and each has its own collider + emissive window).
  Files: `src/scene/Props.jsx`.

- [-] **Trimesh island colliders + capsule player.** Deferred. Swapping to
  `colliders="hull"` makes the player float above the visual mesh near island
  rims and over `groundHeight` noise dips (the hull bridges every concavity) —
  that regresses the earlier "island mesh follows the terrain height" fix. The
  correct fix is a Rapier `HeightfieldCollider` sampled from `groundHeight` on a
  grid per island: exact *and* seam-free. It's the riskiest change in the pass
  and can't be verified from a screenshot, and it's a feel fix, not a perf win —
  so it's parked until the seam-snag is actually felt in play.
  Files: `src/scene/Terrain.jsx`, `src/terrain/heightfield.js`.

- [-] **`Water` recomputes 1,225 vertices on the CPU every frame.** Deferred.
  The win is ~0.3 ms/frame. Moving it to the GPU means `onBeforeCompile` on a
  `meshBasicMaterial`, which shares three's program cache with the other basic
  material in `WaterRings` (needs a `customProgramCacheKey`) and depends on the
  `fog` chunk being present to inject into — fragile for the payoff. Revisit if
  a real frame-budget problem shows up, or bump `SEG` down instead.
  Files: `src/scene/Water.jsx`.

- [x] **Fireflies drift over open sea.** One global `<Sparkles>` box → one
  per island, each centred on `ISLANDS[i].center`, `scale` ≈ `radius * 1.9` wide
  by `3.2` tall, `count` ≈ `radius * 3.2`. They now hang over the grass.
  Files: `src/scene/Fireflies.jsx`.

## Low impact — nice to have

- [ ] **No audio.** Campfire crackle, footsteps, water lap, night ambience.
  Deferred by decision — do this last, once everything else is settled.
  Files: (new).

- [x] **Minimal onboarding.** Three pieces:
  1. **Welcome line** — `src/ui/Intro.jsx`, a one-liner ("Walk up to a signpost
     to read that section — bridges link the islands.") shown on first 3D entry,
     cleared on first movement / any key / a click / after 8s, and never shown
     again (`localStorage: pgd:intro-dismissed`).
  2. **Close the panel** — `Panel.jsx` gets an `×` button and an `Esc` handler.
     `store.js` tracks `dismissedMarkerId` so the panel stays closed while you're
     still standing on that sign, and clears it once you leave the radius.
  3. **Spawn guide arrow** — a small floating chevron over the player
     (`Player.jsx`) that points at the nearest signpost until you reach your
     first one, then it's gone for good (`localStorage: pgd:first-marker-seen`).
  Files: `src/ui/Intro.jsx`, `src/ui/Panel.jsx`, `src/store.js`,
  `src/scene/Player.jsx`, `src/scene/ThreeScene.jsx`, `src/styles.css`.

- [x] **Character rendered as a dark blob.** `CHARACTER.present` is actually
  `true` — it's `public/models/Steve.glb`, a Quaternius rig with a Minecraft
  "Steve" atlas. The FBX→glTF export set `metallicFactor: 0.4` with no PBR maps,
  so under the dim night lighting the half-metal surface just reflected the near
  black sky. Fix: `Character.jsx` now forces every material `metalness = 0`,
  `roughness = 1`, `envMapIntensity = 0` on load, and `Player.jsx` carries a
  soft cool follow light (`#aac2e4`, intensity 3.2, distance 5.5, no shadow) so
  the character never sinks into black on a dark bridge or far island.
  **Decision:** keep the Steve model — the readability fix is enough; not
  chasing a fancier CC0 model. Reads small and the idle pose is a bit
  crouched, but that's acceptable for a background walkable avatar.
  Files: `src/scene/Character.jsx`, `src/scene/Player.jsx`.

---

# Round 3 — post-screenshot review (2026-09-09)

Fresh look at the running build (night archipelago) against the code. Round 2
is closed; only audio was left. Same status flags.

## Foundational — terrain rework (do before the rest of Round 3)

- [x] **Islands are ugly: perfect circles with a dome growing to the centre.**
  `heightfield.js` `groundHeight` was `lerp(0.7, -0.6, smoothstep(r))` — a smooth
  cone — over a perfectly circular `polarDisc`.
  → Chosen look (user): **flat grass mesa + irregular faceted coastline +
  rocky stepped edge.** Rewrote the profile:
  · `PLATEAU 0.35` held flat (gentle `TOP_NOISE_AMP 0.09` only) out to
    `RIM_START 0.78`, then a 2-step `terrace()` (flat tread + sloped riser per
    level) down to `SHORE_BOTTOM -1.6`, well under the waterline.
  · `effR = dist / (radius · (1 + coastWobble(angle) · 0.13))` — periodic-in-
    angle 2-octave noise sampled around a circle, unique per island → the coast
    lobes in and out instead of being a circle. Mesh `polarDisc` grown to
    `radius · 1.32` to cover the widest lobe; the overhang is submerged skirt.
  · `bridgeInfluence(islandId, angle)` (new `BRIDGE_AXES` export in
    `sections.js`): at each bridge mouth the rim becomes a smooth grass ramp
    that meets `BRIDGE_DECK_Y` (all six feet land at `-0.32`, deck `-0.35`),
    the coast wobble is cancelled, and the ramp fades out past the foot so the
    shore still drops under water.
  · `flatInfluence(x, z)`: STRONG pad (spawn + cabins, `2.2/3.6`u) and LIGHT pad
    (signposts, `1.3/2.2`u) lift the terrain back to the plateau near placed
    objects — the mesh bulges a flat grass spur around each — so nothing is
    stranded on the rim. Verified numerically: every cabin footprint, sign base
    and bridge foot sits on flat ground; rocky rim still reads on 60–90% of
    each coastline.
  · Colours: grass on the mesa, `GRASS → ROCK/ROCK_DARK` on the steps
    (`effR 0.82–0.92`), per-vertex jitter, suppressed at bridge mouths.
  Knock-on: `sections.js` `BRIDGE_AXES` + `h-index`/`h-contact` nudged in off
  the rim (same bearing); `Bridge.jsx` uses shared `BRIDGE_DECK_Y`; `Props.jsx`
  rejects scatter over water + keeps props inside `radius · 0.72`; `Water.jsx`
  `AMPL 0.32 → 0.24`. Build green.
  Left to eyeball in `dev`: step steepness / count, `COAST_AMP`, rock palette,
  whether the flat spurs around cabins read as intentional.
  Files: `src/terrain/heightfield.js`, `src/sections.js`, `src/scene/Bridge.jsx`,
  `src/scene/Props.jsx`, `src/scene/Water.jsx`.

## High impact — breaks the read

- [x] **The two label systems fight each other.** `ZoneLabel.jsx` billboards ran
  `depthTest:false` + `renderOrder 10`, drawing on top of everything — `INDEX`
  punched through the Index cabin roof and read as pasted on it. At the frame
  edge they clipped hard (`CONTACT` → `NTACT`, `WORK` cut off at the top on the
  hub). Meanwhile `Signpost.jsx` baked the name at `fontSize 0.13` on a
  `1.1 × 0.5` board — ~10px at iso distance, so the Work island signs were
  unreadable noise. Index showed its name three ways at once.
  → One hero channel per distance band:
  · `Signpost.jsx` board `1.1×0.5` → `1.45×0.66`, font `0.13` → `0.2` (~15px at
    iso), post/brace/lantern raised to match — the signpost now owns close range.
  · `ZoneLabel.jsx` `NEAR_OP` `0.42` → `0.0` (`NEAR` 12→10, `CLEAR` 26→22): on
    the island you're standing on the billboard fades out and hands off to the
    signpost + DOM banner, so no more triple-up.
  · `ZoneLabel.jsx` NDC edge-clamp: an inner screen-aligned `<group>` is nudged
    by the frustum-scaled NDC overshoot, so an off-frame island's label sticks
    to the screen edge as a waypoint instead of clipping mid-word; a label
    behind the camera fades to 0 rather than snapping around.
  · `Experience.jsx` label mount `+3.7/+3.4` → `+4.4/+4.1`, clear of the cabin
    ridge so it floats over the island.
  Build green. Left to eyeball in `npm run dev`: the exact NEAR/CLEAR handoff
  distances and the `EDGE 0.86` margin.
  Files: `src/scene/Signpost.jsx`, `src/scene/ZoneLabel.jsx`,
  `src/scene/Experience.jsx`.

- [x] **Campfire crossed logs read as a green/grey splat.** `Campfire.jsx` — four
  full-length (`1.3u`) hex cylinders crossing at `PI/4`, flat at `y=0.12`. That's
  an 8-spoke asterisk wider than the flame; the dark brown (`#4a2f1d`) under the
  cool ambient + hemisphere at the iso angle desaturated to a muddy green. The
  fire also had no base — it sat straight on the grass.
  → Replaced with `PYRE_LOGS`: 5 logs (`0.06/0.08 × 1.15`) leaning inward on a
  `rotation-y` fan, tops converging ~`y 0.86` just under the flame — reads as
  firewood, contained inside the flame footprint. Warm browns (`#5a3a22` /
  `#6b4428`) that don't desaturate to green, and the inner faces catch the fire
  light. Plus `HEARTH_STONES` (8-stone ring, `icosahedron 0.12`) and a two-disc
  ground decal (dark scorch `#160f07` @0.6 + additive ember-bed glow `#ff7a2e`
  @0.16) so the hearth is seated. Flame / key light / embers unchanged. Build
  green.
  Files: `src/scene/Campfire.jsx`.

- [x] **The character is the weakest object on screen.** Small, dark, crouched
  idle pose.
  → Scoped fix (keep the Steve asset): `character.js` `scale` `0.553` → `0.63`
  (~1.6u, a touch over the 1.4u capsule so it has presence in the wide iso
  frame; origin is at the feet so `yOffset` stays pinned). `Player.jsx` now
  carries **two** follow lights instead of one — cool key `3.2` → `4`, plus a
  new dim warm fill low in front (`#ffd9b0`, `intensity 1.8`, `distance 3.4`)
  so the camera-facing side stops reading as a flat silhouette. Build green.
  Left as-is: the crouched idle pose is the model's own `Idle` clip — not
  chasing it (asset decision). If it turns out `Idle` isn't resolving,
  `Character.jsx` logs the clip names + a warning to the console.
  Files: `src/character.js`, `src/scene/Player.jsx`.

## Medium impact — scene / world

- [x] **Water rings still read as contour lines / sonar.** `WaterRings.jsx` drew
  two crisp thin `ringGeometry` bands (`0.98–1.0`) per island — hard inner/outer
  edges that read as a drawn circle.
  → Shared radial-gradient alpha texture (`makeRingAlpha`, one `CanvasTexture`)
  on a wide `ringGeometry [0.4, 1]` band, so both edges feather out. Slower and
  wider so it disperses instead of marching: `PERIOD` `5.5` → `7`, `GROW` `0.3`
  → `0.5`, `START` `1.14` → `1.1`, `PEAK_OPACITY` `0.24` → `0.17`, and the
  fade-out eases faster (`sin(p·π) ** 1.5`). Still 2 per island, staggered
  wider. Build green.
  Files: `src/scene/WaterRings.jsx`.

- [ ] **Far islands crush to near-black on the shadow side.** Back-fill
  directional is only `intensity 0.16` (`Experience.jsx`); Projects' far half
  goes muddy. A touch more fill, or a rim from the moon side.
  Files: `src/scene/Experience.jsx`.

- [~] **Framing.** Standing on the hub, Contact clipped hard at the left edge,
  Projects at the right, and the bottom third of the frame was dead water. The
  fixed iso follow sat at a steep `(13.5, 13.5, 13.5)` — a true 45° top-down.
  → Lowered the pitch to ~35°: `CAMERA_OFFSET` `(15.5, 11.5, 15.5)` (`x === z`
  still, so the 45° yaw and the movement basis are untouched; only `y` drops).
  A lower pitch pulls the neighbouring islands closer together on screen and
  trims the foreground water. `x/z` `13.5 → 15.5` also widens the view ~15%.
  Matched the `<Canvas>` initial position; fog `38/104 → 42/122` so the back
  islands don't haze at the shallower angle. Build green.
  Iteration 1 — eyeball in `dev`: the pitch (bump `y` back toward `13` if it
  reads too flat / loses the diorama feel), and whether all four islands now
  sit in one frame from the hub or it needs a touch more pull-back.
  Files: `src/scene/Player.jsx`, `src/scene/ThreeScene.jsx`,
  `src/scene/Experience.jsx`.

- [ ] **Signpost lanterns smear into one bloom blob** on the zone islands —
  `emissiveIntensity 2.4` × 3 clustered signs. Consider lighting only the
  active sign.
  Files: `src/scene/Signpost.jsx`.

## Low impact — nice to have

- [x] **Work / project panels show no image.** Page mode renders the
  `content.js` `image` for every project + experience entry; the 3D `Panel`
  didn't. `resolveMarker()` now passes `image` through for the `project` /
  `work` tags, `Panel.jsx` renders it as a `.panel-figure` (`16/9`,
  `object-fit: cover`, lazy) between the meta and the body. All six
  `/portfolio/*.jpg` already ship in `public/`. `index` / `contact` carry no
  image, as before. Build green.
  Files: `src/sections.js`, `src/ui/Panel.jsx`, `src/styles.css`.

- [ ] **Vignette is heavy** (`darkness 0.7 / offset 0.3`) — shrinks the felt play
  area. Try `~0.55`.
  Files: `src/scene/Experience.jsx`.

- [ ] **No horizon line** — the sea just fogs into the sky colour. A faint
  gradient band at the fog distance would give the world an edge.
  Files: `src/scene/Water.jsx`, `src/scene/Experience.jsx`.

- [ ] **HUD hint persists forever.** `firstMarkerSeen` is already tracked — fade
  the "Move with WASD…" hint after the first activation.
  Files: `src/scene/ThreeScene.jsx`, `src/store.js`, `src/styles.css`.

- [ ] **`PointOfInterest` pad is nearly invisible** (`opacity 0.08 / 0.16`).
  Decide: an affordance that should teach "stand here", or ambient dressing.
  Files: `src/scene/PointOfInterest.jsx`.
