"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  fadeIn,
  fadeInUp,
  springCalm,
  easeSoft,
} from "@/lib/animations";

interface User {
  user_id: number;
  salesperson_name: string;
  email: string;
  role: string;
  organisation: string;
  organisation_id: number;
}

interface Customer {
  id: number;
  customer_name: string;
}

const NAV_LINKS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Meetings",
    href: "/dashboard/meetings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: "Team",
    href: "/admin/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    setMounted(true);
    // Restore user from /auth/me on mount
    const restore = async () => {
      const stored = localStorage.getItem("access_token");

      try {
        const res = await fetch("https://doing-great-shit.onrender.com/api_v1/auth/me", {
          headers: { Authorization: `Bearer ${stored || "dev"}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else if (!stored) {
          // No token + backend responded → redirect to login
          router.push("/login");
        } else {
          // Token exists but invalid → redirect to login
          router.push("/login");
        }
      } catch {
        // Backend not reachable → use mock user for UI preview
        setUser({
          user_id: 0,
          salesperson_name: "Dev User",
          email: "dev@smriti.ai",
          role: "Admin",
          organisation: "Smriti (Dev)",
          organisation_id: 0,
        });
      }
    };

    const fetchCustomers = async () => {
      const stored = localStorage.getItem("access_token");
      try {
        const res = await fetch("https://doing-great-shit.onrender.com/api_v1/customers/list", {
          headers: { Authorization: `Bearer ${stored || "dev"}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        } else {
          // Mock customers for UI preview
          setCustomers([{ id: 1, customer_name: "Netflix (Mock)" }, { id: 2, customer_name: "Stripe (Mock)" }]);
        }
      } catch {
        // Backend not reachable — use mock data
        setCustomers([{ id: 1, customer_name: "Netflix (Mock)" }, { id: 2, customer_name: "Stripe (Mock)" }]);
      }
    };

    restore();
    fetchCustomers();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  // Determine which nav link is active — exact match for /dashboard, startsWith for others
  const isLinkActive = (href: string) => {
    if (!mounted || !pathname) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -10 }}
        animate={{ 
          opacity: 1, 
          x: 0, 
          width: isSidebarCollapsed ? 80 : 200 
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden md:flex shrink-0 bg-[#fdfaf6] border-r border-black/[0.04] flex-col justify-between py-8 px-4 overflow-hidden relative"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute top-8 ${isSidebarCollapsed ? "right-1/2 translate-x-1/2" : "right-4"} z-10 w-8 h-8 rounded-lg bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-slate-dark/40 hover:text-slate-dark hover:bg-white transition-all`}
          suppressHydrationWarning
        >
          <motion.svg 
            animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </motion.svg>
        </button>

        {/* Top */}
        <div>
          <Link href="/" className={`font-anthropic-sans font-bold text-[13px] uppercase tracking-[0.2em] text-slate-dark mb-10 block transition-all ${isSidebarCollapsed ? "opacity-0 invisible" : "px-3"}`}>
            Smriti
          </Link>

          <nav className="flex flex-col gap-1.5" suppressHydrationWarning>
            {NAV_LINKS.filter(link => {
              if (link.href === "/admin/dashboard") return mounted && user?.role === "Admin";
              return true;
            }).map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center rounded-xl font-anthropic-sans text-[13px] transition-colors ${
                    isSidebarCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
                  }`}
                  title={isSidebarCollapsed ? link.label : undefined}
                  suppressHydrationWarning
                >
                  {/* Shared layout active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute inset-0 bg-stone/10 rounded-xl"
                      transition={springCalm}
                    />
                  )}
                  <span className={`relative z-10 flex items-center transition-colors font-medium ${
                    isSidebarCollapsed ? "justify-center" : "gap-3"
                  } ${
                    isActive ? "text-slate-dark" : "text-slate-dark/50 hover:text-slate-dark"
                  }`}>
                    <div className="shrink-0">{link.icon}</div>
                    <AnimatePresence>
                      {!isSidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap"
                        >
                          {link.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom — User + Logout */}
        <div className={`border-t border-black/[0.04] pt-6 flex flex-col ${isSidebarCollapsed ? "items-center" : "px-3"}`}>
          <AnimatePresence>
            {!isSidebarCollapsed ? (
              <motion.div
                key="full-user"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                {user && (
                  <>
                    <p className="font-anthropic-sans text-[12px] text-slate-dark font-medium truncate">{user.salesperson_name}</p>
                    <p className="font-anthropic-sans text-[11px] text-slate-dark/50 truncate">{user.role} · {user.organisation}</p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="icon-user"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4"
              >
                {user && (
                  <div className="w-10 h-10 rounded-full bg-slate-dark text-white flex items-center justify-center text-[14px] font-bold shrink-0">
                    {user.salesperson_name.charAt(0)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className={`font-anthropic-sans text-slate-dark/40 hover:text-slate-dark transition-colors ${
              isSidebarCollapsed ? "p-2 rounded-lg hover:bg-black/[0.03]" : "text-[12px] text-left"
            }`}
            title={isSidebarCollapsed ? "Sign out" : undefined}
          >
            {isSidebarCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            ) : (
              "Sign out"
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Minimal Top Navbar */}
        <motion.header
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full bg-white/90 backdrop-blur-md border-b border-black/[0.04] px-8 py-3 flex items-center justify-end sticky top-0 z-40 relative"
        >
          {/* Header Navigation */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-12" suppressHydrationWarning>
            {NAV_LINKS.filter(link => {
              if (link.href === "/admin/dashboard") return mounted && user?.role === "Admin";
              return true;
            }).map((link) => (
              <Link
                key={`header-${link.href}`}
                href={link.href}
                className={`font-anthropic-mono text-[10px] uppercase tracking-widest transition-colors ${
                  isLinkActive(link.href) ? "font-bold text-slate-dark" : "font-medium text-slate-dark/40 hover:text-slate-dark"
                }`}
                suppressHydrationWarning
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side — user pill */}
          <AnimatePresence>
            {user && (
              <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="font-anthropic-sans text-[12px] font-medium text-slate-dark bg-black/[0.02] border border-black/[0.06] px-2 py-1.5 pr-4 rounded-full flex items-center gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-black/[0.04] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-slate-dark text-white flex items-center justify-center text-[10px] font-bold">
                   {user.salesperson_name.charAt(0)}
                </div>
                {user.salesperson_name}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* Page content — fade in on route change */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1 p-8 md:p-12 overflow-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
