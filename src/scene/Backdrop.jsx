import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Gradient sky dome behind everything. The flat background colour matched the
// fog exactly, so the sea faded into the sky with no horizon — the world read
// as floating in soup. This paints a faint lighter band right at the waterline,
// so the fogged sea meets an edge.
//
// The camera angle is fixed and it follows the player, so the dome rides the
// camera (no parallax on the horizon) and a simple inverted sphere is enough.
// `fog={false}` keeps the gradient from being swallowed by the scene fog.
const RADIUS = 260;

const SKY = new THREE.Color("#0e2136"); // == scene fog, so the upper sky is seamless
const ZENITH = new THREE.Color("#091624"); // a touch darker straight up, for depth
const HORIZON = new THREE.Color("#26476b"); // the faint brighter band at the waterline

export default function Backdrop() {
  const ref = useRef();

  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(RADIUS, 32, 20);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i) / RADIUS; // -1 (nadir) .. 1 (zenith)
      // Narrow triangular band centred just above the horizon.
      const band = Math.max(0, 1 - Math.abs((h - 0.03) / 0.1));
      c.copy(SKY).lerp(HORIZON, band * 0.85);
      // Gentle darkening well above the horizon.
      c.lerp(ZENITH, THREE.MathUtils.smoothstep(h, 0.18, 0.8) * 0.5);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useFrame((state) => {
    if (ref.current) ref.current.position.copy(state.camera.position);
  });

  return (
    <mesh ref={ref} geometry={geometry} renderOrder={-1} frustumCulled={false}>
      <meshBasicMaterial
        vertexColors
        side={THREE.BackSide}
        fog={false}
        depthWrite={false}
      />
    </mesh>
  );
}
