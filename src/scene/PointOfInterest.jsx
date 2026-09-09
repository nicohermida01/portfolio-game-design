import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { groundHeight } from "../terrain/heightfield.js";
import { resolveMarker } from "../sections.js";
import { useGameStore } from "../store.js";
import Signpost from "./Signpost.jsx";

export default function PointOfInterest({ marker }) {
  const ringRef = useRef();
  // Subscribe to just the boolean, so this only re-renders when its own
  // active state flips.
  const isActive = useGameStore((s) => s.activeMarker?.id === marker.id);

  // Drop the ground ring onto the terrain surface (same height function the
  // player, props and signs use).
  const [x, , z] = marker.position;
  const position = useMemo(() => [x, groundHeight(x, z), z], [x, z]);

  // What the sign board reads. Standalone points carry a short `label`
  // ("Index", "Contact"); zone markers fall back to the content title.
  const signLabel = marker.label ?? resolveMarker(marker.id).title;

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.35;
    }
  });

  // Zone markers ring in their zone's tint; standalone points use a soft
  // lavender. Active just warms it slightly — no loud yellow competing with
  // the campfire.
  const ringColor = isActive ? "#ffdf9e" : (marker.color ?? "#7f86c8");

  return (
    <>
      {/* The marker itself is a wooden sign. */}
      <Signpost position={marker.position} label={signLabel} highlight={isActive} />

      {/* Spinning ground ring — the "walk up here" affordance. */}
      <group position={position}>
        <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.02, 1.14, 48]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            depthWrite={false}
            opacity={isActive ? 0.55 : 0.24}
          />
        </mesh>
      </group>
    </>
  );
}
