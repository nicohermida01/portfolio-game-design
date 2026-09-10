import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { groundHeight } from "../terrain/heightfield.js";
import { resolveMarker } from "../sections.js";
import { useGameStore } from "../store.js";
import Signpost from "./Signpost.jsx";

export default function PointOfInterest({ marker }) {
  const discRef = useRef();
  const ringRef = useRef();
  // Highlight the sign while the player is within range (prompt showing or panel
  // open) — subscribe to just the boolean so this only re-renders on the flip.
  const isActive = useGameStore((s) => s.nearbyMarker?.id === marker.id);

  // Drop the ground pad onto the terrain surface (same height function the
  // player, props and signs use).
  const [x, , z] = marker.position;
  const position = useMemo(() => [x, groundHeight(x, z), z], [x, z]);

  // What the sign board reads. Standalone points carry a short `label`
  // ("Index", "Contact"); zone markers fall back to the content title.
  const signLabel = marker.label ?? resolveMarker(marker.id).title;

  // A calm breathing pad — filled disc + thin rim, no spin. Idle it reads as a
  // quiet "stand here" spot (the sign says what, the pad says where); once
  // you're close enough to activate it the rim firms up and it swells a touch.
  useFrame((state) => {
    const pulse = (Math.sin(state.clock.elapsedTime * 1.8) + 1) * 0.5; // 0..1
    if (discRef.current) {
      discRef.current.material.opacity =
        (isActive ? 0.24 : 0.13) + pulse * (isActive ? 0.07 : 0.05);
    }
    if (ringRef.current) {
      ringRef.current.material.opacity = isActive
        ? 0.58 + pulse * 0.12
        : 0.3 + pulse * 0.06;
      ringRef.current.scale.setScalar(isActive ? 1 + pulse * 0.03 : 1);
    }
  });

  // Zone markers use their zone's tint; standalone points a soft lavender.
  // Active just warms it — no loud yellow competing with the campfire.
  const padColor = isActive ? "#ffdf9e" : (marker.color ?? "#7f86c8");

  return (
    <>
      {/* The marker itself is a wooden sign. */}
      <Signpost position={marker.position} label={signLabel} highlight={isActive} />

      {/* Ground pad — the "walk up here" affordance. Sat a little proud of the
          grass so the plateau's gentle noise doesn't bury the near edge. */}
      <group position={position}>
        <mesh ref={discRef} rotation-x={-Math.PI / 2} position={[0, 0.09, 0]}>
          <circleGeometry args={[1.16, 48]} />
          <meshBasicMaterial
            color={padColor}
            transparent
            depthWrite={false}
            opacity={0}
          />
        </mesh>
        <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, 0.1, 0]}>
          <ringGeometry args={[1.08, 1.18, 48]} />
          <meshBasicMaterial
            color={padColor}
            transparent
            depthWrite={false}
            opacity={0}
          />
        </mesh>
      </group>
    </>
  );
}
