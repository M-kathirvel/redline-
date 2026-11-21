"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function Counter({ value }: { value: number }) {
  const spring = useSpring(0, { duration: 1500 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString("en-IN"));
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span>{display}</motion.span>;
}

export default function ProjectMetric({ count }: { count: number }) {
  return (
    <div className="relative overflow-hidden border-y border-[#2a1a1b] bg-[#0b0909] py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(220,38,38,.14),transparent_65%)]" />
      <div className="container-wide relative flex flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
        <div>
          <p className="eyebrow">Built on outcomes</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Total Successful Projects Completed</h2>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="display-heading text-6xl text-red-500 drop-shadow-[0_0_24px_rgba(220,38,38,.32)] sm:text-8xl"><Counter value={count} />+</span>
          <span className="text-xs font-bold uppercase tracking-[.18em] text-[#777]">Projects delivered</span>
        </div>
      </div>
    </div>
  );
}
