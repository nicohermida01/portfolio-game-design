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

- [ ] **Everything falls off into pure black.** Bridges lead to islands you
  can't see at all. Raise fog `far`, add a little fill light on the far
  islands, or make the water read so there's a horizon instead of void.
  Files: `src/scene/Experience.jsx` (fog / lights), `src/scene/Water.jsx`.

- [ ] **Water is an empty black plane.** Islands look like they float in space,
  not an archipelago. Give the sea a readable tint, some moon specular, and a
  subtle wobble (vertex or scrolling normal). Today `Water.jsx` contributes
  nothing.
  Files: `src/scene/Water.jsx`.

## Medium impact

- [ ] **Content panel covers the scene.** The right-side `Panel` card is large
  and opaque — it hides a bridge and part of an island. Make it narrower or
  reposition (e.g. bottom-left, or auto-flip away from the marker).
  Files: `src/ui/Panel.jsx`, `src/ui/page.css` (or panel styles).

- [ ] **Directional shadow frustum too small for the new layout.** It's ±22 but
  islands now reach ±20+, so far islands get no shadows and props/cabins look
  pasted on. Widen `shadow-camera-*`, or add cheap fake contact shadows
  (dark radial-gradient plane under trees/cabins).
  Files: `src/scene/Experience.jsx`, maybe `src/scene/Props.jsx` /
  `src/scene/Cabin.jsx`.

- [ ] **Re-check building seating after the heightfield change.** `SHORE_BOTTOM`
  moved from -1.4 to -0.6; some cabins on island edges may now clip into or
  float over the bank. Verify `groundHeight` seating for cabins/signposts near
  the rim.
  Files: `src/scene/Cabin.jsx`, `src/scene/Signpost.jsx`,
  `src/terrain/heightfield.js`.

## Low impact

- [ ] **Water rings still read as a "radar ping".** Calmer now but still gamey.
  Drop to 1 ring per island, or lower opacity / frequency further.
  Files: `src/scene/WaterRings.jsx`.

- [ ] **Campfire embers form a thin vertical line** — looks like a string, not
  sparks. Widen the spread, vary particle size, shorten lifetime.
  Files: `src/scene/Campfire.jsx`.

- [ ] **Activation ring is a big bright yellow.** Clashes with the campfire.
  Make it subtler and/or tint it to the marker's zone color.
  Files: `src/scene/PointOfInterest.jsx`.

- [ ] **Grass is too saturated for a night scene.** Desaturate the base terrain
  green a touch, or cool the ambient.
  Files: `src/terrain/heightfield.js` (`BASE_COLOR`), `src/scene/Experience.jsx`.

- [ ] **HUD hint text** ("Move with W A S D — walk up to a marker") is low
  contrast and clips at the bottom-left edge.
  Files: `src/scene/ThreeScene.jsx` / HUD styles.
