import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

// A small in-world wayfinding label over an island. Faces the fixed camera and
// fades by camera distance: readable when you're on the island, clearest a few
// islands away, gone past the fog. It draws on top of scene geometry (depth
// test off) so trees and cabins can't clip letters off it, and sits on a dim
// plate so it stays legible over both water and lit ground.
const NEAR = 12; // basically standing on this island
const CLEAR = 26; // a couple of islands away -> fully readable
const FAR = 54; // fog swallows it past here
const FONT = 0.5;
const NEAR_OP = 0.42; // never a full ghost, even on the island you're standing on
const CLEAR_OP = 0.95;

const worldPos = new THREE.Vector3();

export default function ZoneLabel({ position, label }) {
  const textRef = useRef();
  const plateRef = useRef();

  // Cheap plate sizing: we own the font size and the label set, so a
  // per-character estimate is stable enough — no glyph measuring needed.
  const plateSize = useMemo(
    () => [label.length * FONT * 0.72 + 0.8, FONT + 0.36],
    [label],
  );

  useFrame((state) => {
    const t = textRef.current;
    if (!t) return;

    // Paint over geometry so nothing can occlude the letters.
    t.material.depthTest = false;
    t.material.depthWrite = false;

    t.getWorldPosition(worldPos);
    const d = state.camera.position.distanceTo(worldPos);

    let o;
    if (d < NEAR) o = NEAR_OP;
    else if (d < CLEAR)
      o = THREE.MathUtils.lerp(NEAR_OP, CLEAR_OP, (d - NEAR) / (CLEAR - NEAR));
    else o = CLEAR_OP * (1 - THREE.MathUtils.smoothstep(d, CLEAR, FAR));

    t.fillOpacity = o;
    t.outlineOpacity = o;
    if (plateRef.current) plateRef.current.material.opacity = o * 0.5;
  });

  return (
    <Billboard position={position}>
      <mesh ref={plateRef} position={[0, 0, -0.02]} renderOrder={9}>
        <planeGeometry args={plateSize} />
        <meshBasicMaterial
          color="#0b1420"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <Text
        ref={textRef}
        renderOrder={10}
        fontSize={FONT}
        color="#eef3ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#0b1420"
        outlineBlur={0.12}
        fillOpacity={0}
        outlineOpacity={0}
      >
        {label.toUpperCase()}
      </Text>
    </Billboard>
  );
}
