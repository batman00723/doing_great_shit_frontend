const fs = require('fs');
let c = fs.readFileSync('src/app/(app)/dashboard/page.tsx', 'utf8');

c = c.replace(
  'className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"',
  'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"'
);
c = c.replace(
  '<motion.div variants={fadeInUp} transition={springCalm} className="flex flex-col gap-4">',
  '{/* Quick links unpacked */}'
);
c = c.replace(
  '          </Link>\n        </motion.div>\n      </motion.div>',
  '          </Link>\n      </motion.div>'
);
c = c.replace(
  /<Link href="\/dashboard\/meetings" className="flex-1/g,
  '<motion.div variants={fadeInUp} transition={springCalm} className="flex h-full"><Link href="/dashboard/meetings" className="w-full h-full'
);
c = c.replace(
  /<span className="font-anthropic-sans font-medium text-\[14px\] text-slate-dark mt-2">All Meetings<\/span>\n          <\/Link>/g,
  '<span className="font-anthropic-sans font-medium text-[14px] text-slate-dark mt-2">All Meetings</span>\n          </Link></motion.div>'
);
c = c.replace(
  /<Link href="\/dashboard\/customers" className="flex-1/g,
  '<motion.div variants={fadeInUp} transition={springCalm} className="flex h-full"><Link href="/dashboard/customers" className="w-full h-full'
);
c = c.replace(
  /<span className="font-anthropic-sans font-medium text-\[14px\] text-slate-dark mt-2">Customers<\/span>\n          <\/Link>/g,
  '<span className="font-anthropic-sans font-medium text-[14px] text-slate-dark mt-2">Customers</span>\n          </Link></motion.div>'
);

c = c.replace(/rounded-2xl p-6/g, 'rounded-2xl p-5');
c = c.replace(/text-\[48px\]/g, 'text-[36px]');
c = c.replace(/mb-16/g, 'mb-6');
c = c.replace(/bg-\[radial-gradient\(ellipse_at_top_right,rgba\(217,119,87,0\.08\),transparent_60%\)\]/g, 'bg-[radial-gradient(ellipse_at_top_right,rgba(45,212,191,0.15),transparent_60%)]');
c = c.replace(/bg-\[radial-gradient\(ellipse_at_bottom_right,rgba\(115,191,196,0\.1\),transparent_60%\)\]/g, 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.15),transparent_60%)]');

fs.writeFileSync('src/app/(app)/dashboard/page.tsx', c);
