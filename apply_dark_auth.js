const fs = require('fs');

function applyDarkMode(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Background
  content = content.replace('bg-[#fdfaf6] flex', 'bg-[#fdfaf6] dark:bg-[#0a0a0a] transition-colors duration-500 flex');

  // Mobile logo
  content = content.replace('text-slate-dark mb-12 block', 'text-slate-dark dark:text-white mb-12 block transition-colors duration-500');

  // Heading
  content = content.replace('text-slate-dark mb-2', 'text-slate-dark dark:text-white mb-2 transition-colors duration-500');

  // Subheading
  content = content.replace('text-slate-dark/60 mb-10', 'text-slate-dark/60 dark:text-white/60 mb-10 transition-colors duration-500');

  // Labels
  content = content.replaceAll('text-slate-dark/70', 'text-slate-dark/70 dark:text-white/60 transition-colors duration-500');

  // Inputs
  content = content.replaceAll(
    'bg-white/50 border border-stone/60 text-slate-dark font-anthropic-sans text-[15px] px-4 py-3.5 rounded-xl outline-none focus:border-clay/50 focus:ring-1 focus:ring-clay/20 transition-all placeholder:text-slate-dark/30',
    'bg-white/50 dark:bg-white/5 border border-stone/60 dark:border-white/10 text-slate-dark dark:text-white font-anthropic-sans text-[15px] px-4 py-3.5 rounded-xl outline-none focus:border-clay/50 dark:focus:border-clay/40 focus:ring-1 focus:ring-clay/20 dark:focus:ring-clay/10 transition-all placeholder:text-slate-dark/30 dark:placeholder:text-white/30'
  );

  // Small links (Forgot password, TOS, etc)
  content = content.replaceAll('text-slate-dark/50 hover:text-slate-dark', 'text-slate-dark/50 dark:text-white/50 hover:text-slate-dark dark:hover:text-white');
  
  // Section Headers in register
  content = content.replaceAll('text-slate-dark/40 mb-4 border-b border-stone/60 pb-2', 'text-slate-dark/40 dark:text-white/40 mb-4 border-b border-stone/60 dark:border-white/10 pb-2 transition-colors duration-500');

  // Submit button
  content = content.replace(
    'w-full bg-slate-dark text-white font-anthropic-sans font-medium text-[15px] py-4 rounded-full hover:bg-black transition-colors',
    'w-full bg-slate-dark dark:bg-white text-white dark:text-slate-dark font-anthropic-sans font-medium text-[15px] py-4 rounded-full hover:bg-black dark:hover:bg-slate-200 transition-colors'
  );

  // Error box
  content = content.replace(
    'bg-red-50 border border-red-200 rounded-xl px-4 py-3',
    'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3 transition-colors duration-500'
  );
  content = content.replace(
    'text-[13px] text-red-600',
    'text-[13px] text-red-600 dark:text-red-400'
  );

  // Update left panel "Smriti Intelligence" badge to just "Smriti"
  content = content.replace(
    '<span className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-clay-deep">\n              Smriti Intelligence\n            </span>',
    '<span className="font-anthropic-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-clay-deep">\n              Smriti\n            </span>'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated dark mode for ${filePath}`);
}

applyDarkMode('src/app/login/page.tsx');
applyDarkMode('src/app/register/page.tsx');
