import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// A soft arrowhead that points toward an island once that island crowds or
// leaves the frame edge — "there's more that way". Replaces the floating text
// billboards; the fixed on-island signposts carry the names. One per island,
// rendered from Experience.jsx. Silent while the island sits in view, so the
// middle of the frame stays clear.
//
// The arrow is slaved to the camera each frame (world transform set from the
// camera's), so it's genuinely screen-locked and always rides the edge — an
// earlier world-anchored version skewed toward the middle for far off-axis
// islands.
const SHOW_FROM = 0.72; // |ndc| past this → the arrow fades in
const EDGE = 0.88; // how close to the true frame edge it rides
const DEPTH = 10; // how far in front of the camera it's placed
const SIZE = 0.42; // constant on-screen scale

// Arrowhead pointing along local +x, built once and shared.
const ARROW_GEO = (() => {
  const s = new THREE.Shape();
  s.moveTo(0.55, 0);
  s.lineTo(-0.28, 0.36);
  s.lineTo(-0.08, 0);
  s.lineTo(-0.28, -0.36);
  s.closePath();
  return new THREE.ShapeGeometry(s);
})();

const world = new THREE.Vector3();
const ndc = new THREE.Vector3();
const camDir = new THREE.Vector3();
const toIsland = new THREE.Vector3();
const offset = new THREE.Vector3();

export default function IslandPointer({ position, color = "#cdd9ea" }) {
  const groupRef = useRef();
  const { camera } = useThree();

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
      }),
    [color],
  );

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;

    world.set(position[0], position[1], position[2]);
    camera.getWorldDirection(camDir);
    toIsland.subVectors(world, camera.position);
    const behind = camDir.dot(toIsland) <= 0;

    ndc.copy(world).project(camera);
    let nx = ndc.x;
    let ny = ndc.y;
    if (behind) {
      nx = -nx;
      ny = -ny;
    }

    const reach = behind ? 2 : Math.max(Math.abs(nx), Math.abs(ny));
    const op = THREE.MathUtils.clamp(
      (reach - SHOW_FROM) / (1 - SHOW_FROM),
      0,
      1,
    );
    material.opacity = op * 0.8;
    g.visible = op > 0.001;
    if (!g.visible) return;

    // Unit screen direction to the island → a point on the edge box.
    const m = Math.hypot(nx, ny) || 1;
    const ux = nx / m;
    const uy = ny / m;
    const toBox = EDGE / Math.max(Math.abs(ux), Math.abs(uy));

    // Camera-local placement at fixed DEPTH, then lifted to world space by the
    // camera's transform — no reparenting, so R3F stays happy.
    const halfH = DEPTH * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const halfW = halfH * camera.aspect;
    offset
      .set(ux * toBox * halfW, uy * toBox * halfH, -DEPTH)
      .applyQuaternion(camera.quaternion)
      .add(camera.position);

    g.position.copy(offset);
    g.quaternion.copy(camera.quaternion);
    g.rotateZ(Math.atan2(uy, ux));
    g.scale.setScalar(SIZE);
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={ARROW_GEO} material={material} renderOrder={12} />
    </group>
  );
}
