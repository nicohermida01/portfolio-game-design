import { useMemo } from "react";
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
// terrain height itself so it sits flush on the ground.
export default function Signpost({ position, highlight = false }) {
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

      {/* board — tilted back to face the raised camera */}
      <mesh castShadow position={[0, 1.06, 0.06]} rotation-x={BOARD_PITCH}>
        <boxGeometry args={[1.1, 0.5, 0.08]} />
        <meshStandardMaterial
          color={highlight ? BOARD_HI : BOARD}
          emissive={highlight ? "#3a2a12" : "#000000"}
          emissiveIntensity={highlight ? 0.6 : 0}
          flatShading
          roughness={1}
        />
      </mesh>
    </group>
  );
}
