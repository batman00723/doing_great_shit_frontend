"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp, toastVariants, hoverScale, tapScale } from "@/lib/animations";

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
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
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

  const clearHighlights = () => {
    if (!editorRef.current) return;
    const marks = editorRef.current.querySelectorAll('mark.find-highlight');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
    });
    // Merge text nodes back together
    editorRef.current.normalize();
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    setIsSaving(true);
    
    // Clear highlights before saving to DB
    clearHighlights();
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

  const handleFindAll = () => {
    if (!findText || !editorRef.current) return;
    
    clearHighlights();
    
    const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedFind})`, 'gi');
    let totalFound = 0;
    
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null);
    let node;
    const textNodes = [];
    while ((node = walker.nextNode())) {
      if (node.parentElement && node.parentElement.tagName === 'MARK') continue;
      textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
      const match = textNode.nodeValue?.match(regex);
      if (match && textNode.parentNode) {
        totalFound += match.length;
        
        const fragment = document.createDocumentFragment();
        const parts = textNode.nodeValue!.split(regex);
        
        parts.forEach(part => {
          if (part.toLowerCase() === findText.toLowerCase()) {
            const mark = document.createElement('mark');
            mark.className = 'find-highlight bg-manilla text-slate-dark rounded px-1';
            mark.textContent = part;
            fragment.appendChild(mark);
          } else if (part.length > 0) {
            fragment.appendChild(document.createTextNode(part));
          }
        });
        
        textNode.parentNode.replaceChild(fragment, textNode);
      }
    });
    
    if (totalFound > 0) {
      showToast(`Found ${totalFound} occurrence${totalFound > 1 ? 's' : ''}.`, "success");
    } else {
      showToast(`No matches found for "${findText}".`, "error");
    }
  };

  const handleReplaceAll = () => {
    if (!findText || !editorRef.current) return;
    
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null);
    let node;
    
    const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedFind, 'gi');
    let totalReplaced = 0;
    
    const nodes = [];
    while ((node = walker.nextNode())) {
      nodes.push(node);
    }
    
    nodes.forEach(n => {
      if (n.nodeValue && n.nodeValue.match(regex)) {
        const matches = n.nodeValue.match(regex);
        if (matches) {
          totalReplaced += matches.length;
        }
        n.nodeValue = n.nodeValue.replace(regex, replaceText);
      }
    });
    
    if (totalReplaced > 0) {
      clearHighlights();
      showToast(`Replaced ${totalReplaced} occurrence${totalReplaced > 1 ? 's' : ''}.`, "success");
    } else {
      showToast(`No matches found for "${findText}".`, "error");
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
      <div className="flex items-center justify-center h-64">
        <p className="font-anthropic-sans text-[13px] text-slate-dark/40">Loading report…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 inline-block">
        <p className="font-anthropic-sans text-[14px] text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[800px] mx-auto pb-32 relative mt-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`fixed bottom-8 right-8 px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border font-anthropic-sans text-[13px] font-medium z-50 flex items-center gap-3 transition-all ${
              toast.type === "success" 
                ? "bg-[#f4f8f4] border-[#d2e4d2] text-[#1c4d1c]" 
                : "bg-white border-red-200 text-red-600"
            }`}>
            {toast.type === "success" ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 font-anthropic-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-dark/40 hover:text-slate-dark transition-colors"
        >
          <div className="w-6 h-6 rounded-md bg-black/[0.03] border border-black/[0.05] flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Back
        </button>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <motion.button
                onClick={() => setIsEditing(false)}
                whileHover={hoverScale}
                whileTap={tapScale}
                className="font-anthropic-sans text-[13px] font-medium text-slate-dark/60 hover:text-slate-dark px-4 py-2 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                whileHover={hoverScale}
                whileTap={tapScale}
                className="font-anthropic-sans font-medium text-[13px] bg-slate-dark text-white px-5 py-2.5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-black transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={() => setIsEditing(true)}
                whileHover={hoverScale}
                whileTap={tapScale}
                className="font-anthropic-sans font-medium text-[13px] text-slate-dark bg-white border border-black/10 px-5 py-2.5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-stone-50 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-slate-dark/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Document
              </motion.button>
              <motion.button
                onClick={handleSendEmail}
                disabled={isSending}
                whileHover={hoverScale}
                whileTap={tapScale}
                className="font-anthropic-sans font-medium text-[13px] bg-clay text-white px-5 py-2.5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-clay-deep transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {isSending ? "Sending..." : "Email Customer"}
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Editor Note & Find/Replace Toolbar */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-black/[0.02] border border-black/[0.06] rounded-xl p-5 mb-8 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-black/[0.04] pb-3">
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
                   <span className="font-anthropic-mono text-[10px] font-bold uppercase tracking-widest text-slate-dark/60">
                     Edit Mode Active
                   </span>
                 </div>
                 <p className="font-anthropic-sans text-[12px] text-slate-dark/40">
                   Click directly into the document to edit.
                 </p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3 pt-1">
                {/* Find Input */}
                <div className="flex-1 flex items-center gap-2 bg-white border border-black/[0.08] rounded-lg px-3 py-2 shadow-sm focus-within:border-clay/50 transition-colors">
                  <svg className="w-5 h-5 text-slate-dark/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Find in document..." 
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    className="bg-transparent border-none outline-none font-anthropic-mono text-[13px] text-slate-dark placeholder:text-slate-dark/30 w-full" 
                  />
                  <button onClick={handleFindAll} disabled={!findText} className="font-anthropic-sans text-[11px] font-medium bg-black/[0.04] px-2 py-1 rounded text-slate-dark hover:bg-black/[0.08] transition-colors disabled:opacity-50">Find</button>
                </div>
                
                {/* Replace Input */}
                <div className="flex-1 flex items-center gap-2 bg-white border border-black/[0.08] rounded-lg px-3 py-2 shadow-sm focus-within:border-clay/50 transition-colors">
                  <svg className="w-5 h-5 text-slate-dark/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Replace with..." 
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    className="bg-transparent border-none outline-none font-anthropic-mono text-[13px] text-slate-dark placeholder:text-slate-dark/30 w-full" 
                  />
                  <button onClick={handleReplaceAll} disabled={!findText} className="font-anthropic-sans text-[11px] font-medium bg-slate-dark text-white px-2 py-1 rounded hover:bg-black transition-colors disabled:opacity-50">Replace</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Report Document */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className={`bg-white rounded-2xl p-10 md:p-14 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all ${
        isEditing ? "ring-2 ring-clay/30 outline-none border border-clay/20" : "border border-black/[0.06]"
      }`}>
        <div
          ref={editorRef}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          dangerouslySetInnerHTML={{ __html: initialHtml }}
          className={`
            outline-none
            font-anthropic-serif text-[18px] text-slate-dark leading-[1.7]
            
            /* Typography styling for the raw HTML returned by the backend */
            [&>h1]:font-anthropic-serif [&>h1]:text-[36px] [&>h1]:tracking-tight [&>h1]:mb-8 [&>h1]:leading-[1.1]
            [&>h2]:font-anthropic-sans [&>h2]:text-[20px] [&>h2]:font-semibold [&>h2]:tracking-tight [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:border-b [&>h2]:border-black/[0.04] [&>h2]:pb-2
            [&>h3]:font-anthropic-sans [&>h3]:text-[16px] [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:uppercase [&>h3]:tracking-wider [&>h3]:text-slate-dark/70
            
            [&>p]:mb-6 [&>p]:text-slate-dark/80
            [&>ul]:mb-8 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:pl-1 [&>ul>li]:text-slate-dark/80
            [&>ol]:mb-8 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol>li]:mb-2 [&>ol>li]:text-slate-dark/80
            
            [&>strong]:font-semibold [&>strong]:text-slate-dark
            [&>em]:italic
            
            /* Customizing spacing inside the editor when active */
            ${isEditing ? "[&>*]:cursor-text" : ""}
          `}
        />
      </motion.div>

    </div>
  );
}
