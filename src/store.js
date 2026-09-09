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

  // The marker the player is standing in, or null on open ground.
  activeMarker: null,
  // A marker the player explicitly closed (Esc / the panel's ×). Suppressed
  // until they leave its radius, so the panel doesn't reopen next frame while
  // they're still standing on the sign.
  dismissedMarkerId: null,
  setActiveMarker: (marker) =>
    set((state) => {
      const id = marker?.id ?? null;
      if (id && id === state.dismissedMarkerId) {
        return state.activeMarker ? { activeMarker: null } : state;
      }
      const patch = {};
      if (state.dismissedMarkerId && id !== state.dismissedMarkerId) {
        patch.dismissedMarkerId = null; // walked off it (or onto another)
      }
      if ((state.activeMarker?.id ?? null) !== id) {
        patch.activeMarker = marker;
      }
      return Object.keys(patch).length ? patch : state;
    }),
  dismissActiveMarker: () =>
    set((state) =>
      state.activeMarker
        ? { dismissedMarkerId: state.activeMarker.id, activeMarker: null }
        : state,
    ),

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
