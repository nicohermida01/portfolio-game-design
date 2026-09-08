import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { groundHeight } from "../terrain/heightfield.js";
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

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.6;
    }
  });

  // Zone markers ring in their zone's tint; standalone points use the default.
  const ringColor = isActive ? "#ffd166" : (marker.color ?? "#8a8aff");

  return (
    <>
      {/* The marker itself is a wooden sign. */}
      <Signpost position={marker.position} highlight={isActive} />

      {/* Spinning ground ring — the "walk up here" affordance. */}
      <group position={position}>
        <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
          <ringGeometry args={[0.9, 1.1, 32]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={isActive ? 0.95 : 0.5}
          />
        </mesh>
      </group>
    </>
  );
}
