import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

// A soft arrow that points toward an island when that island is off-screen or
// crowding the frame edge — "there's more that way". Replaces the floating text
// billboards; the fixed signposts on each island carry the names. One per
// island, rendered from Experience.jsx. When the island sits comfortably in
// view the arrow fades to nothing, so it never clutters the middle of the frame.
const SHOW_FROM = 0.74; // |ndc| beyond this → the arrow fades in
const EDGE = 0.9; // how far out toward the frame edge it rides
const REF_DIST = 24; // keeps a roughly constant on-screen size

// Arrowhead pointing along local +x, built once.
const ARROW_GEO = (() => {
  const s = new THREE.Shape();
  s.moveTo(0.62, 0);
  s.lineTo(-0.32, 0.44);
  s.lineTo(-0.1, 0);
  s.lineTo(-0.32, -0.44);
  s.closePath();
  return new THREE.ShapeGeometry(s);
})();

const world = new THREE.Vector3();
const ndc = new THREE.Vector3();
const camDir = new THREE.Vector3();
const toIsland = new THREE.Vector3();

export default function IslandPointer({ position, color = "#cdd9ea" }) {
  const offsetRef = useRef(); // screen-space placement at the edge
  const arrowRef = useRef(); // the head — spun, scaled and faded per frame

  const mat = useMemo(
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

  useFrame((state) => {
    const off = offsetRef.current;
    const arr = arrowRef.current;
    if (!off || !arr) return;

    const cam = state.camera;
    world.set(position[0], position[1], position[2]);
    cam.getWorldDirection(camDir);
    toIsland.subVectors(world, cam.position);
    const behind = camDir.dot(toIsland) <= 0;
    const dist = toIsland.length();

    ndc.copy(world).project(cam);
    let nx = ndc.x;
    let ny = ndc.y;
    if (behind) {
      // Behind the camera the projection flips — treat it as hard off-screen
      // along the (negated) direction so the arrow still makes sense.
      nx = -nx;
      ny = -ny;
      const m = Math.hypot(nx, ny) || 1;
      nx = (nx / m) * 2;
      ny = (ny / m) * 2;
    }

    const reach = Math.max(Math.abs(nx), Math.abs(ny));
    const op = THREE.MathUtils.clamp(
      (reach - SHOW_FROM) / (1 - SHOW_FROM),
      0,
      1,
    );
    arr.material.opacity = op * 0.85;
    arr.visible = op > 0.001;
    if (!arr.visible) return;

    // Unit screen direction toward the island, and the point on the edge box.
    const m = Math.hypot(nx, ny) || 1;
    const ux = nx / m;
    const uy = ny / m;
    const toBox = EDGE / Math.max(Math.abs(ux), Math.abs(uy));
    const tx = ux * toBox;
    const ty = uy * toBox;

    // Offset (from the island's projected point) into Billboard-local units,
    // which are screen-aligned; NDC → world-units at this depth.
    const halfH = dist * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const halfW = halfH * cam.aspect;
    off.position.set((tx - nx) * halfW, (ty - ny) * halfH, 0);

    arr.rotation.z = Math.atan2(uy, ux);
    arr.scale.setScalar(dist / REF_DIST);
  });

  return (
    <Billboard position={position}>
      <group ref={offsetRef}>
        <mesh ref={arrowRef} geometry={ARROW_GEO} material={mat} renderOrder={11} />
      </group>
    </Billboard>
  );
}
