const fs = require('fs');
const files = [
  'E:/Projects/Meeting Intelligence Platform Frontend/src/app/(app)/layout.tsx',
  'E:/Projects/Meeting Intelligence Platform Frontend/src/app/(app)/dashboard/page.tsx'
];
const replacements = [
  [/bg-\[\#050a0c\]/g, 'bg-[#FDFCF8]'],
  [/bg-\[\#091114\]\/90/g, 'bg-[#FDFCF8]/90'],
  [/bg-\[\#091114\]/g, 'bg-[#FDFCF8]'],
  [/text-white/g, 'text-slate-900'],
  [/text-teal-100\/50/g, 'text-slate-500'],
  [/text-teal-100\/40/g, 'text-slate-500'],
  [/text-teal-100\/70/g, 'text-slate-600'],
  [/text-teal-100\/30/g, 'text-slate-400'],
  [/border-teal-900\/20/g, 'border-slate-200'],
  [/border-teal-900\/25/g, 'border-slate-200'],
  [/border-teal-900\/30/g, 'border-slate-200'],
  [/border-teal-900\/40/g, 'border-slate-300'],
  [/hover:text-white/g, 'hover:text-slate-900'],
  [/hover:bg-\[\#091114\]/g, 'hover:bg-slate-50'],
  [/bg-teal-900\/10/g, 'bg-white'],
  [/shadow-\[0_8px_30px_rgba\(0,0,0,0\.4\)\]/g, 'shadow-sm border border-slate-100'],
  [/bg-teal-600/g, 'bg-slate-900'],
  [/hover:bg-teal-500/g, 'hover:bg-slate-800'],
  [/text-teal-400/g, 'text-slate-900'],
  [/bg-teal-500\/10/g, 'bg-orange-100'],
  [/border-teal-500\/20/g, 'border-orange-200'],
  [/text-white\/70/g, 'text-slate-900/70'],
  [/text-white\/80/g, 'text-slate-900/80'],
  [/bg-[#050a0c]/g, 'bg-[#FDFCF8]'],
  [/bg-[#091114]/g, 'bg-[#FDFCF8]']
];

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (let [old, new_] of replacements) {
    content = content.replace(old, new_);
  }
  fs.writeFileSync(file, content, 'utf8');
}
