"use client";

import dynamic from "next/dynamic";

const RedlineHero3D = dynamic(() => import("@/components/three/RedlineHero3D"), {
  ssr: false,
  loading: () => null
});

export default function HeroScene() {
  return <RedlineHero3D />;
}
