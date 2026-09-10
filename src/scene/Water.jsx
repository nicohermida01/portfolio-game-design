import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WATER_LEVEL } from "../terrain/heightfield.js";

// Unlit faceted sea. The night lighting is far too dim to lift a *lit* water
// plane off black (two earlier tries came out as a dark slab), so this is a
// meshBasicMaterial driven purely by vertex colours: every frame the vertices
// ride three crossed sine waves and get repainted from a deep trough blue to a
// bright crest blue, so visible bands roll across the surface. The plane rides
// the camera on X/Z (waves sampled in world space) so its edge is always well
// past the fog far plane — no hard sea edge from any island.
const SIZE = 220;
const SEG = 34;
const AMPL = 0.24; // small throw so crests never poke through the rocky rim

const TROUGH = new THREE.Color("#0c2233");
const CREST = new THREE.Color("#26647e");

export default function Water() {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    g.rotateX(-Math.PI / 2); // lie flat; every vertex Y starts at 0
    const count = g.attributes.position.count;
    g.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3),
    );
    return g;
  }, []);

  useFrame((state) => {
    const mesh = meshRef.current;
    const g = mesh?.geometry;
    if (!g) return;

    // Follow the camera on the ground plane; waves are sampled in world space
    // (local + offset) so crests stay world-locked as the plane moves.
    const ox = state.camera.position.x;
    const oz = state.camera.position.z;
    mesh.position.x = ox;
    mesh.position.z = oz;

    const pos = g.attributes.position;
    const col = g.attributes.color;
    const t = state.clock.elapsedTime;
    const c = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + ox;
      const z = pos.getZ(i) + oz;
      const w =
        Math.sin(x * 0.3 + t * 0.7) * 0.5 +
        Math.sin(z * 0.24 - t * 0.5) * 0.35 +
        Math.sin((x + z) * 0.5 + t * 1.1) * 0.15;
      pos.setY(i, w * AMPL);
      c.copy(TROUGH).lerp(CREST, THREE.MathUtils.clamp(w * 0.5 + 0.5, 0, 1));
      col.setXYZ(i, c.r, c.g, c.b);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, WATER_LEVEL, 0]}>
      <meshBasicMaterial vertexColors />
    </mesh>
  );
}
