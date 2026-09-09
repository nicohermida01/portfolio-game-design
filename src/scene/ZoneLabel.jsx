import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

// A small in-world wayfinding label over an island. Faces the fixed camera and
// fades by camera distance: barely there when you're on the island (the DOM
// ZoneBanner covers that moment), clearest a few islands away, gone past the
// fog. Keeps it from fighting the scene the way a fixed-size billboard does.
const NEAR = 13; // basically standing on this island -> dim
const CLEAR = 26; // a couple of islands away -> readable
const FAR = 54; // fog swallows it past here

const worldPos = new THREE.Vector3();

export default function ZoneLabel({ position, label }) {
  const textRef = useRef();

  useFrame((state) => {
    const t = textRef.current;
    if (!t) return;
    t.getWorldPosition(worldPos);
    const d = state.camera.position.distanceTo(worldPos);

    let o;
    if (d < NEAR) o = 0.12;
    else if (d < CLEAR)
      o = THREE.MathUtils.lerp(0.12, 0.75, (d - NEAR) / (CLEAR - NEAR));
    else o = 0.75 * (1 - THREE.MathUtils.smoothstep(d, CLEAR, FAR));

    t.fillOpacity = o;
    t.outlineOpacity = o;
  });

  return (
    <Billboard position={position}>
      <Text
        ref={textRef}
        fontSize={0.5}
        color="#dfe8ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#0b1420"
        fillOpacity={0}
        outlineOpacity={0}
      >
        {label.toUpperCase()}
      </Text>
    </Billboard>
  );
}
