const fs = require('fs');

const fixFile = (path) => {
  let code = fs.readFileSync(path, 'utf8');
  
  // Text colors missed earlier
  code = code.replace(/text-slate-900(?! dark:)/g, 'text-slate-900 dark:text-white transition-colors duration-500');
  code = code.replace(/text-slate-800(?! dark:)/g, 'text-slate-800 dark:text-white transition-colors duration-500');
  code = code.replace(/text-slate-500(?! dark:)/g, 'text-slate-500 dark:text-white/60 transition-colors duration-500');
  
  // Specific hero section mockup colors
  code = code.replace(/text-blue-700(?! dark:)/g, 'text-blue-700 dark:text-blue-400 transition-colors duration-500');
  code = code.replace(/text-green-700(?! dark:)/g, 'text-green-700 dark:text-green-400 transition-colors duration-500');
  code = code.replace(/text-green-600(?! dark:)/g, 'text-green-600 dark:text-green-400 transition-colors duration-500');
  code = code.replace(/text-emerald-400(?! dark:)/g, 'text-emerald-400 dark:text-emerald-300 transition-colors duration-500');
  
  // Backgrounds missed earlier
  code = code.replace(/bg-stone-100(?! dark:)/g, 'bg-stone-100 dark:bg-white/5 transition-colors duration-500');
  code = code.replace(/bg-blue-50(?! dark:)/g, 'bg-blue-50 dark:bg-blue-900/30 transition-colors duration-500');
  code = code.replace(/bg-green-50(?! dark:)/g, 'bg-green-50 dark:bg-green-900/30 transition-colors duration-500');
  
  fs.writeFileSync(path, code);
};

fixFile('src/components/landing/HeroSection.tsx');
fixFile('src/components/landing/PremiumFeatures.tsx');
fixFile('src/components/landing/PremiumBento.tsx');

console.log('Fixed');
