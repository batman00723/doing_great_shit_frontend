const fs = require('fs');

function applyDashboardLayoutDarkMode(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add ThemeToggle import if not exists
  if (!content.includes('import { ThemeToggle }')) {
    content = content.replace(
      'import {',
      'import { ThemeToggle } from "@/components/ThemeToggle";\nimport {'
    );
  }

  // Inject ThemeToggle into header right side
  content = content.replace(
    '{/* Right side — user pill */}',
    '{/* Right side — user pill */}\n          <div className="flex items-center gap-4">\n            <ThemeToggle />'
  );
  content = content.replace(
    '</motion.header>',
    '  </div>\n        </motion.header>'
  );

  // Outer Wrapper
  content = content.replace('bg-[#fdfaf6] flex', 'bg-[#fdfaf6] dark:bg-[#0a0a0a] transition-colors duration-500 flex');

  // Sidebar background and border
  content = content.replace(
    'bg-[#fdfaf6] border-r border-black/[0.04]',
    'bg-[#fdfaf6] dark:bg-[#0a0a0a] border-r border-black/[0.04] dark:border-white/[0.04] transition-colors duration-500'
  );

  // Sidebar toggle button
  content = content.replace(
    'bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-slate-dark/40 hover:text-slate-dark hover:bg-white',
    'bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-center text-slate-dark/40 dark:text-white/40 hover:text-slate-dark dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
  );

  // Logo
  content = content.replace(
    'text-slate-dark mb-10',
    'text-slate-dark dark:text-white mb-10'
  );

  // Active indicator
  content = content.replace(
    'bg-stone/10 rounded-xl',
    'bg-stone/10 dark:bg-white/10 rounded-xl'
  );

  // Nav link text
  content = content.replace(
    'isActive ? "text-slate-dark" : "text-slate-dark/50 hover:text-slate-dark"',
    'isActive ? "text-slate-dark dark:text-white" : "text-slate-dark/50 dark:text-white/50 hover:text-slate-dark dark:hover:text-white"'
  );

  // Sidebar footer border
  content = content.replace(
    'border-t border-black/[0.04]',
    'border-t border-black/[0.04] dark:border-white/[0.04]'
  );

  // User details
  content = content.replace(
    'text-slate-dark font-medium',
    'text-slate-dark dark:text-white font-medium'
  );
  content = content.replace(
    'text-slate-dark/50 truncate',
    'text-slate-dark/50 dark:text-white/50 truncate'
  );
  content = content.replace(
    'bg-slate-dark text-white flex',
    'bg-slate-dark dark:bg-white text-white dark:text-slate-dark flex'
  );

  // Logout button
  content = content.replace(
    'text-slate-dark/40 hover:text-slate-dark transition-colors',
    'text-slate-dark/40 dark:text-white/40 hover:text-slate-dark dark:hover:text-white transition-colors'
  );
  content = content.replace(
    'hover:bg-black/[0.03]',
    'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
  );

  // Main content area wrapper
  content = content.replace(
    'flex-1 flex flex-col min-w-0 bg-white',
    'flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0a0a0a] transition-colors duration-500'
  );

  // Header
  content = content.replace(
    'bg-white/90 backdrop-blur-md border-b border-black/[0.04]',
    'bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-black/[0.04] dark:border-white/[0.04] transition-colors duration-500'
  );

  // Header Nav links
  content = content.replace(
    'isLinkActive(link.href) ? "font-bold text-slate-dark" : "font-medium text-slate-dark/40 hover:text-slate-dark"',
    'isLinkActive(link.href) ? "font-bold text-slate-dark dark:text-white" : "font-medium text-slate-dark/40 dark:text-white/40 hover:text-slate-dark dark:hover:text-white"'
  );

  // Header User Pill
  content = content.replace(
    'text-slate-dark bg-black/[0.02] border border-black/[0.06]',
    'text-slate-dark dark:text-white bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]'
  );
  content = content.replace(
    'hover:bg-black/[0.04]',
    'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
  );
  content = content.replace(
    'bg-slate-dark text-white flex items-center justify-center text-[10px] font-bold',
    'bg-slate-dark dark:bg-white text-white dark:text-slate-dark flex items-center justify-center text-[10px] font-bold transition-colors duration-500'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated dark mode for ${filePath}`);
}

applyDashboardLayoutDarkMode('src/app/(app)/layout.tsx');
