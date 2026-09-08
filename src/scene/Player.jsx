import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import * as THREE from "three";
import { MARKERS, ZONES, ACTIVATION_RADIUS } from "../sections.js";
import { CHARACTER } from "../character.js";
import { useGameStore } from "../store.js";
import Character from "./Character.jsx";
import ModelErrorBoundary from "./ModelErrorBoundary.jsx";

const SPEED = 6; // world units per second
const TURN_SMOOTHING = 0.0004; // smaller = snappier turn toward movement
const CAMERA_OFFSET = new THREE.Vector3(10, 10, 10);

// Camera-relative ground basis, derived once from the fixed iso camera offset.
// FWD points "into the screen" (away from the camera along the ground), RIGHT
// is screen-right. Input is expressed in this basis so W is always "up on
// screen" regardless of the 45° camera angle — not world -Z.
const FWD = new THREE.Vector3(-CAMERA_OFFSET.x, 0, -CAMERA_OFFSET.z).normalize();
const RIGHT = new THREE.Vector3(-FWD.z, 0, FWD.x); // FWD rotated -90° about Y

// Reused scratch objects so the frame loop allocates nothing.
const move = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();

export default function Player() {
  const bodyRef = useRef();
  const visualRef = useRef(); // the model; we yaw this, the collider stays put
  const [, getKeys] = useKeyboardControls();
  const setActiveMarker = useGameStore((s) => s.setActiveMarker);
  const setActiveZone = useGameStore((s) => s.setActiveZone);
  const setMoving = useGameStore((s) => s.setMoving);

  useFrame((state, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const v = body.linvel();

    // 1. Input -> desired horizontal direction, in camera space: `strafe` is
    //    screen-left/right, `ahead` is screen-up/down. Keyboard first; if idle,
    //    fall back to the on-screen joystick vector (analog: magnitude 0..1).
    const { forward, backward, left, right } = getKeys();
    let strafe = (right ? 1 : 0) - (left ? 1 : 0);
    let ahead = (forward ? 1 : 0) - (backward ? 1 : 0);
    if (strafe === 0 && ahead === 0) {
      const touch = useGameStore.getState().input;
      strafe = touch.x;
      ahead = -touch.z; // joystick: screen-down is +z, same as "backward"
    }
    // Project the 2D intent onto the ground basis so "up on screen" == FWD.
    move.set(
      RIGHT.x * strafe + FWD.x * ahead,
      0,
      RIGHT.z * strafe + FWD.z * ahead,
    );

    // 2. Drive velocity. Scale by the input magnitude (clamped) so the
    //    joystick gives analog speed and the keyboard gives full speed; then
    //    LEAVE Y to gravity + the ground collider.
    const throttle = Math.min(move.length(), 1);
    const isMoving = throttle > 0.05;
    if (isMoving) move.normalize().multiplyScalar(SPEED * throttle);
    body.setLinvel(
      { x: isMoving ? move.x : 0, y: v.y, z: isMoving ? move.z : 0 },
      true,
    );
    setMoving(isMoving);

    // 3. Turn the model toward the way it's walking (shortest-path angle lerp).
    if (isMoving && visualRef.current) {
      const targetYaw = Math.atan2(move.x, move.z);
      const g = visualRef.current;
      let diff = targetYaw - g.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // wrap to [-PI, PI]
      g.rotation.y += diff * (1 - Math.pow(TURN_SMOOTHING, delta));
    }

    // 4. Physics owns the position — read it back for camera + proximity.
    const pos = body.translation();

    cameraTarget.set(pos.x, pos.y, pos.z).add(CAMERA_OFFSET);
    state.camera.position.lerp(cameraTarget, 1 - Math.pow(0.001, delta));
    state.camera.lookAt(pos.x, pos.y, pos.z);

    // 5. Proximity: nearest marker within the radius opens its panel, else null.
    let nearest = null;
    let nearestDist = ACTIVATION_RADIUS;
    for (const marker of MARKERS) {
      const dx = pos.x - marker.position[0];
      const dz = pos.z - marker.position[2];
      const dist = Math.hypot(dx, dz);
      if (dist < nearestDist) {
        nearest = marker;
        nearestDist = dist;
      }
    }
    setActiveMarker(nearest);

    // 6. Zone: whichever zone disc the player is standing in drives the banner.
    let zone = null;
    for (const z of ZONES) {
      const dx = pos.x - z.center[0];
      const dz = pos.z - z.center[1];
      if (Math.hypot(dx, dz) < z.radius) {
        zone = z;
        break;
      }
    }
    setActiveZone(zone);
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      mass={1}
      position={[0, 2, 0]}
      enabledRotations={[false, false, false]} // never tip over
      linearDamping={0.4}
      friction={0}
      restitution={0}
    >
      {/* args: [halfHeight, radius]. The collider shape is independent of
          whatever model we draw inside. */}
      <CapsuleCollider args={[0.35, 0.35]} />

      <group ref={visualRef}>
        {CHARACTER.present ? (
          <ModelErrorBoundary fallback={<Placeholder />}>
            <Suspense fallback={<Placeholder />}>
              <Character />
            </Suspense>
          </ModelErrorBoundary>
        ) : (
          <Placeholder />
        )}
      </group>
    </RigidBody>
  );
}

// Stand-in until a GLTF model is dropped in (see src/character.js).
// The little nose points +Z so the "turn toward movement" is visible.
function Placeholder() {
  return (
    <group>
      <mesh castShadow>
        <capsuleGeometry args={[0.35, 0.7, 8, 16]} />
        <meshStandardMaterial color="#f6c453" />
      </mesh>
      <mesh castShadow position={[0, 0.15, 0.34]} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.12, 0.28, 12]} />
        <meshStandardMaterial color="#c9922f" />
      </mesh>
    </group>
  );
}
