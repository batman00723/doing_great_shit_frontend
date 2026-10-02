const fs = require('fs');
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
  if (filePath === 'src/app/(app)/layout.tsx') return;
  if (filePath === 'src/app/(app)/dashboard/page.tsx') return;
  if (filePath === 'src/app/(app)/admin/dashboard/page.tsx') return;

  let c = fs.readFileSync(filePath, 'utf8');

  // Strip dark: classes to normalize
  c = c.replace(/dark:[^\s"'\\]+/g, '');
  c = c.replace(/transition-colors duration-500/g, '');
  
  // Grey / Off-white backgrounds -> Dark panels
  c = c.replace(/bg-\[\#f9f9f8\]/g, 'bg-[#0a1317]');
  c = c.replace(/bg-\[\#fafafa\]/g, 'bg-[#0a1317]');
  c = c.replace(/bg-\[\#f4f4f4\]/g, 'bg-[#0b161b]');
  c = c.replace(/bg-\[\#fcfcfc\]/g, 'bg-[#091114]');
  c = c.replace(/bg-\[\#f4f8f4\]/g, 'bg-[#091114]');
  c = c.replace(/bg-\[\#fdfaf6\]/g, 'bg-[#050a0c]');
  c = c.replace(/bg-white\/90/g, 'bg-[#091114]/90');
  c = c.replace(/bg-white\/80/g, 'bg-[#091114]/80');
  c = c.replace(/bg-white\/50/g, 'bg-[#091114]/50');
  c = c.replace(/bg-white/g, 'bg-[#091114]');
  
  // Success alerts
  c = c.replace(/bg-\[\#f2f8f4\]/g, 'bg-emerald-900/20');
  c = c.replace(/bg-\[\#e1f3e7\]/g, 'bg-emerald-500/20');
  c = c.replace(/text-\[\#2c7a4b\]/g, 'text-emerald-400');
  c = c.replace(/border-\[\#d0ead9\]/g, 'border-emerald-500/30');
  
  // Error alerts
  c = c.replace(/bg-\[\#fef4f4\]/g, 'bg-red-900/20');
  c = c.replace(/bg-\[\#fde8e8\]/g, 'bg-red-500/20');
  c = c.replace(/text-\[\#b93232\]/g, 'text-red-400');
  c = c.replace(/border-\[\#fbdcdc\]/g, 'border-red-500/30');

  // Text colors
  c = c.replace(/text-slate-dark\/50/g, 'text-teal-100/50');
  c = c.replace(/text-slate-dark\/40/g, 'text-teal-100/40');
  c = c.replace(/text-slate-dark\/30/g, 'text-teal-100/30');
  c = c.replace(/text-slate-dark\/20/g, 'text-teal-100/20');
  c = c.replace(/text-slate-dark\/70/g, 'text-teal-100/70');
  c = c.replace(/text-slate-dark/g, 'text-white');

  // Borders
  c = c.replace(/border-black\/\[0\.06\]/g, 'border-teal-900/30');
  c = c.replace(/border-black\/\[0\.04\]/g, 'border-teal-900/20');
  c = c.replace(/border-black\/\[0\.05\]/g, 'border-teal-900/25');
  c = c.replace(/border-black\/10/g, 'border-teal-900/40');
  c = c.replace(/border-stone\/60/g, 'border-teal-900/20');
  c = c.replace(/border-black\/\[0\.08\]/g, 'border-teal-900/40');
  c = c.replace(/focus-within:border-black\/\[0\.14\]/g, 'focus-within:border-teal-500/40');

  // Background alphas
  c = c.replace(/bg-black\/\[0\.02\]/g, 'bg-teal-900/10');
  c = c.replace(/bg-black\/\[0\.03\]/g, 'bg-teal-900/10');
  c = c.replace(/bg-black\/\[0\.04\]/g, 'bg-teal-900/20');
  c = c.replace(/bg-black\/\[0\.05\]/g, 'bg-teal-900/30');
  c = c.replace(/bg-black\/\[0\.08\]/g, 'bg-teal-900/40');
  
  // Hovers
  c = c.replace(/hover:bg-black\/\[0\.03\]/g, 'hover:bg-teal-900/20');
  c = c.replace(/hover:bg-black\/\[0\.04\]/g, 'hover:bg-teal-900/30');
  c = c.replace(/hover:bg-black\/\[0\.08\]/g, 'hover:bg-teal-900/50');
  c = c.replace(/hover:bg-\[#1a1a19\]/g, 'hover:bg-teal-500/10');
  c = c.replace(/hover:bg-stone-50/g, 'hover:bg-teal-900/40');
  c = c.replace(/hover:border-black\/\[0\.15\]/g, 'hover:border-teal-500/30');
  c = c.replace(/hover:text-slate-dark/g, 'hover:text-white');
  
  // Buttons
  c = c.replace(/bg-slate-dark text-white/g, 'bg-teal-600 text-white');
  c = c.replace(/hover:bg-black/g, 'hover:bg-teal-500');
  
  // Badges
  c = c.replace(/bg-clay\/10/g, 'bg-teal-500/10');
  c = c.replace(/text-clay-deep/g, 'text-teal-400');
  c = c.replace(/border-clay\/20/g, 'border-teal-500/20');
  c = c.replace(/bg-clay animate-pulse/g, 'bg-teal-400 animate-pulse');
  
  // Inputs focus
  c = c.replace(/focus:border-clay\/50/g, 'focus:border-teal-500/50');
  c = c.replace(/focus:ring-clay\/10/g, 'focus:ring-teal-500/10');
  c = c.replace(/focus:bg-white/g, 'focus:bg-[#131b20]');

  // Shadows
  c = c.replace(/shadow-\[0_8px_30px_rgba\(0,0,0,0\.02\)\]/g, 'shadow-[0_8px_30px_rgba(0,0,0,0.4)]');
  c = c.replace(/shadow-\[0_4px_20px_rgba\(0,0,0,0\.04\)\]/g, 'shadow-[0_8px_20px_rgba(13,148,136,0.15)]');

  // Fix white gradients in customer cards
  c = c.replace(/from-\[#fdfaf6\] to-\[#f4f0ec\]/g, 'from-[#0a1317] to-[#050a0c]');
  c = c.replace(/rgba\(255,255,255,0\.7\)/g, 'rgba(255,255,255,0.05)');

  // Clean up double spaces carefully using non-newline spaces only
  c = c.replace(/[^\S\r\n]{2,}/g, ' ');

  fs.writeFileSync(filePath, c);
});
