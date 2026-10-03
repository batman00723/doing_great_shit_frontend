"use client";


import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

import { VHSTape } from "@/components/dashboard/VHSBox";

const BASE = "https://doing-great-shit.onrender.com/api_v1";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function MeetingReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: meetingId } = use(params);
  const router = useRouter();

  const [initialHtml, setInitialHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Feedback
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!meetingId) return;

    const fetchReport = async () => {
      const token = getToken();
      if (!token) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE}/analyse/${meetingId}/report`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        
        if (res.ok) {
          setInitialHtml(data.html || "<p>No report content available.</p>");
        } else {
          setError(data?.detail || "Failed to load the report.");
        }
      } catch (err) {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [meetingId]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    setIsSaving(true);
    
    const updatedHtml = editorRef.current.innerHTML;

    const token = getToken();
    try {
      const res = await fetch(`${BASE}/analyse/${meetingId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ html_report: updatedHtml }),
      });

      if (res.ok) {
        setInitialHtml(updatedHtml);
        setIsEditing(false);
        showToast("Report saved successfully.", "success");
      } else {
        const data = await res.json();
        showToast(data?.detail || "Failed to save the report.", "error");
      }
    } catch {
      showToast("Network error. Could not save.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    const token = getToken();
    try {
      const res = await fetch(`${BASE}/analyse/${meetingId}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      
      if (res.ok) {
        showToast(`Email successfully sent to customer!`, "success");
      } else {
        showToast(data?.detail || data?.message || "Failed to send email.", "error");
      }
    } catch {
      showToast("Network error. Could not send email.", "error");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <p className="font-anthropic-mono text-xs uppercase tracking-widest text-slate-400">Loading Document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <p className="font-anthropic-sans text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#1a1a1a] selection:bg-[#E5E3D9]">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 shadow-xl border font-anthropic-sans text-sm z-50 ${
              toast.type === "success" 
                ? "bg-white border-green-200 text-green-800" 
                : "bg-white border-red-200 text-red-800"
            }`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT COMPARTMENT - STICKY COVER */}
        <div className="lg:w-[45%] lg:sticky lg:top-0 lg:h-screen p-6 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 bg-[#f7f5ef]">
          <div>
            <button 
              onClick={() => router.back()}
              className="font-anthropic-mono text-xs uppercase tracking-widest text-slate-500 hover:text-[#1a1a1a] transition-colors mb-12 block"
            >
              [ Return to Archive ]
            </button>
            <div className="font-anthropic-mono text-[10px] uppercase tracking-widest text-slate-400 mb-4">
              Record No. {meetingId}
            </div>
            <h1 className="font-anthropic-serif text-5xl lg:text-7xl leading-[1.1] tracking-tight mb-8">
              Meeting <br/>
              <span className="italic text-slate-500">Dossier</span>
            </h1>
          </div>

          <div className="relative w-full aspect-[3/4] max-w-md mx-auto lg:mx-0 overflow-visible z-10">
            <VHSTape title="Meeting Dossier" date={new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} customer={`Record No. ${meetingId}`} index={Number(meetingId) || 0} />
          </div>

          <div className="mt-12 lg:mt-0 font-anthropic-sans text-sm text-slate-500 max-w-xs">
            This document contains the transcribed insights and analysis of the recorded session.
          </div>
        </div>

        {/* RIGHT COMPARTMENT - EDITORIAL CONTENT */}
        <div className="lg:w-[55%] p-6 lg:p-16 xl:p-24 bg-transparent">
          <div className="max-w-3xl mx-auto">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-12 border-b border-slate-200 gap-4">
              <div className="font-anthropic-mono text-xs uppercase tracking-widest text-slate-400">
                Reading Mode
              </div>
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="font-anthropic-sans text-sm text-slate-500 hover:text-[#1a1a1a]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="font-anthropic-sans text-sm bg-[#1a1a1a] text-[#FDFCF8] px-6 py-2 rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Edition"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="font-anthropic-sans text-sm border border-slate-300 px-6 py-2 rounded-full hover:border-[#1a1a1a] transition-colors"
                    >
                      Edit Text
                    </button>
                    <button
                      onClick={handleSendEmail}
                      disabled={isSending}
                      className="font-anthropic-sans text-sm bg-[#1a1a1a] text-[#FDFCF8] px-6 py-2 rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {isSending ? "Dispatching..." : "Dispatch Email"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Document Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`prose-editorial ${isEditing ? 'ring-1 ring-slate-300 p-8 bg-white' : ''}`}
            >
              <div
                ref={editorRef}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                dangerouslySetInnerHTML={{ __html: initialHtml }}
                className={`
                  outline-none
                  font-anthropic-serif text-lg md:text-xl text-[#1a1a1a] leading-relaxed
                  
                  [&>h1]:font-anthropic-serif [&>h1]:text-4xl [&>h1]:md:text-5xl [&>h1]:tracking-tight [&>h1]:mb-10 [&>h1]:leading-tight
                  [&>h2]:font-anthropic-sans [&>h2]:text-2xl [&>h2]:font-normal [&>h2]:tracking-tight [&>h2]:mt-16 [&>h2]:mb-6 [&>h2]:border-b [&>h2]:border-slate-200 [&>h2]:pb-4
                  [&>h3]:font-anthropic-mono [&>h3]:text-xs [&>h3]:uppercase [&>h3]:tracking-[0.2em] [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:text-slate-500
                  
                  [&>p]:mb-8 [&>p]:text-slate-800
                  [&>ul]:mb-8 [&>ul]:list-none [&>ul]:pl-0 [&>ul>li]:relative [&>ul>li]:pl-6 [&>ul>li]:mb-3 [&>ul>li]:text-slate-800 [&>ul>li]:before:content-['—'] [&>ul>li]:before:absolute [&>ul>li]:before:left-0 [&>ul>li]:before:text-slate-400
                  [&>ol]:mb-8 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol>li]:mb-3 [&>ol>li]:text-slate-800
                  
                  [&>strong]:font-semibold [&>strong]:text-[#1a1a1a]
                  [&>em]:italic [&>em]:text-slate-600
                  
                  ${isEditing ? "[&>*]:cursor-text min-h-[50vh]" : ""}
                `}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}







