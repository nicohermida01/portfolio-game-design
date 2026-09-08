import { useMemo } from "react";
import { RigidBody } from "@react-three/rapier";
import { createTerrainGeometry } from "../terrain/heightfield.js";
import { ZONES } from "../sections.js";

export default function Terrain() {
  // Build the geometry once, not on every render. ZONES bake their colour patch
  // into the vertex-colour attribute.
  const geometry = useMemo(() => createTerrainGeometry(ZONES), []);

  return (
    // A static body. "trimesh" auto-builds a collider that matches the
    // displaced surface, so the player and props rest on the real relief.
    <RigidBody type="fixed" colliders="trimesh" friction={1}>
      <mesh geometry={geometry} receiveShadow castShadow>
        {/* vertexColors carries both the grass and the zone tints; flatShading
            keeps the faceted low-poly look. */}
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </mesh>
    </RigidBody>
  );
}
