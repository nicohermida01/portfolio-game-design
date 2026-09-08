// --- Character model config -------------------------------------------------
// The player collider (a capsule in Player.jsx) is separate from the model you
// SEE. This file is the seam: drop in a model, tweak these numbers, done.
//
// To use a real character:
//   1. Get a rigged model with at least an idle and a walk clip.
//      .glb (one file) or .gltf (a .gltf + .bin + textures/ folder) both work
//      with useGLTF — for .gltf just keep the whole folder together and point
//      `url` at the .gltf file. See public/models/README.md for CC0 sources.
//   2. Copy it under  public/models/  (e.g. public/models/adventurer/Adventurer.gltf)
//   3. Point `url` at it and set `present: true` below.
//   4. Run once and check the console — Character.jsx logs the clip names it
//      found. Put the right ones in `clips`.
//   5. Adjust `scale` and `yOffset` so the feet sit on the ground and the
//      height roughly matches the ~1.4u capsule.

export const CHARACTER = {
  present: true,
  url: "/models/Steve.glb", // e.g. "/models/adventurer/Adventurer.gltf"
  scale: 0.553,
  yOffset: -0.7, // capsule half-height: moves the model's feet to its base
  clips: { idle: "Idle", walk: "Walk" },
};
