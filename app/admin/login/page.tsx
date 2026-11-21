"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      window.location.assign("/admin");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_10%,rgba(220,38,38,.13),transparent_60%)]" />
      <section className="surface-card relative w-full max-w-[430px] p-8 sm:p-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center bg-red-600 text-xl font-black">R</span>
          <span className="text-sm font-black uppercase tracking-[.13em]">Redline <span className="text-[#888]">Admin</span></span>
        </Link>
        <p className="eyebrow mt-9">Secure workspace</p>
        <h1 className="mt-2 text-3xl font-black">Admin sign in</h1>
        <p className="mt-2 text-sm text-[#888]">Use your configured Redline administrator credentials.</p>
        <form onSubmit={login}>
          <div className="field"><label htmlFor="username">Username</label><input id="username" name="username" autoComplete="username" required maxLength={80} /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200} /></div>
          {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
          <button disabled={loading} className="button-primary mt-6 w-full">{loading ? "Signing in..." : "Sign in securely"}</button>
        </form>
        <Link href="/" className="mt-6 block text-center text-xs text-[#777] hover:text-white">← Return to public website</Link>
      </section>
    </main>
  );
}
