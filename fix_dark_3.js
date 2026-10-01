const fs = require('fs');

const fixFile = (path) => {
  let code = fs.readFileSync(path, 'utf8');
  
  // Slate Dark Text
  code = code.replace(/text-slate-dark(?!(\/| dark:))/g, 'text-slate-dark dark:text-white transition-colors duration-500');
  code = code.replace(/text-slate-dark\/50(?! dark:)/g, 'text-slate-dark/50 dark:text-white/50 transition-colors duration-500');
  code = code.replace(/text-slate-dark\/70(?! dark:)/g, 'text-slate-dark/70 dark:text-white/70 transition-colors duration-500');

  // Background colors in mockups
  code = code.replace(/bg-green-100(?! dark:)/g, 'bg-green-100 dark:bg-green-900/30 transition-colors duration-500');
  code = code.replace(/border-green-200(?! dark:)/g, 'border-green-200 dark:border-green-800/30 transition-colors duration-500');
  code = code.replace(/bg-\[\#fff9f9\](?! dark:)/g, 'bg-[#fff9f9] dark:bg-red-950/20 transition-colors duration-500');
  code = code.replace(/text-\[\#902525\](?! dark:)/g, 'text-[#902525] dark:text-red-300 transition-colors duration-500');
  code = code.replace(/border-\[\#f0d4d4\](?! dark:)/g, 'border-[#f0d4d4] dark:border-red-900/40 transition-colors duration-500');
  code = code.replace(/bg-red-100(?! dark:)/g, 'bg-red-100 dark:bg-red-900/40 transition-colors duration-500');
  code = code.replace(/border-stone\/30(?! dark:)/g, 'border-stone/30 dark:border-white/20 transition-colors duration-500');

  // Any left over
  fs.writeFileSync(path, code);
};

fixFile('src/components/landing/HeroSection.tsx');
fixFile('src/components/landing/PremiumFeatures.tsx');
fixFile('src/components/landing/PremiumBento.tsx');

console.log('Fixed text-slate-dark and remaining hardcoded mockup colors');
