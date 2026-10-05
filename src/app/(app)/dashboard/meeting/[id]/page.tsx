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
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Find & Replace
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  // Feedback
  const [toast, setToast] = useState<{ 
    msg: string; 
    type: "success" | "error"; 
    title?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    if (!meetingId) return;

    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      try {
        const reportRes = await fetch(`${BASE}/analyse/${meetingId}/report`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const meetingsRes = await fetch(`${BASE}/analyse/meetings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (reportRes.ok && meetingsRes.ok) {
          const reportData = await reportRes.json();
          const meetingsData = await meetingsRes.json();
          
          setInitialHtml(reportData.html || "<p>No report content available.</p>");
          
          const meeting = meetingsData.find((m: any) => m.meeting_id === Number(meetingId));
          if (meeting) {
            setMeetingDetails(meeting);
          }
        } else {
          setError("Failed to load the report or meeting details.");
        }
      } catch (err) {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meetingId]);

  const showToast = (
    msg: string, 
    type: "success" | "error", 
    opts?: { title?: string; email?: string }
  ) => {
    setToast({ msg, type, title: opts?.title, email: opts?.email });
    setTimeout(() => setToast(null), 5500);
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    setIsSaving(true);
    
    let updatedHtml = editorRef.current.innerHTML;
    // Clean up any stray highlight markers before saving
    updatedHtml = updatedHtml.replace(/<mark class="bg-yellow-200 text-black px-1 rounded">/g, "");
    updatedHtml = updatedHtml.replace(/<\/mark>/g, "");

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
        showToast("Report saved successfully.", "success", { title: "Document Saved" });
      } else {
        const data = await res.json();
        showToast(data?.detail || "Failed to save the report.", "error", { title: "Save Error" });
      }
    } catch {
      showToast("Network error. Could not save.", "error", { title: "Network Error" });
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
        // Extract recipient email from backend response, regex from message, or meetingDetails
        const emailFromMsg = typeof data?.message === "string"
          ? data.message.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0]
          : null;
        const targetEmail = data?.email || emailFromMsg || meetingDetails?.customer?.email || "";

        showToast(
          targetEmail ? `Email sent to ${targetEmail}` : "Email sent to customer successfully!",
          "success",
          {
            title: "Email Sent Successfully",
            email: targetEmail || undefined
          }
        );
      } else {
        showToast(data?.detail || data?.message || "Failed to send email.", "error", { title: "Delivery Failed" });
      }
    } catch {
      showToast("Network error. Could not send email.", "error", { title: "Connection Error" });
    } finally {
      setIsSending(false);
    }
  };

  const handleFindAll = () => {
    if (!editorRef.current || !findText) return;
    
    let html = editorRef.current.innerHTML;
    html = html.replace(/<mark class="bg-yellow-200 text-black px-1 rounded">/g, "");
    html = html.replace(/<\/mark>/g, "");
    
    const regex = new RegExp(`(${findText})`, "gi");
    html = html.replace(regex, `<mark class="bg-yellow-200 text-black px-1 rounded">$1</mark>`);
    
    editorRef.current.innerHTML = html;
  };

  const handleReplaceAll = () => {
    if (!editorRef.current || !findText) return;
    
    let html = editorRef.current.innerHTML;
    html = html.replace(/<mark class="bg-yellow-200 text-black px-1 rounded">/g, "");
    html = html.replace(/<\/mark>/g, "");
    
    const regex = new RegExp(`(${findText})`, "gi");
    html = html.replace(regex, replaceText);
    
    editorRef.current.innerHTML = html;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <p className="font-anthropic-mono text-xs uppercase tracking-widest text-slate-400">Loading Document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <p className="font-anthropic-sans text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#1a1a1a] selection:bg-[#E5E3D9]">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 max-w-sm sm:max-w-md bg-[#fdfdfc] border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.14)] font-anthropic-sans z-50 flex items-start gap-3.5"
          >
            {/* Status Icon */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === "success" 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60" 
                : "bg-red-50 text-red-600 border border-red-200/60"
            }`}>
              {toast.type === "success" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-anthropic-serif text-base font-semibold text-slate-900 tracking-tight">
                  {toast.title || (toast.type === "success" ? "Success" : "Notification")}
                </h4>
              </div>
              
              {toast.email ? (
                <div className="text-[13px] text-slate-600 leading-relaxed">
                  Email sent to{" "}
                  <span className="font-anthropic-mono text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-1.5 py-0.5 rounded font-medium break-all">
                    {toast.email}
                  </span>
                </div>
              ) : (
                <p className="text-[13px] text-slate-600 leading-relaxed break-words">
                  {toast.msg}
                </p>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-100"
              title="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-full">
        {/* LEFT COMPARTMENT - STICKY COVER - 30% Width */}
        <div className="lg:w-[30%] lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)] self-start p-6 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 bg-transparent">
          <div>
            <button 
              onClick={() => router.back()}
              className="font-anthropic-mono text-xs uppercase tracking-widest text-slate-500 hover:text-[#1a1a1a] transition-colors block"
            >
              [ Return to Archive ]
            </button>
          </div>

          <div className="relative w-full overflow-visible z-10 flex-1 flex items-center justify-center">
            <VHSTape 
              title={meetingDetails?.title || "Meeting Report"} 
              date={meetingDetails ? new Date(meetingDetails.meeting_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} 
              customer={meetingDetails?.customer?.customer_name || `Record No. ${meetingId}`} 
              index={Number(meetingId) || 0}
              compact={true}
            />
          </div>

          {/* Action Buttons below tape */}
          <div className="mt-8 flex flex-col gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="font-anthropic-mono text-[10px] uppercase tracking-widest px-6 py-3 border border-slate-300 rounded hover:bg-slate-100 transition-colors w-full text-center"
              >
                Edit Report
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="font-anthropic-mono text-[10px] uppercase tracking-widest px-4 py-3 border border-slate-300 rounded hover:bg-slate-100 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="font-anthropic-mono text-[10px] uppercase tracking-widest px-4 py-3 bg-[#1a1a1a] text-white rounded hover:bg-black transition-colors disabled:opacity-50 flex-1"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
            
            <button
              onClick={handleSendEmail}
              disabled={isSending}
              className="font-anthropic-mono text-[10px] uppercase tracking-widest px-6 py-3.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50 w-full text-center flex items-center justify-center gap-2 shadow-xs"
            >
              {isSending ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Sending Email...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Share with Customers</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COMPARTMENT - EDITORIAL CONTENT - 70% Width */}
        <div className="lg:w-[70%] p-6 lg:p-16 xl:p-24 bg-transparent">
          <div className="max-w-4xl mx-auto">
            
            {/* Editor Find/Replace Toolbar */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-12"
                >
                  <div className="bg-orange-50 border border-orange-200/60 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-orange-200/50 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span className="font-anthropic-mono text-[10px] font-bold uppercase tracking-widest text-orange-900/60">
                          Edit Mode Active
                        </span>
                      </div>
                      <p className="font-anthropic-sans text-[12px] text-orange-900/60">
                        Click directly into the document to edit.
                      </p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-3 pt-1">
                      {/* Find Input */}
                      <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm focus-within:border-orange-300 transition-colors">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                          type="text" 
                          placeholder="Find in document..." 
                          value={findText}
                          onChange={(e) => setFindText(e.target.value)}
                          className="bg-transparent border-none outline-none font-anthropic-mono text-xs text-slate-700 placeholder:text-slate-400 w-full" 
                        />
                        <button onClick={handleFindAll} disabled={!findText} className="font-anthropic-sans text-[10px] font-medium bg-slate-100 px-2 py-1 rounded text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50">Find</button>
                      </div>
                      
                      {/* Replace Input */}
                      <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm focus-within:border-orange-300 transition-colors">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <input 
                          type="text" 
                          placeholder="Replace with..." 
                          value={replaceText}
                          onChange={(e) => setReplaceText(e.target.value)}
                          className="bg-transparent border-none outline-none font-anthropic-mono text-xs text-slate-700 placeholder:text-slate-400 w-full" 
                        />
                        <button onClick={handleReplaceAll} disabled={!findText} className="font-anthropic-sans text-[10px] font-medium bg-[#1a1a1a] text-white px-2 py-1 rounded hover:bg-black transition-colors disabled:opacity-50">Replace</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div 
              ref={editorRef}
              contentEditable={isEditing}
              suppressContentEditableWarning
              className={`prose prose-slate max-w-none font-anthropic-sans text-lg leading-relaxed ${isEditing ? 'p-6 border border-dashed border-orange-300 bg-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200' : ''}`}
              dangerouslySetInnerHTML={{ __html: initialHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
