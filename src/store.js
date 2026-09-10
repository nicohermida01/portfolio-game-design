import { create } from "zustand";

// localStorage here is a nice-to-have (remember the player has been onboarded).
// It can throw or be unavailable (private mode, blocked storage) — never let
// that break the store.
const FIRST_MARKER_KEY = "pgd:first-marker-seen";
function readFlag(key) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
function writeFlag(key) {
  try {
    localStorage.setItem(key, "1");
  } catch {
    /* no persistence available — fine */
  }
}

// Global state that lives OUTSIDE the Three.js tree.
export const useGameStore = create((set) => ({
  // Which experience is on screen. "page" is the default so the first load is
  // the fast, fully accessible portfolio; "3d" lazy-loads the game.
  mode: "page", // "page" | "3d"
  setMode: (mode) => set((state) => (state.mode === mode ? state : { mode })),

  // The signpost within interaction range — drives the "press E" prompt and the
  // sign's own highlight. Set every frame by Player.jsx from proximity.
  nearbyMarker: null,
  // The signpost whose content panel is open. Panels no longer auto-open on
  // proximity — only interactWithNearby() opens one, so you can walk the world
  // without dodging panels (matters most on a small screen).
  activeMarker: null,
  setNearbyMarker: (marker) =>
    set((state) => {
      const id = marker?.id ?? null;
      if ((state.nearbyMarker?.id ?? null) === id) return state;
      const patch = { nearbyMarker: marker };
      // Walked away from the sign whose panel was open — close it.
      if (state.activeMarker && state.activeMarker.id !== id) {
        patch.activeMarker = null;
      }
      return patch;
    }),
  // E / tap: open the nearby sign's panel, or close it if it's already open.
  interactWithNearby: () =>
    set((state) => {
      if (!state.nearbyMarker) return state;
      return state.activeMarker?.id === state.nearbyMarker.id
        ? { activeMarker: null }
        : { activeMarker: state.nearbyMarker };
    }),
  dismissActiveMarker: () =>
    set((state) => (state.activeMarker ? { activeMarker: null } : state)),

  // The zone the player is currently inside, or null. Drives the region banner.
  activeZone: null,
  setActiveZone: (zone) =>
    set((state) =>
      state.activeZone?.id === zone?.id ? state : { activeZone: zone },
    ),

  // Whether the player is walking right now. Drives the character animation.
  moving: false,
  setMoving: (value) =>
    set((state) => (state.moving === value ? state : { moving: value })),

  // Analog move vector from the on-screen joystick, each axis in [-1, 1].
  // Player.jsx reads this via getState() in the frame loop (no re-renders).
  input: { x: 0, z: 0 },
  setInput: (x, z) => set({ input: { x, z } }),

  // Onboarding: has the player reached their first signpost yet? Persisted, so
  // the spawn guide arrow only ever shows to a genuinely new visitor.
  firstMarkerSeen: readFlag(FIRST_MARKER_KEY),
  markFirstMarkerSeen: () => {
    writeFlag(FIRST_MARKER_KEY);
    set((state) => (state.firstMarkerSeen ? state : { firstMarkerSeen: true }));
  },
}));
