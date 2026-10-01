const fs = require('fs');

const path = 'src/components/landing/PremiumFeatures.tsx';
let code = fs.readFileSync(path, 'utf8');

const newSidebarItem = `function SidebarItem({ feature, isActive }: { feature: typeof features[0], isActive: boolean }) {
  return (
    <div className="relative pl-8 lg:pl-10 py-6 cursor-default group">
      {/* Sleek Vertical Tracking Line */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-stone-200/50 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={false}
          animate={{ height: isActive ? '100%' : '0%' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full absolute top-0 left-0 rounded-full"
          style={{ backgroundColor: feature.accent }}
        />
      </div>
      
      <div className={\`flex flex-col gap-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] \${isActive ? 'opacity-100 translate-x-2' : 'opacity-30 translate-x-0 hover:opacity-50'}\`}>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[12px] font-bold tracking-widest text-slate-400 dark:text-white/40">
            {feature.num}
          </span>
          <h3 className="font-serif text-[32px] lg:text-[42px] leading-[1.1] font-medium tracking-tight text-slate-900 dark:text-white transition-colors duration-500">
            {feature.title}
          </h3>
        </div>
        
        <motion.div
          initial={false}
          animate={{ 
            height: isActive ? 'auto' : 0, 
            opacity: isActive ? 1 : 0
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <p className="text-[15px] lg:text-[16px] leading-[1.6] text-slate-500 dark:text-white/60 max-w-[340px] pl-[36px] pb-2">
            {feature.desc}
          </p>
        </motion.div>
      </div>
    </div>
  );
}`;

// Use regex to replace the old SidebarItem
const regex = /function SidebarItem\(\{ feature, isActive.*?(?=\/\/ ─── Newspaper Image Stack)/s;
code = code.replace(regex, newSidebarItem + '\n\n');

fs.writeFileSync(path, code);
console.log('SidebarItem redesigned to ultimate minimalism successfully');
