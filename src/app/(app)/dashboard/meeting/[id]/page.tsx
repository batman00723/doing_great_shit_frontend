"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    
    // 1. Clear any old highlights first
    clearHighlights();
    
    // 2. Escape search text for RegExp
    const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedFind})`, 'gi');
    let totalFound = 0;
    
    // 3. TreeWalker to find all Text Nodes
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null);
    let node;
    const textNodes = [];
    while ((node = walker.nextNode())) {
      // Don't search inside existing marks or scripts
      if (node.parentElement && node.parentElement.tagName === 'MARK') continue;
      textNodes.push(node);
    }
    
    // 4. Wrap matches in <mark> tags
    textNodes.forEach(textNode => {
      const match = textNode.nodeValue?.match(regex);
      if (match && textNode.parentNode) {
        totalFound += match.length;
        
        // We split the text node and insert <mark> tags
        const fragment = document.createDocumentFragment();
        const parts = textNode.nodeValue!.split(regex);
        
        parts.forEach(part => {
          if (part.toLowerCase() === findText.toLowerCase()) {
            const mark = document.createElement('mark');
            mark.className = 'find-highlight bg-manilla text-slate-dark rounded-[2px] px-[2px]';
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
    
    // Replace inside text nodes
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
      // Clear highlights just in case they were left
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
      <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 inline-block">
        <p className="font-anthropic-sans text-[13px] text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto pb-24 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-lg border font-anthropic-sans text-[13px] z-50 transition-all ${
          toast.type === "success" 
            ? "bg-[#f4f8f4] border-[#d2e4d2] text-[#1c4d1c]" 
            : "bg-[#fdf4f4] border-[#f0d4d4] text-[#8a2424]"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 font-anthropic-sans text-[13px] text-slate-dark/50 hover:text-slate-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="font-anthropic-sans text-[13px] text-slate-dark/60 hover:text-slate-dark px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="font-anthropic-sans font-semibold text-[13px] bg-slate-dark text-white px-5 py-2.5 rounded-lg hover:bg-black transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="font-anthropic-sans font-semibold text-[13px] text-slate-dark bg-ivory-medium border border-stone px-5 py-2.5 rounded-lg hover:bg-oat-warm transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Report
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="font-anthropic-sans font-semibold text-[13px] bg-clay text-white px-5 py-2.5 rounded-[8px] hover:bg-clay-deep transition-all flex items-center gap-2 disabled:opacity-50"
                style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {isSending ? "Sending..." : "Mail to Customer"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor Note & Find/Replace Toolbar */}
      {isEditing && (
        <div className="bg-manilla/40 border border-clay/20 rounded-xl px-5 py-4 mb-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-clay" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-anthropic-sans text-[13px] text-clay-deep">
              You are in edit mode. Click anywhere on the text below to type and make changes.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 pt-3 border-t border-clay/10">
            {/* Find Row */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-white/60 border border-clay/20 rounded-lg px-3 py-2 focus-within:border-clay/50 transition-colors">
                <svg className="w-4 h-4 text-clay-deep/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Find word..." 
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="bg-transparent border-none outline-none text-[14px] font-anthropic-sans text-slate-dark placeholder:text-slate-dark/30 w-full" 
                />
              </div>
              <button
                onClick={handleFindAll}
                disabled={!findText}
                className="shrink-0 font-anthropic-sans text-[13px] font-semibold bg-ivory-light border border-clay/30 text-clay-deep px-4 py-2 rounded-lg hover:bg-clay/10 transition-all disabled:opacity-50"
              >
                Search
              </button>
            </div>
            
            {/* Replace Row */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-white/60 border border-clay/20 rounded-lg px-3 py-2 focus-within:border-clay/50 transition-colors">
                <svg className="w-4 h-4 text-clay/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Replace with..." 
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="bg-transparent border-none outline-none text-[14px] font-anthropic-sans text-slate-dark placeholder:text-slate-dark/30 w-full" 
                />
              </div>
              <button
                onClick={handleReplaceAll}
                disabled={!findText}
                className="shrink-0 font-anthropic-sans text-[13px] font-semibold bg-clay text-white px-4 py-2 rounded-lg hover:bg-clay-deep transition-all disabled:opacity-50"
              >
                Replace All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The Report Document */}
      <div className={`bg-ivory-light rounded-[24px] p-10 md:p-16 min-h-[800px] transition-all ${
        isEditing ? "ring-2 ring-clay/30 outline-none" : "border border-stone/50"
      }`}>
        <div
          ref={editorRef}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          dangerouslySetInnerHTML={{ __html: initialHtml }}
          className={`
            outline-none
            font-anthropic-serif text-[20px] text-slate-dark leading-[1.65]
            
            /* Typography styling for the raw HTML returned by the backend */
            [&>h1]:font-anthropic-sans [&>h1]:text-[32px] [&>h1]:font-bold [&>h1]:mb-8 [&>h1]:leading-tight
            [&>h2]:font-anthropic-sans [&>h2]:text-[24px] [&>h2]:font-semibold [&>h2]:mt-10 [&>h2]:mb-4
            [&>h3]:font-anthropic-sans [&>h3]:text-[18px] [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3
            
            [&>p]:mb-5 [&>p]:text-cloud-dark
            [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:pl-2
            [&>ol]:mb-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol>li]:mb-2
            
            [&>strong]:font-semibold [&>strong]:text-slate-dark
            [&>em]:italic
            
            /* Customizing spacing inside the editor when active */
            ${isEditing ? "[&>*]:cursor-text" : ""}
          `}
        />
      </div>

    </div>
  );
}
