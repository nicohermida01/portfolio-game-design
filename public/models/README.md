# Character model

Put a rigged character here, point `url` at it in `src/character.js`, and flip
`present: true`.

## What the file needs

- A skinned/rigged mesh (has a skeleton).
- At least two animation clips: an idle and a walk. Run/jump are a bonus.
- Format: `.glb` (one binary file) **or** `.gltf` (a `.gltf` + `.bin` +
  `textures/` folder). Both load with `useGLTF`. For `.gltf`, copy the whole
  folder into `public/models/` and keep it intact — the `.gltf` references the
  `.bin` and textures by relative path.
- `.fbx` also works (via `useFBX`) but is heavier. `.obj` / `.mtl` have **no
  skeleton or animation** — not usable for the character. `.blend` needs a
  Blender export first (File → Export → glTF 2.0).

## Quaternius packs

Their Drive downloads ship `.blend`, `.fbx`, `.gltf`, `.obj`. Use the **`.gltf`**
one directly — the animated packs bake `Idle` / `Walk` / `Run` clips into it.
If that `.gltf` turns out to have no animations, use the `.fbx` instead (it
carries the rig + clips) or open the `.blend` and export to `.glb`.

## Free (CC0) sources — quickest first

| Source | Notes |
| --- | --- |
| [Quaternius](https://quaternius.com/) | CC0. "Ultimate Animated Character Pack" / "Animated Characters" — low-poly, already rigged with `Idle` / `Walk` / `Run` clips. Best match for the diorama look. |
| [Kenney](https://kenney.nl/assets?q=character) | CC0. "Blocky Characters", "Mini Characters" — a few are animated. |
| [Mixamo](https://www.mixamo.com/) | Adobe, free with an account (not CC0, but free to use). Pick a character, add the "Walking" + "Idle" animations, export **glTF Binary (.glb)**. Note: Mixamo names the clip `mixamo.com` — set both `idle` and `walk` in `src/character.js` accordingly, or export each clip separately and merge. |

## Optimising later

Compress with [gltf-transform](https://gltf-transform.dev/):

```
npx @gltf-transform/cli optimize character.glb character.glb --texture-compress webp
```

Draco / meshopt compression via `gltfjsx` or `gltf-transform` cuts the file a lot.
