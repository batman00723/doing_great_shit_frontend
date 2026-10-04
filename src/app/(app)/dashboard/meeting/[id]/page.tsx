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
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

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

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
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
        showToast("Email successfully sent to customer!", "success");
      } else {
        showToast(data?.detail || data?.message || "Failed to send email.", "error");
      }
    } catch {
      showToast("Network error. Could not send email.", "error");
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
              className="font-anthropic-mono text-[10px] uppercase tracking-widest px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50 w-full text-center"
            >
              {isSending ? "Sharing..." : "Share to Customer"}
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
