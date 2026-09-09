import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF, useAnimations } from "@react-three/drei";
import { CHARACTER } from "../character.js";
import { useGameStore } from "../store.js";

const TARGET_HEIGHT = 1.4; // roughly the capsule height

if (CHARACTER.present) useGLTF.preload(CHARACTER.url);

const FADE = 0.2; // seconds to crossfade between idle and walk

// Some exporters prefix clip names, e.g. "CharacterArmature|...|Walk".
// Match on the trailing segment so the config can stay as just "Walk".
function resolveAction(actions, name) {
  if (actions[name]) return actions[name];
  const key = Object.keys(actions).find((k) => k.split("|").pop() === name);
  return key ? actions[key] : undefined;
}

export default function Character() {
  const group = useRef();
  const { scene, animations } = useGLTF(CHARACTER.url);
  const { actions } = useAnimations(animations, group);
  const moving = useGameStore((s) => s.moving);

  // GLTF meshes don't cast shadows unless we ask them to. This model is an
  // FBX→glTF export with a bogus `metallicFactor` (0.4) and no real PBR maps —
  // under the dim night lighting a half-metal surface just reflects the near
  // black sky and renders as a dark blob. Force it fully dielectric so the
  // albedo texture actually shows.
  useEffect(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (!m) continue;
        if ("metalness" in m) m.metalness = 0;
        if ("roughness" in m) m.roughness = 1;
        if ("envMapIntensity" in m) m.envMapIntensity = 0;
        m.needsUpdate = true;
      }
    });
  }, [scene]);

  // Measure the model and suggest the scale that fits the capsule.
  useEffect(() => {
    const size = new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
    console.info(
      `[Character] native size ≈ ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}. ` +
        `For a ~${TARGET_HEIGHT}u character set CHARACTER.scale ≈ ${(TARGET_HEIGHT / size.y).toFixed(3)}`,
    );
  }, [scene]);

  // Log what's in the file so the clip names are easy to configure.
  useEffect(() => {
    const names = Object.keys(actions);
    if (names.length === 0) {
      console.warn(
        "[Character] the model loaded but has NO animation clips. " +
          "You'll need a version that includes an idle + walk animation.",
      );
    } else {
      console.info("[Character] animation clips in the file:", names);
      if (
        !resolveAction(actions, CHARACTER.clips.idle) ||
        !resolveAction(actions, CHARACTER.clips.walk)
      ) {
        console.warn(
          "[Character] CHARACTER.clips in src/character.js don't match those names — update them.",
        );
      }
    }
  }, [actions]);

  // Crossfade to the clip that matches the movement state.
  useEffect(() => {
    const next = resolveAction(
      actions,
      moving ? CHARACTER.clips.walk : CHARACTER.clips.idle,
    );
    if (!next) return;
    next.reset().fadeIn(FADE).play();
    return () => next.fadeOut(FADE);
  }, [moving, actions]);

  return (
    <group ref={group} position={[0, CHARACTER.yOffset, 0]} scale={CHARACTER.scale}>
      <primitive object={scene} />
    </group>
  );
}
