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

      setSuccess(`${form.salesperson_name} has been added to ${user?.organisation}.`);
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

  const inputCls = "w-full bg-[#fdfaf6] border border-stone/60 text-slate-dark font-anthropic-sans text-[14px] px-4 py-3 rounded-xl outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-all placeholder:text-slate-dark/30";

  return (
    <div className="max-w-[760px]">
      {/* Greeting */}
      <motion.div
        variants={staggerContainerSlow}
        initial="initial"
        animate="animate"
        className="mb-16"
      >
        <motion.p variants={fadeInUp} transition={springCalm} className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-dark/40 mb-4">
          Admin · {user.organisation}
        </motion.p>
        <motion.h1 variants={fadeInUp} transition={springCalm} className="font-anthropic-serif text-[64px] md:text-[88px] tracking-tight leading-[1.05] text-slate-dark">
          Hello,<br /><em className="italic font-normal text-clay-deep">{user.salesperson_name.split(" ")[0]}.</em>
        </motion.h1>
      </motion.div>

      {/* Success banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={easeSoft}
            className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-8 flex items-start gap-3"
          >
            <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-anthropic-sans text-[14px] text-green-700">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Salesperson Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springCalm, delay: 0.2 }}
        className="bg-white border border-stone/40 rounded-[32px] p-10 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h2 className="font-anthropic-serif text-[32px] tracking-tight text-slate-dark">
              Add a <em className="italic font-normal text-clay-deep">salesperson.</em>
            </h2>
            <p className="font-anthropic-sans text-[15px] text-slate-dark/60 mt-2">
              New reps will be added to {user.organisation} and can log in immediately.
            </p>
          </div>
          <AnimatePresence>
            {!showForm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={hoverScale}
                whileTap={tapScale}
                onClick={() => setShowForm(true)}
                className="font-anthropic-sans font-medium text-[14px] bg-slate-dark text-white px-6 py-3 rounded-full hover:bg-black transition-colors shrink-0 shadow-sm"
              >
                + Add rep
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 border-t border-stone/30 pt-8 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="salesperson_name" className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">
                    Full name *
                  </label>
                  <input
                    id="salesperson_name"
                    name="salesperson_name"
                    type="text"
                    required
                    placeholder="Alex Johnson"
                    value={form.salesperson_name}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">
                    Work email *
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
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="sp-password" className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-dark/70">
                  Temporary password *
                </label>
                <input
                  id="sp-password"
                  name="password"
                  type="password"
                  required
                  placeholder="They can change this after logging in"
                  value={form.password}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    variants={fadeInDown}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={easeSoft}
                    className="bg-red-50 border border-red-200 rounded-xl px-5 py-4"
                  >
                    <p className="font-anthropic-sans text-[14px] text-red-600">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-4 pt-2">
                <motion.button
                  whileHover={hoverScale}
                  whileTap={tapScale}
                  type="submit"
                  disabled={loading}
                  className="font-anthropic-sans font-medium text-[14px] bg-slate-dark text-white px-8 py-3.5 rounded-full hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? "Adding…" : "Add salesperson"}
                </motion.button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="font-anthropic-sans font-medium text-[14px] text-slate-dark/50 hover:text-slate-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
