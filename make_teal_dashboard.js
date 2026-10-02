const fs = require('fs');

const files = [
  'src/app/(app)/layout.tsx',
  'src/app/(app)/dashboard/page.tsx',
  'src/app/(app)/admin/dashboard/page.tsx'
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Hardcode backgrounds to rich teal dark:
  content = content.replace(/bg-\[\#fdfaf6\]/g, 'bg-[#050a0c]');
  content = content.replace(/bg-white\/90/g, 'bg-[#091114]/90');
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

  // Special structural changes for dashboard/page.tsx
  if (filePath.endsWith('dashboard/page.tsx')) {
    // 1. Change grid cols from 3 to 4
    content = content.replace(
      'className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"',
      'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"'
    );
    // 2. Remove the flex-col wrapper around Quick Links so they become grid items
    content = content.replace(
      '<motion.div variants={fadeInUp} transition={springCalm} className="flex flex-col gap-4">',
      '{/* Quick links unpacked */}'
    );
    // Remove closing tags for the flex-col wrapper
    content = content.replace(
      '          </Link>\n        </motion.div>\n      </motion.div>',
      '          </Link>\n      </motion.div>'
    );
    
    // Add variants to the links directly since they are now top-level grid items
    content = content.replace(
      /<Link href="\/dashboard\/meetings" className="flex-1/g,
      '<motion.div variants={fadeInUp} transition={springCalm} className="flex h-full"><Link href="/dashboard/meetings" className="w-full h-full'
    );
    content = content.replace(
      /<span className="font-anthropic-sans font-medium text-\[14px\] text-slate-dark mt-2">All Meetings<\/span>\n          <\/Link>/g,
      '<span className="font-anthropic-sans font-medium text-[14px] text-slate-dark mt-2">All Meetings</span>\n          </Link></motion.div>'
    );
    
    content = content.replace(
      /<Link href="\/dashboard\/customers" className="flex-1/g,
      '<motion.div variants={fadeInUp} transition={springCalm} className="flex h-full"><Link href="/dashboard/customers" className="w-full h-full'
    );
    content = content.replace(
      /<span className="font-anthropic-sans font-medium text-\[14px\] text-slate-dark mt-2">Customers<\/span>\n          <\/Link>/g,
      '<span className="font-anthropic-sans font-medium text-[14px] text-slate-dark mt-2">Customers</span>\n          </Link></motion.div>'
    );

    // 3. Make the stats smaller (p-6 to p-5, text-[48px] to text-[36px], mb-16 to mb-6)
    content = content.replace(/rounded-2xl p-6/g, 'rounded-2xl p-5');
    content = content.replace(/text-\[48px\]/g, 'text-[36px]');
    content = content.replace(/mb-16/g, 'mb-6');
    
    // Gradients
    content = content.replace(/bg-\[radial-gradient\(ellipse_at_top_right,rgba\(217,119,87,0\.08\),transparent_60%\)\]/g, 'bg-[radial-gradient(ellipse_at_top_right,rgba(45,212,191,0.15),transparent_60%)]');
    content = content.replace(/bg-\[radial-gradient\(ellipse_at_bottom_right,rgba\(115,191,196,0\.1\),transparent_60%\)\]/g, 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.15),transparent_60%)]');
  }

  fs.writeFileSync(filePath, content);
  console.log("Updated: " + filePath);
});
