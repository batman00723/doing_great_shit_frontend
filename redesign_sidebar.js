const fs = require('fs');

const path = 'src/components/landing/PremiumFeatures.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add lucide import
if (!code.includes('lucide-react')) {
  code = code.replace(
    'import React, { useRef, useState } from "react";',
    'import React, { useRef, useState } from "react";\nimport { Send, Database, CheckSquare, ShieldCheck } from "lucide-react";'
  );
}

// 2. Replace the features array
const featuresArrayOld = `const features = [
  {
    num: "01",
    title: "Email Automation",
    desc: "Meeting reports sent directly to your clients' mailboxes the moment you hang up. Smriti handles the formatting, tone, and delivery automatically.",
    accent: "#c86450",
    visual: <EmailVisual />,
  },
  {
    num: "02",
    title: "Global Memory",
    desc: "Query and chat with all your past meetings instantly. Ask broad questions across your entire customer base or drill down into specific commitments.",
    accent: "#7c6af5",
    visual: <MemoryVisual />,
  },
  {
    num: "03",
    title: "Action Items",
    desc: "Instantly extract next steps and commitments from every call. Our models are fine-tuned to distinguish passing remarks from concrete promises.",
    accent: "#2da882",
    visual: <ActionsVisual />,
  },
  {
    num: "04",
    title: "Enterprise Security",
    desc: "Multi-tenant architecture ensuring your data is completely isolated. We never use your customer data to train our foundational models.",
    accent: "#6366f1",
    visual: <SecurityVisual />,
  },
];`;

const featuresArrayNew = `const features = [
  {
    num: "01",
    title: "Email Automation",
    desc: "Meeting reports sent directly to your clients' mailboxes the moment you hang up. Smriti handles the formatting, tone, and delivery automatically.",
    accent: "#c86450",
    visual: <EmailVisual />,
    icon: Send,
  },
  {
    num: "02",
    title: "Global Memory",
    desc: "Query and chat with all your past meetings instantly. Ask broad questions across your entire customer base or drill down into specific commitments.",
    accent: "#7c6af5",
    visual: <MemoryVisual />,
    icon: Database,
  },
  {
    num: "03",
    title: "Action Items",
    desc: "Instantly extract next steps and commitments from every call. Our models are fine-tuned to distinguish passing remarks from concrete promises.",
    accent: "#2da882",
    visual: <ActionsVisual />,
    icon: CheckSquare,
  },
  {
    num: "04",
    title: "Enterprise Security",
    desc: "Multi-tenant architecture ensuring your data is completely isolated. We never use your customer data to train our foundational models.",
    accent: "#6366f1",
    visual: <SecurityVisual />,
    icon: ShieldCheck,
  },
];`;

code = code.replace(featuresArrayOld, featuresArrayNew);

// 3. Replace SidebarItem component using regex to capture everything between SidebarItem signature and its end
const newSidebarItem = `function SidebarItem({ feature, isActive }: { feature: typeof features[0], isActive: boolean }) {
  const Icon = feature.icon;
  
  return (
    <div 
      className={\`group relative flex flex-col p-6 lg:p-8 rounded-[24px] cursor-default transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden \${
        isActive 
          ? 'bg-white dark:bg-[#141414] shadow-[0_8px_40px_rgba(0,0,0,0.04)] ring-1 ring-stone-200/50 dark:ring-white/10 translate-x-2' 
          : 'bg-transparent ring-0 translate-x-0 opacity-40 hover:opacity-70'
      }\`}
    >
      {/* Subtle active background glow */}
      {isActive && (
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]"
          style={{ background: \`linear-gradient(135deg, \${feature.accent} 0%, transparent 100%)\` }}
        />
      )}

      <div className="relative z-10 flex items-start gap-5">
        {/* Icon Container */}
        <div 
          className={\`shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center transition-all duration-500 \${
            isActive ? 'bg-white dark:bg-white/10 shadow-sm ring-1 ring-black/5 dark:ring-white/10 scale-100' : 'bg-stone-100 dark:bg-white/5 scale-90'
          }\`}
        >
          <Icon 
            className="w-5 h-5 transition-colors duration-500" 
            style={{ color: isActive ? feature.accent : 'currentColor' }} 
            strokeWidth={isActive ? 2.5 : 2}
          />
        </div>

        {/* Text Container */}
        <div className="flex flex-col gap-2 pt-1.5">
          <div className="flex items-center gap-3">
             <span className={\`font-mono text-[10px] font-bold tracking-[0.2em] transition-colors duration-500 \${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}\`}>
               {feature.num}
             </span>
             <h3 className={\`font-serif text-[22px] lg:text-[26px] leading-none font-semibold transition-colors duration-500 tracking-tight \${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/60'}\`}>
               {feature.title}
             </h3>
          </div>
          
          <motion.div
            initial={false}
            animate={{ 
              height: isActive ? 'auto' : 0, 
              opacity: isActive ? 1 : 0,
              marginTop: isActive ? 8 : 0
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[15px] leading-[1.6] text-slate-500 dark:text-white/60 max-w-[320px] transition-colors duration-500">
              {feature.desc}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}`;

// I need to properly replace the old SidebarItem. 
// It starts with 'function SidebarItem' and ends before '// ─── Newspaper Image Stack'
const regex = /function SidebarItem\(\{ feature, isActive.*?(?=\/\/ ─── Newspaper Image Stack)/s;
code = code.replace(regex, newSidebarItem + '\n\n');

fs.writeFileSync(path, code);
console.log('SidebarItem redesigned successfully');
