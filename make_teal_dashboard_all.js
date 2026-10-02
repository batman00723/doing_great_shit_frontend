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
  // Skip the ones we already meticulously perfected
  if (filePath === 'src/app/(app)/layout.tsx') return;
  if (filePath === 'src/app/(app)/dashboard/page.tsx') return;
  if (filePath === 'src/app/(app)/admin/dashboard/page.tsx') return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Strip all the ugly dark: classes that the previous broken script added
  content = content.replace(/dark:[^\s"'\\]+/g, '');
  content = content.replace(/transition-colors duration-500/g, '');
  
  // Also clean up any double spaces introduced by the removal
  content = content.replace(/\s{2,}/g, ' ');

  // Now apply the hardcoded Teal theme logic!
  content = content.replace(/bg-\[\#fdfaf6\]/g, 'bg-[#050a0c]');
  content = content.replace(/bg-white\/90/g, 'bg-[#091114]/90');
  content = content.replace(/bg-white\/80/g, 'bg-[#091114]/80');
  content = content.replace(/bg-white\/50/g, 'bg-[#091114]/50');
  content = content.replace(/bg-white/g, 'bg-[#091114]');
  
  // Text colors
  content = content.replace(/text-slate-dark\/50/g, 'text-teal-100/50');
  content = content.replace(/text-slate-dark\/40/g, 'text-teal-100/40');
  content = content.replace(/text-slate-dark\/30/g, 'text-teal-100/30');
  content = content.replace(/text-slate-dark\/20/g, 'text-teal-100/20');
  content = content.replace(/text-slate-dark\/70/g, 'text-teal-100/70');
  content = content.replace(/text-slate-dark/g, 'text-white');
  
  // Borders
  content = content.replace(/border-black\/\[0\.06\]/g, 'border-teal-900/30');
  content = content.replace(/border-black\/\[0\.04\]/g, 'border-teal-900/20');
  content = content.replace(/border-black\/\[0\.05\]/g, 'border-teal-900/25');
  content = content.replace(/border-black\/10/g, 'border-teal-900/40');
  content = content.replace(/border-stone\/60/g, 'border-teal-900/20');
  
  // Background alphas
  content = content.replace(/bg-black\/\[0\.02\]/g, 'bg-teal-900/10');
  content = content.replace(/bg-black\/\[0\.03\]/g, 'bg-teal-900/10');
  content = content.replace(/bg-black\/\[0\.04\]/g, 'bg-teal-900/20');
  content = content.replace(/bg-black\/\[0\.05\]/g, 'bg-teal-900/30');
  content = content.replace(/bg-black\/\[0\.08\]/g, 'bg-teal-900/40');
  
  // Hovers
  content = content.replace(/hover:bg-black\/\[0\.03\]/g, 'hover:bg-teal-900/20');
  content = content.replace(/hover:bg-black\/\[0\.04\]/g, 'hover:bg-teal-900/30');
  content = content.replace(/hover:bg-black\/\[0\.08\]/g, 'hover:bg-teal-900/50');
  content = content.replace(/hover:bg-\[#1a1a19\]/g, 'hover:bg-teal-500/10');
  content = content.replace(/hover:bg-stone-50/g, 'hover:bg-teal-900/40');
  content = content.replace(/hover:border-black\/\[0\.15\]/g, 'hover:border-teal-500/30');
  content = content.replace(/hover:text-slate-dark/g, 'hover:text-white');
  
  // Buttons
  content = content.replace(/bg-slate-dark text-white/g, 'bg-teal-600 text-white');
  content = content.replace(/hover:bg-black/g, 'hover:bg-teal-500');
  
  // Badges
  content = content.replace(/bg-clay\/10/g, 'bg-teal-500/10');
  content = content.replace(/text-clay-deep/g, 'text-teal-400');
  content = content.replace(/border-clay\/20/g, 'border-teal-500/20');
  content = content.replace(/bg-clay animate-pulse/g, 'bg-teal-400 animate-pulse');
  
  // Inputs focus
  content = content.replace(/focus:border-clay\/50/g, 'focus:border-teal-500/50');
  content = content.replace(/focus:ring-clay\/10/g, 'focus:ring-teal-500/10');
  content = content.replace(/focus:bg-white/g, 'focus:bg-[#131b20]');

  // Shadows
  content = content.replace(/shadow-\[0_8px_30px_rgba\(0,0,0,0\.02\)\]/g, 'shadow-[0_8px_30px_rgba(0,0,0,0.4)]');
  content = content.replace(/shadow-\[0_4px_20px_rgba\(0,0,0,0\.04\)\]/g, 'shadow-[0_8px_20px_rgba(13,148,136,0.15)]');

  fs.writeFileSync(filePath, content);
  console.log("Updated: " + filePath);
});
