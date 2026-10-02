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
    [/bg-white\b(?!\s*dark:)/g, 'bg-white dark:bg-[#091114] transition-colors duration-500'],
    [/bg-black\/\[0\.02\]\b(?!\s*dark:)/g, 'bg-black/[0.02] dark:bg-white/[0.02] transition-colors duration-500'],
    [/bg-black\/\[0\.03\]\b(?!\s*dark:)/g, 'bg-black/[0.03] dark:bg-white/[0.03] transition-colors duration-500'],
    [/bg-\[#fdfaf6\]\b(?!\s*dark:)/g, 'bg-[#fdfaf6] dark:bg-[#050a0c] transition-colors duration-500'],
    
    // Borders
    [/border-black\/\[0\.06\]\b(?!\s*dark:)/g, 'border-black/[0.06] dark:border-teal-900/30 transition-colors duration-500'],
    [/border-black\/\[0\.04\]\b(?!\s*dark:)/g, 'border-black/[0.04] dark:border-teal-900/20 transition-colors duration-500'],
    [/border-black\/\[0\.05\]\b(?!\s*dark:)/g, 'border-black/[0.05] dark:border-teal-900/25 transition-colors duration-500'],
    [/border-black\/10\b(?!\s*dark:)/g, 'border-black/10 dark:border-teal-900/40 transition-colors duration-500'],
    [/border-stone\/60\b(?!\s*dark:)/g, 'border-stone/60 dark:border-teal-900/20 transition-colors duration-500'],

    // Hovers
    [/hover:bg-\[#1a1a19\]\b(?!\s*dark:)/g, 'hover:bg-[#1a1a19] dark:hover:bg-teal-500/10 transition-colors duration-500'],
    [/hover:text-slate-dark\b(?!\s*dark:)/g, 'hover:text-slate-dark dark:hover:text-white transition-colors duration-500'],
    [/hover:border-black\/\[0\.15\]\b(?!\s*dark:)/g, 'hover:border-black/[0.15] dark:hover:border-teal-500/30 transition-colors duration-500'],
    
    // Buttons (bg-slate-dark to teal-500)
    [/bg-slate-dark\b(?!\s*dark:)(?!\/)/g, 'bg-slate-dark dark:bg-teal-600 transition-colors duration-500'],
    [/text-white\b(?!\s*dark:)(?!\/)/g, 'text-white dark:text-white transition-colors duration-500'],
    [/hover:bg-black\b(?!\s*dark:)/g, 'hover:bg-black dark:hover:bg-teal-500 transition-colors duration-500'],
    
    // Modals / Dropdowns
    [/bg-white\/90\b(?!\s*dark:)/g, 'bg-white/90 dark:bg-[#091114]/90 transition-colors duration-500'],
    [/bg-white\/80\b(?!\s*dark:)/g, 'bg-white/80 dark:bg-[#091114]/80 transition-colors duration-500'],
  ];

  let newContent = content;
  replacements.forEach(([regex, replacement]) => {
    newContent = newContent.replace(regex, replacement);
  });

  // Special structural changes for dashboard/page.tsx
  if (filePath.endsWith('dashboard/page.tsx')) {
    // 1. Change grid cols from 3 to 4
    newContent = newContent.replace(
      'className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"',
      'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"'
    );
    // 2. Remove the flex-col wrapper around Quick Links so they become grid items
    newContent = newContent.replace(
      '<motion.div variants={fadeInUp} transition={springCalm} className="flex flex-col gap-4">',
      '{/* Quick links unpacked */}'
    );
    // Remove closing tags for the flex-col wrapper
    newContent = newContent.replace(
      '          </Link>\n        </motion.div>\n      </motion.div>',
      '          </Link>\n      </motion.div>'
    );
    
    // Add variants to the links directly since they are now top-level grid items
    newContent = newContent.replace(
      /<Link href="\/dashboard\/meetings" className="flex-1/g,
      '<motion.div variants={fadeInUp} transition={springCalm} className="flex h-full"><Link href="/dashboard/meetings" className="w-full h-full'
    );
    newContent = newContent.replace(
      /<span className="font-anthropic-sans font-medium text-\[14px\] text-slate-dark mt-2">All Meetings<\/span>\n          <\/Link>/g,
      '<span className="font-anthropic-sans font-medium text-[14px] text-slate-dark mt-2">All Meetings</span>\n          </Link></motion.div>'
    );
    
    newContent = newContent.replace(
      /<Link href="\/dashboard\/customers" className="flex-1/g,
      '<motion.div variants={fadeInUp} transition={springCalm} className="flex h-full"><Link href="/dashboard/customers" className="w-full h-full'
    );
    newContent = newContent.replace(
      /<span className="font-anthropic-sans font-medium text-\[14px\] text-slate-dark mt-2">Customers<\/span>\n          <\/Link>/g,
      '<span className="font-anthropic-sans font-medium text-[14px] text-slate-dark mt-2">Customers</span>\n          </Link></motion.div>'
    );

    // 3. Make the stats smaller (p-6 to p-5, text-[48px] to text-[36px], mb-16 to mb-6)
    newContent = newContent.replace(/rounded-2xl p-6/g, 'rounded-2xl p-5');
    newContent = newContent.replace(/text-\[48px\]/g, 'text-[36px]');
    newContent = newContent.replace(/mb-16/g, 'mb-6');
  }

  // Specific fix: If a button was bg-slate-dark dark:bg-white and text-white dark:text-slate-dark,
  // the script might add transition-colors twice. Let's deduplicate transition-colors duration-500.
  newContent = newContent.replace(/(transition-colors duration-500\s*){2,}/g, 'transition-colors duration-500 ');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Applied dark mode to ${filePath}`);
  }
});
