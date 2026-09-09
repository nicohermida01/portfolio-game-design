import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { groundHeight } from "../terrain/heightfield.js";

const EMBER_COUNT = 40;
const EMBER_COL = new THREE.Color("#ffb347");

// Central campfire near spawn — the scene's key light. Everything is
// procedural: crossed logs, two additive cones for the flame, a flickering
// point light, and one recycled buffer of ember points.
export default function Campfire() {
  // Fire sits at the world origin; sample the ground once.
  const groundY = useMemo(() => groundHeight(0, 0), []);

  const lightRef = useRef();
  const flameLowRef = useRef();
  const flameHighRef = useRef();
  const embersRef = useRef();

  // Resting brightness — per-frame sine flicker is applied as a % of this.
  const baseIntensity = 14;

  // Ember state: a typed position + colour buffer mutated in place, plus
  // per-particle rise speed, a fixed outward drift angle and a lifetime rate
  // so each spark fans out of the bed and recycles independently.
  const embers = useMemo(() => {
    const positions = new Float32Array(EMBER_COUNT * 3);
    const colors = new Float32Array(EMBER_COUNT * 3);
    const speed = new Float32Array(EMBER_COUNT);
    const angle = new Float32Array(EMBER_COUNT);
    const rate = new Float32Array(EMBER_COUNT);
    const life = new Float32Array(EMBER_COUNT);
    for (let i = 0; i < EMBER_COUNT; i++) {
      const rr = Math.random() * 0.3;
      const aa = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(aa) * rr;
      positions[i * 3 + 1] = 0.1 + Math.random() * 0.25;
      positions[i * 3 + 2] = Math.sin(aa) * rr;
      speed[i] = 0.5 + Math.random() * 0.6;
      angle[i] = Math.random() * Math.PI * 2;
      rate[i] = 0.45 + Math.random() * 0.4; // ~1.3–2.2 s lifetime
      life[i] = Math.random();
    }
    return { positions, colors, speed, angle, rate, life };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Flame: layered sines drive a subtle squash + sway on both cones.
    if (flameLowRef.current) {
      flameLowRef.current.scale.y =
        1 + Math.sin(t * 12) * 0.12 + Math.sin(t * 27) * 0.05;
      flameLowRef.current.scale.x = 1 + Math.sin(t * 9 + 1.7) * 0.08;
      flameLowRef.current.rotation.z = Math.sin(t * 7) * 0.06;
    }
    if (flameHighRef.current) {
      flameHighRef.current.scale.y = 1 + Math.sin(t * 15 + 2.1) * 0.18;
      flameHighRef.current.rotation.z = Math.sin(t * 8 + 0.5) * 0.1;
    }

    // Key light: summed sines give ±15% intensity + a few-cm positional wobble.
    if (lightRef.current) {
      const flick =
        Math.sin(t * 24) * 0.5 + Math.sin(t * 13.3) * 0.3 + Math.sin(t * 41) * 0.2;
      lightRef.current.intensity = baseIntensity * (1 + flick * 0.15);
      lightRef.current.position.x = Math.sin(t * 19) * 0.04;
      lightRef.current.position.z = Math.cos(t * 23) * 0.04;
      lightRef.current.position.y = 1.1 + Math.sin(t * 17) * 0.03;
    }

    // Embers: rise out of the bed, fan outward as they age, fade in fast then
    // out over the back half (additive blend hides the low values). Buffers are
    // mutated in place, never recreated.
    if (embersRef.current) {
      const arr = embersRef.current.geometry.attributes.position.array;
      const col = embersRef.current.geometry.attributes.color.array;
      for (let i = 0; i < EMBER_COUNT; i++) {
        embers.life[i] += delta * embers.rate[i];

        if (embers.life[i] >= 1) {
          const rr = Math.random() * 0.3;
          const aa = Math.random() * Math.PI * 2;
          embers.life[i] = 0;
          embers.speed[i] = 0.5 + Math.random() * 0.6;
          embers.angle[i] = Math.random() * Math.PI * 2;
          embers.rate[i] = 0.45 + Math.random() * 0.4;
          arr[i * 3] = Math.cos(aa) * rr;
          arr[i * 3 + 1] = 0.1 + Math.random() * 0.25;
          arr[i * 3 + 2] = Math.sin(aa) * rr;
        } else {
          const l = embers.life[i];
          const fan = 0.2 + l * 0.55; // outward drift grows with age
          arr[i * 3] +=
            (Math.cos(embers.angle[i]) * fan + Math.sin(t * 4 + i * 1.7) * 0.12) *
            delta;
          arr[i * 3 + 1] += embers.speed[i] * delta;
          arr[i * 3 + 2] +=
            (Math.sin(embers.angle[i]) * fan + Math.cos(t * 3.3 + i * 1.1) * 0.12) *
            delta;
        }

        const l = embers.life[i];
        const f = Math.min(l * 5, 1) * (1 - Math.max(0, (l - 0.5) / 0.5));
        col[i * 3] = EMBER_COL.r * f;
        col[i * 3 + 1] = EMBER_COL.g * f;
        col[i * 3 + 2] = EMBER_COL.b * f;
      }
      embersRef.current.geometry.attributes.position.needsUpdate = true;
      embersRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group position={[0, groundY, 0]}>
      {/* Crossed logs at the base. */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          castShadow
          position={[0, 0.12, 0]}
          rotation={[Math.PI / 2, 0, (i * Math.PI) / 4]}
        >
          <cylinderGeometry args={[0.09, 0.09, 1.3, 6]} />
          <meshStandardMaterial color="#4a2f1d" flatShading roughness={1} />
        </mesh>
      ))}

      {/* Flame: two stacked additive cones, animated above. */}
      <mesh ref={flameLowRef} position={[0, 0.55, 0]}>
        <coneGeometry args={[0.32, 1.0, 8]} />
        <meshBasicMaterial
          color="#ff7b29"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={flameHighRef} position={[0, 0.85, 0]}>
        <coneGeometry args={[0.18, 0.8, 8]} />
        <meshBasicMaterial
          color="#ffd24a"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Key light — the scene's focal flicker; the one shadow-caster here. */}
      <pointLight
        ref={lightRef}
        color="#ff8a3d"
        intensity={baseIntensity}
        distance={12}
        decay={2}
        position={[0, 1.1, 0]}
        castShadow
      />

      {/* Embers — one buffer geometry, positions + colours recycled in useFrame. */}
      <points ref={embersRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[embers.positions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[embers.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.075}
          sizeAttenuation
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
