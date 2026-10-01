const fs = require('fs');

const fixFile = (path) => {
  let code = fs.readFileSync(path, 'utf8');
  
  // Text colors
  code = code.replace(/text-slate-800(?! dark:)/g, 'text-slate-800 dark:text-white transition-colors duration-500');
  code = code.replace(/text-slate-500(?! dark:)/g, 'text-slate-500 dark:text-white/60 transition-colors duration-500');
  code = code.replace(/text-slate-700(?! dark:)/g, 'text-slate-700 dark:text-white/80 transition-colors duration-500');
  code = code.replace(/text-slate-600(?! dark:)/g, 'text-slate-600 dark:text-white/70 transition-colors duration-500');
  
  // Backgrounds
  code = code.replace(/bg-\[\#fdfaf6\]\/60(?! dark:)/g, 'bg-[#fdfaf6]/60 dark:bg-[#141414]/90 transition-colors duration-500');
  code = code.replace(/bg-ivory-light(?! dark:)/g, 'bg-ivory-light dark:bg-[#141414] transition-colors duration-500');
  code = code.replace(/bg-white\/40(?! dark:)/g, 'bg-white/40 dark:bg-white/5 transition-colors duration-500');
  code = code.replace(/bg-white\/95(?! dark:)/g, 'bg-white/95 dark:bg-[#141414]/95 transition-colors duration-500');
  code = code.replace(/bg-white\/80(?! dark:)/g, 'bg-white/80 dark:bg-white/10 transition-colors duration-500');
  code = code.replace(/bg-white\/70(?! dark:)/g, 'bg-white/70 dark:bg-white/10 transition-colors duration-500');
  
  // Make sure we only replace exact bg-white that is not followed by a slash or a dark variant
  code = code.replace(/bg-white(?!\/)(?! dark:)/g, 'bg-white dark:bg-[#1a1a1a] transition-colors duration-500');
  
  // Borders
  code = code.replace(/border-stone\/10(?! dark:)/g, 'border-stone/10 dark:border-white/10 transition-colors duration-500');
  code = code.replace(/border-stone\/20(?! dark:)/g, 'border-stone/20 dark:border-white/10 transition-colors duration-500');
  code = code.replace(/border-stone-100(?! dark:)/g, 'border-stone-100 dark:border-white/10 transition-colors duration-500');
  code = code.replace(/border-stone-200(?! dark:)/g, 'border-stone-200 dark:border-white/20 transition-colors duration-500');

  fs.writeFileSync(path, code);
};

fixFile('src/components/landing/HeroSection.tsx');
fixFile('src/components/landing/PremiumFeatures.tsx');
fixFile('src/components/landing/PremiumBento.tsx');

console.log('Fixed');
