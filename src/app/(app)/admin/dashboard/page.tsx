"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp, staggerContainerSlow, springCalm, hoverScale, tapScale, easeSoft } from "@/lib/animations";

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [form, setForm] = useState({
    salesperson_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch("https://doing-great-shit.onrender.com/api_v1/auth/me", {
          headers: { Authorization: `Bearer ${token || "dev"}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.role !== "Admin" && data.role !== "admin") { 
            router.push("/dashboard/customers"); 
            return; 
          }
          setUser(data);
        } else if (!token) {
           router.push("/login");
        } else {
           // Maybe token expired
           router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("https://doing-great-shit.onrender.com/api_v1/auth/salespeople", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        throw new Error("Failed to create salesperson");
      }

      setSuccess("Account successfully created.");
      setForm({ salesperson_name: "", email: "", password: "" });
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const inputCls = "w-full bg-[#050a0c] border border-teal-900/30 text-white font-anthropic-sans text-[15px] px-4 py-3.5 rounded-xl outline-none focus:bg-[#091114] focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-white/25 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-24">
      {/* HEADER */}
      <motion.div 
        variants={staggerContainerSlow} 
        initial="initial" 
        animate="animate"
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-6"
      >
        <div>
          <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[48px] md:text-[56px] tracking-tight leading-[1] text-white">
            Admin <em className="italic font-normal text-teal-100/40">Portal</em>
          </motion.h1>
          <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[15px] text-teal-100/50 mt-5 max-w-[440px] leading-[1.75]">
            Provision new employee accounts. Generated credentials can be shared with the salesperson securely.
          </motion.p>
        </div>
      </motion.div>

      {/* NOTIFICATIONS */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 32 }}
            exit="exit"
            transition={easeSoft}
            className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="font-anthropic-sans font-semibold text-[14px] text-emerald-400">Success</p>
                <p className="font-anthropic-sans text-[13px] text-emerald-500 mt-0.5">{success}</p>
              </div>
            </div>
            <button onClick={() => setSuccess("")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-teal-900/20 text-emerald-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 32 }}
            exit="exit"
            transition={easeSoft}
            className="bg-red-900/20 border border-red-500/30 rounded-2xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <p className="font-anthropic-sans font-semibold text-[14px] text-red-400">Failed to create account</p>
                <p className="font-anthropic-sans text-[13px] text-red-500 mt-0.5">{error}</p>
              </div>
            </div>
            <button onClick={() => setError("")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-teal-900/20 text-red-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springCalm, delay: 0.2 }}
        className="max-w-[500px]"
      >
        <div className="bg-[#091114] border border-teal-900/30 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.4)] w-full overflow-hidden">
          <div className="px-8 py-6 border-b border-teal-900/20 bg-[#0a1317]">
            <h3 className="font-anthropic-mono text-[10px] uppercase tracking-widest text-white/60 font-bold">
              Create Salesperson Account
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-7">
            <div className="flex flex-col gap-3">
              <label htmlFor="salesperson_name" className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
                Full Name
              </label>
              <input
                id="salesperson_name"
                name="salesperson_name"
                type="text"
                required
                placeholder="e.g. Kaelen Voss"
                value={form.salesperson_name}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="email" className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
                Work Email
              </label>
              <input
                id="sp-email"
                name="email"
                type="email"
                required
                placeholder="kaelen@osprey.io"
                value={form.email}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="sp-password" className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
                Password
              </label>
              <input
                id="sp-password"
                name="password"
                type="password"
                required
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <motion.button
              whileHover={hoverScale}
              whileTap={tapScale}
              type="submit"
              disabled={loading}
              className="mt-4 w-full font-anthropic-sans font-semibold text-[16px] bg-teal-600 text-white py-[18px] rounded-xl hover:bg-teal-500 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? "Provisioning account..." : "Add team member"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
