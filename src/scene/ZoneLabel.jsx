import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

// A far-range wayfinding label over an island. Faces the fixed camera and is
// driven by camera distance:
//   - on the island you're standing on  -> hidden (the readable signpost + the
//     DOM banner own close range; this used to double up with them)
//   - a couple of islands away           -> fully readable
//   - past the fog                       -> gone
// It also edge-clamps: when its island is off-frame the label slides to the
// screen edge as a waypoint instead of clipping mid-word ("CONTACT" -> "NTACT").
// Draws on top of scene geometry (depth test off) so trees/cabins can't cut
// letters, and sits on a dim plate so it stays legible over water or lit ground.
const NEAR = 10; // basically standing on this island -> fully faded
const CLEAR = 22; // a couple of islands away -> fully readable
const FAR = 58; // fog swallows it past here
const FONT = 0.5;
const NEAR_OP = 0.0; // hand off to the signpost at close range
const CLEAR_OP = 0.95;
const EDGE = 0.86; // NDC bound the label is kept inside

const worldPos = new THREE.Vector3();
const camDir = new THREE.Vector3();
const toLabel = new THREE.Vector3();
const ndc = new THREE.Vector3();

export default function ZoneLabel({ position, label }) {
  const textRef = useRef();
  const plateRef = useRef();
  const offsetRef = useRef(); // screen-space nudge that keeps the label on-frame

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

    const cam = state.camera;
    t.getWorldPosition(worldPos);
    cam.getWorldDirection(camDir);
    toLabel.subVectors(worldPos, cam.position);
    const behind = camDir.dot(toLabel) <= 0;
    const d = cam.position.distanceTo(worldPos);

    let o;
    if (behind) o = 0;
    else if (d < NEAR) o = NEAR_OP;
    else if (d < CLEAR)
      o = THREE.MathUtils.lerp(NEAR_OP, CLEAR_OP, (d - NEAR) / (CLEAR - NEAR));
    else o = CLEAR_OP * (1 - THREE.MathUtils.smoothstep(d, CLEAR, FAR));

    t.fillOpacity = o;
    t.outlineOpacity = o;
    if (plateRef.current) plateRef.current.material.opacity = o * 0.5;

    // Edge clamp. `<Billboard>` keeps this group screen-aligned (local +x = screen
    // right, +y = up), so we can convert the NDC overshoot straight into a local
    // offset using the frustum size at the label's depth.
    let ox = 0;
    let oy = 0;
    if (!behind && o > 0.001) {
      ndc.copy(worldPos).project(cam);
      const halfH = d * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
      const halfW = halfH * cam.aspect;
      if (ndc.x > EDGE) ox = -(ndc.x - EDGE) * halfW;
      else if (ndc.x < -EDGE) ox = -(ndc.x + EDGE) * halfW;
      if (ndc.y > EDGE) oy = -(ndc.y - EDGE) * halfH;
      else if (ndc.y < -EDGE) oy = -(ndc.y + EDGE) * halfH;
    }
    if (offsetRef.current) offsetRef.current.position.set(ox, oy, 0);
  });

  return (
    <Billboard position={position}>
      <group ref={offsetRef}>
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
      </group>
    </Billboard>
  );
}
