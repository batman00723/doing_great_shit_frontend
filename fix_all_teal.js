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
  let c = fs.readFileSync(filePath, 'utf8');

  // Fix all the spacing and broken regex bugs from earlier
  c = c.replace(/text-white \/([0-9]{2})/g, 'text-teal-100/$1');
  c = c.replace(/text-teal-100\/50 \/([0-9]{2})/g, 'text-teal-100/$1');
  c = c.replace(/dark:text-white/g, '');
  c = c.replace(/dark:bg-\[#[A-Fa-f0-9]+\]/g, '');
  c = c.replace(/dark:hover:bg-\[#[A-Fa-f0-9]+\]/g, '');
  c = c.replace(/dark:border-[A-Za-z0-9\-\/]+/g, '');
  c = c.replace(/transition-colors duration-500/g, '');
  
  // Grey / Off-white backgrounds -> Dark panels
  c = c.replace(/bg-\[\#f9f9f8\]/g, 'bg-[#0a1317]');
  c = c.replace(/bg-\[\#fafafa\]/g, 'bg-[#0a1317]');
  c = c.replace(/bg-\[\#f4f4f4\]/g, 'bg-[#0b161b]');
  c = c.replace(/bg-\[\#fcfcfc\]/g, 'bg-[#091114]');
  c = c.replace(/bg-\[\#f4f8f4\]/g, 'bg-[#091114]');
  c = c.replace(/bg-\[\#fdfaf6\]/g, 'bg-[#050a0c]');
  
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

  // Other borders
  c = c.replace(/border-black\/\[0\.08\]/g, 'border-teal-900/40');
  c = c.replace(/focus-within:border-black\/\[0\.14\]/g, 'focus-within:border-teal-500/40');
  
  // Misc
  c = c.replace(/text-slate-dark\/50/g, 'text-teal-100/50');
  c = c.replace(/text-slate-dark/g, 'text-white');
  c = c.replace(/bg-slate-dark/g, 'bg-teal-600');

  // Specific fix for admin/dashboard/page.tsx: "Active Members" and "Invite Member" headers have a white background because it was bg-[#fafafa].
  // The above regex will change bg-[#fafafa] to bg-[#0a1317].
  
  // Fix the missing customer strip / search bar backgrounds
  // In customers, we have `<div className="flex items-center gap-1 bg-white...` -> Wait, `bg-white` is already changed to `bg-[#091114]` by `make_teal_dashboard_all.js`!
  // But wait, the background might STILL be white because of `className="w-full bg-white dark:bg-[#091114]...`. The dark classes are stripped now.
  // So `bg-white` might still be there if `make_teal_dashboard_all.js` didn't catch it properly!
  // Let's globally replace `bg-white` to `bg-[#091114]` again to be absolutely sure.
  c = c.replace(/bg-white\/90/g, 'bg-[#091114]/90');
  c = c.replace(/bg-white\/80/g, 'bg-[#091114]/80');
  c = c.replace(/bg-white\/50/g, 'bg-[#091114]/50');
  c = c.replace(/bg-white/g, 'bg-[#091114]');
  
  // Also clean up any double spaces introduced by the removal
  c = c.replace(/\s{2,}/g, ' ');

  fs.writeFileSync(filePath, c);
});
