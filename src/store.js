import { create } from "zustand";

// Global state that lives OUTSIDE the Three.js tree.
export const useGameStore = create((set) => ({
  // Which experience is on screen. "page" is the default so the first load is
  // the fast, fully accessible portfolio; "3d" lazy-loads the game.
  mode: "page", // "page" | "3d"
  setMode: (mode) => set((state) => (state.mode === mode ? state : { mode })),

  // The marker the player is standing in, or null on open ground.
  activeMarker: null,
  setActiveMarker: (marker) =>
    set((state) =>
      state.activeMarker?.id === marker?.id
        ? state
        : { activeMarker: marker },
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
}));
