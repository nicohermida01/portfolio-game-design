import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { groundHeight } from "../terrain/heightfield.js";
import { FACING_YAW } from "../sections.js";

// The camera also sits ~45° above the ground, so tip the board back a touch to
// present its face upward toward it.
const BOARD_PITCH = -0.32;

const POST = "#7a4a2c";
const BOARD = "#8a5a3c";
const BOARD_HI = "#c9a15f";
const BRACE = "#5f3a22";

// A small low-poly wooden sign. `position` is world [x, 0, z]; it samples the
// terrain height itself so it sits flush on the ground. `label` is painted on
// the board so each marker is legible without walking up to it.
export default function Signpost({ position, label, highlight = false }) {
  const [x, , z] = position;
  const y = useMemo(() => groundHeight(x, z), [x, z]);

  return (
    <group position={[x, y, z]} rotation-y={FACING_YAW}>
      {/* post */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[0.14, 1.2, 0.14]} />
        <meshStandardMaterial color={POST} flatShading roughness={1} />
      </mesh>

      {/* diagonal brace under the board */}
      <mesh castShadow position={[0.16, 0.82, 0]} rotation-z={-Math.PI / 4}>
        <boxGeometry args={[0.09, 0.42, 0.09]} />
        <meshStandardMaterial color={BRACE} flatShading roughness={1} />
      </mesh>

      {/* board — tilted back to face the raised camera, with the marker name
          painted on its face so it reads from across the archipelago */}
      <group position={[0, 1.06, 0.06]} rotation-x={BOARD_PITCH}>
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.5, 0.08]} />
          <meshStandardMaterial
            color={highlight ? BOARD_HI : BOARD}
            emissive={highlight ? "#3a2a12" : "#000000"}
            emissiveIntensity={highlight ? 1.4 : 0}
            flatShading
            roughness={1}
          />
        </mesh>
        {label && (
          <Text
            position={[0, 0, 0.05]}
            fontSize={0.13}
            maxWidth={0.96}
            lineHeight={1.05}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color={highlight ? "#fff5e0" : "#f2e2c0"}
            outlineWidth={0.006}
            outlineColor="#2a1809"
          >
            {label.toUpperCase()}
          </Text>
        )}
      </group>

      {/* Lantern near the post top. No real light here — signs cluster inside a
          zone, so 8 point lights just muddied the scene; the emissive + bloom
          carry the glow and the per-island fill light (Experience.jsx) does the
          ambient warmth. */}
      <mesh castShadow position={[0.13, 1.18, 0]}>
        <boxGeometry args={[0.16, 0.22, 0.16]} />
        <meshStandardMaterial
          color="#ffcf87"
          emissive="#ffb347"
          emissiveIntensity={2.4}
          flatShading
          roughness={1}
        />
      </mesh>
    </group>
  );
}
