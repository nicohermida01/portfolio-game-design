import { useMemo } from "react";
import { RigidBody } from "@react-three/rapier";
import { createIslandGeometry } from "../terrain/heightfield.js";
import { ISLANDS, ZONES } from "../sections.js";

export default function Terrain() {
  // One displaced disc per island, built once. ZONES bake their colour patch
  // into the vertex-colour attribute.
  const islands = useMemo(
    () => ISLANDS.map((isl) => ({ id: isl.id, geometry: createIslandGeometry(isl, ZONES) })),
    [],
  );
  return (
    <>
      {islands.map(({ id, geometry }) => (
        // One static trimesh body per island — disjoint, so no need for a
        // single global collider.
        <RigidBody key={id} type="fixed" colliders="trimesh" friction={1}>
          <mesh geometry={geometry} receiveShadow castShadow>
            <meshStandardMaterial vertexColors flatShading roughness={1} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}
