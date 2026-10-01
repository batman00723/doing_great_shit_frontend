"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ShaderGradientCanvas, ShaderGradient } from "shadergradient";
import {
  fadeInUp,
  fadeInDown,
  slideInRight,
  staggerContainer,
  staggerContainerSlow,
  springCalm,
  easeSoft,
  hoverScale,
  tapScale,
} from "@/lib/animations";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organisation_name: "",
    admin_name: "",
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
      const res = await fetch("https://doing-great-shit.onrender.com/api_v1/auth/register-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Register response:", res.status, data);

      if (!res.ok) {
        if (typeof data?.detail === "string") {
          setError(data.detail);
        } else if (Array.isArray(data?.detail)) {
          setError(data.detail.map((e: { msg: string }) => e.msg).join(", "));
        } else if (data?.message) {
          setError(data.message);
        } else {
          setError(`Error ${res.status}: ${JSON.stringify(data)}`);
        }
        return;
      }

      // Store the JWT token
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);

      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Unable to reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex">
      {/* Left Panel — Brand */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden lg:flex lg:w-[45%] bg-slate-dark flex-col justify-between p-16 relative overflow-hidden"
      >
        {/* Beautiful WebGL Shader Gradient Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <ShaderGradientCanvas
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          >
            {/* @ts-ignore */}
            <ShaderGradient {...{
              animate:"on", axesHelper:"off", brightness:1.2, cAzimuthAngle:565, cDistance:13.1, cPolarAngle:160, cameraZoom:5, color1:"#ff5005", color2:"#dbba95", color3:"#d0bce1", destination:"onCanvas", embedMode:"off", envPreset:"lobby", format:"gif", fov:30, frameRate:10, gizmoHelper:"hide", grain:"on", lightType:"3d", pixelDensity:1, positionX:-1.4, positionY:0, positionZ:0, range:"disabled", rangeEnd:40, rangeStart:0, reflection:0.1, rotationX:0, rotationY:10, rotationZ:50, shader:"defaults", type:"plane", uAmplitude:0.4, uDensity:1.3, uFrequency:5.5, uSpeed:0.2, uStrength:4, uTime:0, wireframe:false, zoomOut:true
            }} />
          </ShaderGradientCanvas>
          {/* Dark overlay to ensure white text remains readable over the bright gradient */}
          <div className="absolute inset-0 bg-slate-dark/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Logo */}
        <Link href="/" className="font-anthropic-sans font-bold text-[13px] uppercase tracking-[0.2em] text-white relative z-10">
          Smriti
        </Link>

        {/* Tagline */}
        <motion.div
          variants={staggerContainerSlow}
          initial="initial"
          animate="animate"
          className="relative z-10"
        >
          <motion.div variants={fadeInUp} transition={springCalm} className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full border border-clay/30 bg-clay/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
            <span className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-clay-deep">
              Smriti Intelligence
            </span>
          </motion.div>
          <motion.h2 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[56px] leading-[1.05] tracking-tight text-white mb-6">
            Join <br/> <em className="italic font-normal text-clay">Smriti.</em>
          </motion.h2>
          <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[20px] leading-[1.5] text-white/60 max-w-[380px]">
            Register your organisation and let Smriti capture, analyse, and report on every call — automatically.
          </motion.p>
        </motion.div>

        {/* Bottom quote */}
        <p className="font-anthropic-sans text-[12px] text-white/30 relative z-10">
          © 2026 Smriti Inc.
        </p>
      </motion.div>

      {/* Right Panel — Form */}
      <motion.div
        variants={slideInRight}
        initial="initial"
        animate="animate"
        transition={{ ...springCalm, delay: 0.15 }}
        className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-28 xl:px-32 py-16 overflow-y-auto"
      >
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden font-anthropic-sans font-bold text-[13px] uppercase tracking-[0.2em] text-slate-dark mb-12 block">
          Smriti
        </Link>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-[440px] w-full mx-auto lg:mx-0 py-8"
        >
          <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[44px] leading-[1.1] tracking-tight text-slate-dark mb-2">
            Create account
          </motion.h1>
          <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[17px] text-slate-dark/60 mb-10">
            Already have an account?{" "}
            <Link href="/login" className="text-clay underline underline-offset-4 hover:text-clay-deep transition-colors">
              Sign in
            </Link>
          </motion.p>

          <motion.form variants={fadeInUp} transition={springCalm} onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <p className="font-anthropic-sans text-[10px] font-bold uppercase tracking-[0.15em] text-slate-dark/40 mb-4 border-b border-stone/60 pb-2">
                01. Organisation
              </p>
              <div className="flex flex-col gap-2">
                <label htmlFor="organisation_name" className="font-anthropic-sans text-[11px] uppercase tracking-[0.1em] font-semibold text-slate-dark/70">
                  Company name
                </label>
                <input
                  id="organisation_name"
                  name="organisation_name"
                  type="text"
                  required
                  placeholder="Acme Corp"
                  value={formData.organisation_name}
                  onChange={handleChange}
                  className="w-full bg-white/50 border border-stone/60 text-slate-dark font-anthropic-sans text-[15px] px-4 py-3.5 rounded-xl outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-all placeholder:text-slate-dark/30"
                />
              </div>
            </div>

            <div className="mt-2">
              <p className="font-anthropic-sans text-[10px] font-bold uppercase tracking-[0.15em] text-slate-dark/40 mb-4 border-b border-stone/60 pb-2">
                02. Your Details
              </p>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="admin_name" className="font-anthropic-sans text-[11px] uppercase tracking-[0.1em] font-semibold text-slate-dark/70">
                    Full name
                  </label>
                  <input
                    id="admin_name"
                    name="admin_name"
                    type="text"
                    required
                    placeholder="Jane Smith"
                    value={formData.admin_name}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-stone/60 text-slate-dark font-anthropic-sans text-[15px] px-4 py-3.5 rounded-xl outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-all placeholder:text-slate-dark/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-anthropic-sans text-[11px] uppercase tracking-[0.1em] font-semibold text-slate-dark/70">
                    Work email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="jane@acme.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-stone/60 text-slate-dark font-anthropic-sans text-[15px] px-4 py-3.5 rounded-xl outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-all placeholder:text-slate-dark/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="font-anthropic-sans text-[11px] uppercase tracking-[0.1em] font-semibold text-slate-dark/70">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/50 border border-stone/60 text-slate-dark font-anthropic-sans text-[15px] px-4 py-3.5 rounded-xl outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-all placeholder:text-slate-dark/30"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  variants={fadeInDown}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={easeSoft}
                  className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                >
                  <p className="font-anthropic-sans text-[13px] text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              id="register-submit"
              type="submit"
              disabled={loading}
              whileHover={!loading ? hoverScale : undefined}
              whileTap={!loading ? tapScale : undefined}
              className="w-full bg-slate-dark text-white font-anthropic-sans font-medium text-[15px] py-4 rounded-full hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-sm"
            >
              {loading ? "Creating your account…" : "Create account"}
            </motion.button>

            <p className="font-anthropic-sans text-[12px] text-slate-dark/50 text-center leading-relaxed mt-2">
              By creating an account you agree to our{" "}
              <Link href="#" className="underline underline-offset-2 hover:text-slate-dark transition-colors">Terms of Service</Link>
              {" "}and{" "}
              <Link href="#" className="underline underline-offset-2 hover:text-slate-dark transition-colors">Privacy Policy</Link>.
            </p>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
}
