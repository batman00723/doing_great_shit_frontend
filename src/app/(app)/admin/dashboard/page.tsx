"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  fadeIn,
  fadeInUp,
  fadeInDown,
  staggerContainer,
  staggerContainerSlow,
  springCalm,
  easeSoft,
  hoverScale,
  tapScale,
} from "@/lib/animations";

interface User {
  salesperson_name: string;
  role: string;
  organisation: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ salesperson_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch("https://doing-great-shit.onrender.com/api_v1/auth/me", {
          headers: { Authorization: `Bearer ${token || "dev"}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.role !== "Admin") { router.push("/dashboard/customers"); return; }
          setUser(data);
        } else if (!token) {
           router.push("/login");
        } else {
           router.push("/login");
        }
      } catch {
        // Backend not reachable → use mock user for UI preview
        setUser({
          salesperson_name: "Dev User",
          role: "Admin",
          organisation: "Smriti (Dev)",
        });
      }
    };
    fetchUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://doing-great-shit.onrender.com/api_v1/auth/register-salesperson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

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

      setSuccess(`Successfully invited ${form.salesperson_name}.`);
      setForm({ salesperson_name: "", email: "", password: "" });
      setShowForm(false);
    } catch (err) {
      setError("Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <motion.div variants={fadeIn} initial="initial" animate="animate" className="flex items-center justify-center h-64">
        <p className="font-anthropic-sans text-[13px] text-slate-dark/40">Loading…</p>
      </motion.div>
    );
  }

  const inputCls = "w-full bg-[#fdfaf6] border border-black/[0.06] text-slate-dark font-anthropic-sans text-[15px] px-4 py-3.5 rounded-xl outline-none focus:bg-white focus:border-clay/50 focus:ring-4 focus:ring-clay/10 transition-all placeholder:text-slate-dark/25 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";

  return (
    <div className="max-w-[1000px] mx-auto px-0 md:px-8 pb-24">
      {/* ── HEADER ── */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 mt-8"
      >
        <div>
          <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[48px] md:text-[56px] tracking-tight leading-[1] text-slate-dark">
            Team <em className="italic font-normal text-slate-dark/40">Management</em>
          </motion.h1>
          <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[15px] text-slate-dark/50 mt-5 max-w-[400px] leading-[1.75]">
            Manage your organization&apos;s salespeople. Add new members to grant them access to customer insights.
          </motion.p>
        </div>
        
        <motion.div variants={fadeInUp} transition={springCalm}>
          <motion.button
            whileHover={hoverScale}
            whileTap={tapScale}
            onClick={() => { setShowForm(true); setSuccess(""); setError(""); }}
            className="group relative inline-flex items-center justify-center font-anthropic-sans font-medium text-[14px] bg-slate-dark text-white px-6 py-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-black transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Invite member
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ── ALERTS ── */}
      <AnimatePresence>
        {success && (
          <motion.div
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={easeSoft}
            className="bg-[#f2f8f4] border border-[#d0ead9] rounded-2xl p-5 mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#e1f3e7] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#2c7a4b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="font-anthropic-sans font-semibold text-[14px] text-[#2c7a4b]">Invitation Sent</p>
                <p className="font-anthropic-sans text-[13px] text-[#429563] mt-0.5">{success}</p>
              </div>
            </div>
            <button onClick={() => setSuccess("")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/[0.04] text-[#2c7a4b] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={easeSoft}
            className="bg-[#fef4f4] border border-[#fbdcdc] rounded-2xl p-5 mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#fde8e8] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#b93232]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <p className="font-anthropic-sans font-semibold text-[14px] text-[#b93232]">Action Failed</p>
                <p className="font-anthropic-sans text-[13px] text-[#cc4a4a] mt-0.5">{error}</p>
              </div>
            </div>
            <button onClick={() => setError("")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/[0.04] text-[#b93232] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ── LEFT: TEAM LIST ── */}
        <div className="flex-1">
          <div className="bg-white border border-black/[0.06] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa]">
              <h3 className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/60 font-bold">
                Active Members
              </h3>
            </div>
            
            <div className="p-2 flex flex-col gap-1">
              {/* Current User Row */}
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#fafafa] transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-slate-dark text-white flex items-center justify-center text-[16px] font-medium shadow-sm">
                    {user.salesperson_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-anthropic-sans text-[15px] font-semibold text-slate-dark leading-snug flex items-center gap-2">
                      {user.salesperson_name}
                      <span className="bg-clay/10 text-clay-deep px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">You</span>
                    </p>
                    <p className="font-anthropic-sans text-[13px] text-slate-dark/50 mt-1">{user.role}</p>
                  </div>
                </div>
              </div>

              {/* Mock Member Row (To show how list looks) */}
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#fafafa] transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 flex items-center justify-center text-[16px] font-medium shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                    J
                  </div>
                  <div>
                    <p className="font-anthropic-sans text-[15px] font-medium text-slate-dark leading-snug">
                      Jane Smith
                    </p>
                    <p className="font-anthropic-sans text-[13px] text-slate-dark/50 mt-1">Salesperson</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 font-anthropic-sans text-[12px] font-medium text-slate-dark/40 hover:text-red-500 transition-all px-3 py-1.5 rounded-lg hover:bg-red-50">
                  Remove
                </button>
              </div>

              {/* Mock Member Row 2 */}
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#fafafa] transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 flex items-center justify-center text-[16px] font-medium shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                    M
                  </div>
                  <div>
                    <p className="font-anthropic-sans text-[15px] font-medium text-slate-dark leading-snug">
                      Michael Chen
                    </p>
                    <p className="font-anthropic-sans text-[13px] text-slate-dark/50 mt-1">Salesperson</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 font-anthropic-sans text-[12px] font-medium text-slate-dark/40 hover:text-red-500 transition-all px-3 py-1.5 rounded-lg hover:bg-red-50">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: FLYOUT FORM ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "100%", maxWidth: 420 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="shrink-0 overflow-hidden"
            >
              <div className="bg-white border border-black/[0.06] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] w-full">
                <div className="px-6 py-5 border-b border-black/[0.04] bg-[#fafafa] flex items-center justify-between">
                  <h3 className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-dark/60 font-bold">
                    Invite Member
                  </h3>
                  <button onClick={() => setShowForm(false)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/[0.05] text-slate-dark/40 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-2.5">
                    <label htmlFor="salesperson_name" className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-dark/60">
                      Full Name
                    </label>
                    <input
                      id="salesperson_name"
                      name="salesperson_name"
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={form.salesperson_name}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <label htmlFor="email" className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-dark/60">
                      Work Email
                    </label>
                    <input
                      id="sp-email"
                      name="email"
                      type="email"
                      required
                      placeholder="alex@acme.com"
                      value={form.email}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <label htmlFor="sp-password" className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-dark/60">
                      Temporary Password
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
                    <p className="font-anthropic-sans text-[12px] text-slate-dark/40 mt-1.5 leading-relaxed">
                      They will use this to log in the first time.
                    </p>
                  </div>

                  <motion.button
                    whileHover={hoverScale}
                    whileTap={tapScale}
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full font-anthropic-sans font-medium text-[15px] bg-slate-dark text-white py-4 rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {loading ? "Sending invite…" : "Send Invitation"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
