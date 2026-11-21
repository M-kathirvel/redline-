"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";

function CoreShape() {
  const shape = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!shape.current) return;
    shape.current.rotation.x += delta * 0.12;
    shape.current.rotation.y += delta * 0.2;
    shape.current.rotation.z = state.pointer.x * 0.14;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.5}>
      <mesh ref={shape} position={[2.9, 0.1, -1.5]}>
        <icosahedronGeometry args={[1.48, 1]} />
        <meshBasicMaterial color="#dc2626" wireframe transparent opacity={0.48} />
      </mesh>
      <mesh position={[2.9, 0.1, -1.5]} scale={0.78}>
        <icosahedronGeometry args={[1.48, 1]} />
        <meshBasicMaterial color="#e11d48" wireframe transparent opacity={0.22} />
      </mesh>
    </Float>
  );
}

export default function RedlineHero3D() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden opacity-80">
      <Canvas
        dpr={typeof window !== "undefined" && window.innerWidth < 700 ? [0.7, 1] : [1, 1.35]}
        camera={{ position: [0, 0, 7], fov: 48 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <CoreShape />
          <Sparkles count={typeof window !== "undefined" && window.innerWidth < 700 ? 22 : 52} scale={9} size={1.5} speed={0.18} color="#f04452" />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
