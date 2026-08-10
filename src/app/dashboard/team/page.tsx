"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
        const res = await fetch("http://localhost:8000/api_v1/auth/me", {
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

    try {
      const res = await fetch("http://localhost:8000/api_v1/auth/register-salesperson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || data?.message || "Something went wrong.");
        return;
      }

      setSuccess(`${form.salesperson_name} has been added to ${user?.organisation}.`);
      setForm({ salesperson_name: "", email: "", password: "" });
      setShowForm(false);
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-anthropic-sans text-[13px] text-slate-dark/40">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[680px]">
      {/* Greeting */}
      <div className="mb-12">
        <p className="font-anthropic-sans text-[11px] uppercase tracking-[0.15em] text-slate-dark/40 mb-3">
          Admin · {user.organisation}
        </p>
        <h1 className="font-anthropic-serif text-[52px] leading-[1.1] text-slate-dark">
          Hello, {user.salesperson_name.split(" ")[0]}.
        </h1>
      </div>

      {/* Success banner */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-4 mb-8 flex items-start gap-3">
          <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="font-anthropic-sans text-[13px] text-green-700">{success}</p>
        </div>
      )}

      {/* Add Salesperson Card */}
      <div className="bg-white border border-stone/50 rounded-[20px] p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-anthropic-sans font-semibold text-[18px] text-slate-dark">
              Add a salesperson
            </h2>
            <p className="font-anthropic-serif text-[14px] text-slate-dark/60 mt-1">
              New reps will be added to {user.organisation} and can log in immediately.
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="font-anthropic-sans font-semibold text-[13px] bg-slate-dark text-white px-5 py-2.5 rounded-lg hover:bg-black transition-all shrink-0"
            >
              + Add rep
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-stone/40 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="salesperson_name" className="font-anthropic-sans text-[13px] font-medium text-slate-dark">
                  Full name
                </label>
                <input
                  id="salesperson_name"
                  name="salesperson_name"
                  type="text"
                  required
                  placeholder="Alex Johnson"
                  value={form.salesperson_name}
                  onChange={handleChange}
                  className="w-full bg-ivory-medium border border-stone text-slate-dark font-anthropic-sans text-[14px] px-4 py-2.5 rounded-lg outline-none focus:border-slate-dark transition-colors placeholder:text-slate-dark/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="font-anthropic-sans text-[13px] font-medium text-slate-dark">
                  Work email
                </label>
                <input
                  id="sp-email"
                  name="email"
                  type="email"
                  required
                  placeholder="alex@acme.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-ivory-medium border border-stone text-slate-dark font-anthropic-sans text-[14px] px-4 py-2.5 rounded-lg outline-none focus:border-slate-dark transition-colors placeholder:text-slate-dark/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sp-password" className="font-anthropic-sans text-[13px] font-medium text-slate-dark">
                Temporary password
              </label>
              <input
                id="sp-password"
                name="password"
                type="password"
                required
                placeholder="They can change this after logging in"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-ivory-medium border border-stone text-slate-dark font-anthropic-sans text-[14px] px-4 py-2.5 rounded-lg outline-none focus:border-slate-dark transition-colors placeholder:text-slate-dark/30"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="font-anthropic-sans text-[13px] text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="font-anthropic-sans font-semibold text-[13px] bg-slate-dark text-white px-6 py-2.5 rounded-lg hover:bg-black transition-all disabled:opacity-50"
              >
                {loading ? "Adding…" : "Add salesperson"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); }}
                className="font-anthropic-sans text-[13px] text-slate-dark/50 hover:text-slate-dark transition-colors"
              >
                Cancel
            </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
