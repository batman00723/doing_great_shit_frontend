const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src/app/(app)');

files.forEach(filePath => {
  if (filePath === 'src/app/(app)/layout.tsx') return; // already done

  let content = fs.readFileSync(filePath, 'utf8');

  // Prevent double application by checking if we already have dark classes
  // We'll just be careful to use regex that only matches when dark: isn't already there.
  // A simple way is to replace, but then clean up duplicates.

  const replacements = [
    // Text colors
    [/text-slate-dark\b(?!\s*dark:)/g, 'text-slate-dark dark:text-white transition-colors duration-500'],
    [/text-slate-dark\/50\b(?!\s*dark:)/g, 'text-slate-dark/50 dark:text-white/50 transition-colors duration-500'],
    [/text-slate-dark\/30\b(?!\s*dark:)/g, 'text-slate-dark/30 dark:text-white/30 transition-colors duration-500'],
    [/text-slate-dark\/20\b(?!\s*dark:)/g, 'text-slate-dark/20 dark:text-white/20 transition-colors duration-500'],
    [/text-slate-dark\/70\b(?!\s*dark:)/g, 'text-slate-dark/70 dark:text-white/70 transition-colors duration-500'],
    
    // Background colors
    [/bg-white\b(?!\s*dark:)/g, 'bg-white dark:bg-[#141414] transition-colors duration-500'],
    [/bg-black\/\[0\.02\]\b(?!\s*dark:)/g, 'bg-black/[0.02] dark:bg-white/[0.02] transition-colors duration-500'],
    [/bg-black\/\[0\.03\]\b(?!\s*dark:)/g, 'bg-black/[0.03] dark:bg-white/[0.03] transition-colors duration-500'],
    [/bg-[#fdfaf6]\b(?!\s*dark:)/g, 'bg-[#fdfaf6] dark:bg-[#0a0a0a] transition-colors duration-500'],
    
    // Borders
    [/border-black\/\[0\.06\]\b(?!\s*dark:)/g, 'border-black/[0.06] dark:border-white/[0.06] transition-colors duration-500'],
    [/border-black\/\[0\.04\]\b(?!\s*dark:)/g, 'border-black/[0.04] dark:border-white/[0.04] transition-colors duration-500'],
    [/border-black\/\[0\.05\]\b(?!\s*dark:)/g, 'border-black/[0.05] dark:border-white/[0.05] transition-colors duration-500'],
    [/border-black\/10\b(?!\s*dark:)/g, 'border-black/10 dark:border-white/10 transition-colors duration-500'],
    [/border-stone\/60\b(?!\s*dark:)/g, 'border-stone/60 dark:border-white/10 transition-colors duration-500'],

    // Hovers
    [/hover:bg-\[#1a1a19\]\b(?!\s*dark:)/g, 'hover:bg-[#1a1a19] dark:hover:bg-white/10 transition-colors duration-500'],
    [/hover:text-slate-dark\b(?!\s*dark:)/g, 'hover:text-slate-dark dark:hover:text-white transition-colors duration-500'],
    [/hover:border-black\/\[0\.15\]\b(?!\s*dark:)/g, 'hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-colors duration-500'],
    
    // Buttons (bg-slate-dark to white)
    [/bg-slate-dark\b(?!\s*dark:)(?!\/)/g, 'bg-slate-dark dark:bg-white transition-colors duration-500'],
    [/text-white\b(?!\s*dark:)(?!\/)/g, 'text-white dark:text-slate-dark transition-colors duration-500'],
    [/hover:bg-black\b(?!\s*dark:)/g, 'hover:bg-black dark:hover:bg-slate-200 transition-colors duration-500'],
    
    // Modals / Dropdowns
    [/bg-white\/90\b(?!\s*dark:)/g, 'bg-white/90 dark:bg-[#141414]/90 transition-colors duration-500'],
    [/bg-white\/80\b(?!\s*dark:)/g, 'bg-white/80 dark:bg-[#141414]/80 transition-colors duration-500'],
  ];

  let newContent = content;
  replacements.forEach(([regex, replacement]) => {
    newContent = newContent.replace(regex, replacement);
  });

  // Specific fix: If a button was bg-slate-dark dark:bg-white and text-white dark:text-slate-dark,
  // the script might add transition-colors twice. Let's deduplicate transition-colors duration-500.
  newContent = newContent.replace(/(transition-colors duration-500\s*){2,}/g, 'transition-colors duration-500 ');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Applied dark mode to ${filePath}`);
  }
});
