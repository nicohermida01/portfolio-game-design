import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { groundHeight } from "../terrain/heightfield.js";

const EMBER_COUNT = 30;

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

  // Ember state: a typed position array mutated in place, plus per-particle
  // rise speed and lifetime so each one recycles independently.
  const embers = useMemo(() => {
    const positions = new Float32Array(EMBER_COUNT * 3);
    const speed = new Float32Array(EMBER_COUNT);
    const life = new Float32Array(EMBER_COUNT);
    for (let i = 0; i < EMBER_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = Math.random() * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      speed[i] = 0.6 + Math.random() * 0.8;
      life[i] = Math.random();
    }
    return { positions, speed, life };
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

    // Embers: rise + drift, recycled to the fire base past end of life. The
    // position buffer is mutated in place, never recreated.
    if (embersRef.current) {
      const arr = embersRef.current.geometry.attributes.position.array;
      for (let i = 0; i < EMBER_COUNT; i++) {
        embers.life[i] += delta * 0.4;
        if (embers.life[i] >= 1) {
          embers.life[i] = 0;
          arr[i * 3] = (Math.random() - 0.5) * 0.3;
          arr[i * 3 + 1] = 0.1;
          arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        } else {
          arr[i * 3] += Math.sin(t * 3 + i) * delta * 0.15;
          arr[i * 3 + 1] += embers.speed[i] * delta;
          arr[i * 3 + 2] += Math.cos(t * 2.5 + i) * delta * 0.15;
        }
      }
      embersRef.current.geometry.attributes.position.needsUpdate = true;
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

      {/* Embers — one buffer geometry, positions recycled in useFrame. */}
      <points ref={embersRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[embers.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffb347"
          size={0.08}
          sizeAttenuation
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
