"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://doing-great-shit.onrender.com/api_v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || data?.message || "Invalid email or password.");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);

      router.push("/dashboard");
    } catch {
      setError("Unable to reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-medium flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-dark flex-col justify-between p-16 relative overflow-hidden">
        {/* Topographic background texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 600 800" className="w-full h-full" fill="none" stroke="white" strokeWidth="1">
            <path d="M 600 0 C 500 100 400 150 300 100 C 200 50 100 100 0 150" />
            <path d="M 600 40 C 510 130 410 180 310 130 C 210 80 100 130 0 180" />
            <path d="M 600 80 C 520 160 420 210 320 160 C 220 110 100 160 0 210" />
            <path d="M 600 120 C 530 180 430 230 330 180 C 230 130 100 180 0 230" />
            <path d="M 600 300 C 450 400 350 300 250 400 C 150 500 50 450 0 500" />
            <path d="M 600 340 C 460 430 360 330 260 430 C 160 530 50 480 0 530" />
            <path d="M 600 380 C 470 460 370 360 270 460 C 170 560 50 510 0 560" />
            <path d="M 600 600 C 500 700 400 650 300 700 C 200 750 100 700 0 750" />
            <path d="M 600 640 C 510 730 410 680 310 730 C 210 780 100 730 0 780" />
            <path d="M 450 280 C 480 260 520 260 520 300 C 520 340 480 350 440 320 C 410 300 420 290 450 280 Z" />
            <path d="M 445 285 C 468 272 500 272 500 300 C 500 328 474 332 448 318 C 428 305 430 292 445 285 Z" />
          </svg>
        </div>

        {/* Logo */}
        <Link href="/" className="font-anthropic-sans font-bold text-[12px] uppercase tracking-wider text-white relative z-10">
          Smriti
        </Link>

        {/* Tagline */}
        <div className="relative z-10">
          <p className="font-anthropic-sans text-[11px] uppercase tracking-[0.15em] text-white/40 mb-6">
            Welcome back
          </p>
          <h2 className="font-anthropic-serif text-[48px] leading-[1.1] text-white mb-6">
            Your meetings are waiting.
          </h2>
          <p className="font-anthropic-serif text-[18px] leading-[1.5] text-white/60 max-w-[380px]">
            Sign in to access your meeting intelligence, reports, and team insights.
          </p>
        </div>

        {/* Bottom */}
        <p className="font-anthropic-sans text-[12px] text-white/30 relative z-10">
          © 2026 Smriti Inc.
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-28 xl:px-32 py-16">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden font-anthropic-sans font-bold text-[12px] uppercase tracking-wider text-slate-dark mb-12 block">
          Smriti
        </Link>

        <div className="max-w-[480px] w-full mx-auto lg:mx-0">
          <p className="font-anthropic-sans text-[11px] uppercase tracking-[0.15em] text-slate-dark/40 mb-4">
            Sign in
          </p>
          <h1 className="font-anthropic-serif text-[40px] leading-[1.1] text-slate-dark mb-2">
            Welcome back
          </h1>
          <p className="font-anthropic-serif text-[16px] text-slate-dark/60 mb-10">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-slate-dark underline underline-offset-2 hover:text-black transition-colors">
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-anthropic-sans text-[13px] font-medium text-slate-dark">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jane@acme.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border border-stone text-slate-dark font-anthropic-sans text-[14px] px-4 py-3 rounded-lg outline-none focus:border-slate-dark transition-colors placeholder:text-slate-dark/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-anthropic-sans text-[13px] font-medium text-slate-dark">
                  Password
                </label>
                <Link href="#" className="font-anthropic-sans text-[12px] text-slate-dark/50 hover:text-slate-dark underline underline-offset-2 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white border border-stone text-slate-dark font-anthropic-sans text-[14px] px-4 py-3 rounded-lg outline-none focus:border-slate-dark transition-colors placeholder:text-slate-dark/30"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="font-anthropic-sans text-[13px] text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-slate-dark text-white font-anthropic-sans font-semibold text-[14px] py-3.5 rounded-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
