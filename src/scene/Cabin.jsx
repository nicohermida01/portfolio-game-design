import { useMemo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { groundHeight } from "../terrain/heightfield.js";
import { FACING_YAW } from "../sections.js";

const LOG = "#9c6b43";
const LOG_DARK = "#7a4a2c";
const ROOF = "#5a3a24";
const DOOR = "#4a2f1d";

// Low-poly log cabin, same faceted look as the trees and rocks. `position` is
// world [x, 0, z] (height sampled from the terrain); it always faces the fixed
// camera (door toward the viewer), and `scale` nudges the size so a cluster
// doesn't look stamped.
export default function Cabin({ position, scale = 1 }) {
  const [x, , z] = position;
  const y = useMemo(() => groundHeight(x, z), [x, z]);

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[x, y, z]}
      rotation={[0, FACING_YAW, 0]}
    >
      {/* Solid footprint — a touch tighter than the visible walls. */}
      <CuboidCollider
        args={[1.15 * scale, 1 * scale, 0.95 * scale]}
        position={[0, 1 * scale, 0]}
      />

      <group scale={scale}>
        {/* walls */}
        <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
          <boxGeometry args={[2.2, 1.4, 1.8]} />
          <meshStandardMaterial color={LOG} flatShading roughness={1} />
        </mesh>

        {/* corner-log band, poking past the walls on the gable ends */}
        <mesh castShadow position={[0, 0.62, 0]}>
          <boxGeometry args={[2.5, 0.9, 0.16]} />
          <meshStandardMaterial color={LOG_DARK} flatShading roughness={1} />
        </mesh>

        {/* upper block filling the roof cavity so the gables aren't hollow */}
        <mesh castShadow position={[0, 1.6, 0]}>
          <boxGeometry args={[1.9, 0.7, 1.55]} />
          <meshStandardMaterial color={LOG} flatShading roughness={1} />
        </mesh>

        {/* gable roof: two tilted slabs meeting at a ridge */}
        <group position={[0, 1.85, 0]}>
          <mesh castShadow position={[0, 0.28, -0.52]} rotation-x={-Math.PI / 5}>
            <boxGeometry args={[2.7, 0.12, 1.55]} />
            <meshStandardMaterial color={ROOF} flatShading roughness={1} />
          </mesh>
          <mesh castShadow position={[0, 0.28, 0.52]} rotation-x={Math.PI / 5}>
            <boxGeometry args={[2.7, 0.12, 1.55]} />
            <meshStandardMaterial color={ROOF} flatShading roughness={1} />
          </mesh>
        </group>

        {/* door */}
        <mesh position={[0, 0.45, 0.92]}>
          <boxGeometry args={[0.55, 0.9, 0.08]} />
          <meshStandardMaterial color={DOOR} flatShading roughness={1} />
        </mesh>
      </group>
    </RigidBody>
  );
}
