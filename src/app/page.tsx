import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* 1. Top Navbar */}
      <nav className="w-full sticky top-0 z-50 bg-ivory-medium/90 backdrop-blur-sm border-b border-stone/30">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-anthropic-sans font-bold text-[12px] uppercase tracking-wider text-slate-dark">
            Smriti
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#capabilities" className="font-anthropic-sans text-[13px] text-slate-dark/70 hover:text-slate-dark transition-colors">Features</Link>
            <Link href="#why" className="font-anthropic-sans text-[13px] text-slate-dark/70 hover:text-slate-dark transition-colors">Why Smriti</Link>
            <Link href="/login" className="font-anthropic-sans text-[13px] text-slate-dark/70 hover:text-slate-dark transition-colors">Sign in</Link>
          </div>
          <Link
            href="/register"
            className="font-anthropic-sans font-semibold text-[13px] bg-slate-dark text-white px-5 py-2.5 rounded-lg hover:bg-black transition-all"
          >
            Try Smriti
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="w-full max-w-[1280px] mx-auto px-6 pt-[80px] pb-[120px] grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="flex flex-col lg:pl-24">
          <span className="font-anthropic-sans text-[12px] uppercase tracking-[0.15em] text-slate-dark/50 mb-6">AI for Sales Teams</span>
          <h1 className="font-anthropic-serif font-semibold text-[61px] md:text-[68px] leading-[1.1] text-slate-dark -ml-1 mb-8">
            Meet Smriti
          </h1>
          <p className="font-anthropic-serif text-[20px] leading-[1.4] text-slate-dark max-w-[540px] mb-12">
            Smriti is AI for your sales team. Whether you're a single founder or
            an enterprise with thousands of reps, Smriti is here to automate
            your meeting intelligence.
          </p>
          <div className="flex flex-row gap-6 items-center">
            <Link
              href="/register"
              className="font-anthropic-sans font-semibold tracking-wide text-sm bg-slate-dark text-white px-[32px] py-[14px] rounded-lg hover:bg-black transition-all shadow-sm hover:shadow-md"
            >
              Try Smriti
            </Link>
            <Link
              href="/login"
              className="font-anthropic-sans font-semibold tracking-wide text-sm border-2 border-slate-dark text-slate-dark px-[24px] py-[14px] rounded-[12px] hover:bg-slate-dark hover:text-white transition-all"
            >
              Already a member?
            </Link>
          </div>
        </div>
        <div className="relative w-full aspect-square max-w-[440px] mx-auto lg:mr-auto lg:ml-8">
          <Image
            src="/hero.jpg"
            alt="Minimal abstract illustration in terracotta tones"
            fill
            className="object-cover mix-blend-multiply rounded-[24px]"
            priority
          />
        </div>
      </section>

      {/* 3. Capabilities Section */}
      <section id="capabilities" className="w-full max-w-[1280px] mx-auto px-6 py-[120px] flex flex-col">
        <h2 className="font-anthropic-serif text-[68px] leading-[1.1] text-center text-slate-dark mb-[136px]">
          Smriti's capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Email Automation */}
          <div className="flex flex-col items-center text-center p-8 border-b md:border-b-0 md:border-r border-stone/50">
            <svg className="w-20 h-20 text-slate-dark mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <h3 className="font-anthropic-sans font-semibold text-[24px] leading-[1.3] text-slate-dark mb-4">
              Email Automation
            </h3>
            <p className="font-anthropic-serif text-[18px] leading-[1.5] text-slate-dark max-w-[280px]">
              Meeting reports sent directly to your clients' mailboxes.
            </p>
          </div>
          {/* Global Memory */}
          <div className="flex flex-col items-center text-center p-8 border-b md:border-b-0 lg:border-r border-stone/50">
            <svg className="w-20 h-20 text-slate-dark mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="font-anthropic-sans font-semibold text-[24px] leading-[1.3] text-slate-dark mb-4">
              Global Memory
            </h3>
            <p className="font-anthropic-serif text-[18px] leading-[1.5] text-slate-dark max-w-[280px]">
              Query and chat with all your past meetings instantly.
            </p>
          </div>
          {/* Automated Action Items */}
          <div className="flex flex-col items-center text-center p-8 border-b md:border-b-0 md:border-r lg:border-t-0 md:border-t border-stone/50">
            <svg className="w-20 h-20 text-slate-dark mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <h3 className="font-anthropic-sans font-semibold text-[24px] leading-[1.3] text-slate-dark mb-4">
              Automated Action Items
            </h3>
            <p className="font-anthropic-serif text-[18px] leading-[1.5] text-slate-dark max-w-[280px]">
              Instantly extract next steps and commitments from every call.
            </p>
          </div>
          {/* Enterprise Security */}
          <div className="flex flex-col items-center text-center p-8 md:border-t lg:border-t-0 border-stone/50">
            <svg className="w-20 h-20 text-slate-dark mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <h3 className="font-anthropic-sans font-semibold text-[24px] leading-[1.3] text-slate-dark mb-4">
              Enterprise Security
            </h3>
            <p className="font-anthropic-serif text-[18px] leading-[1.5] text-slate-dark max-w-[280px]">
              Multi-tenant architecture ensuring your data is completely isolated and secure.
            </p>
          </div>
        </div>

        {/* Capabilities CTA */}
        <div className="flex flex-col items-center mt-24 gap-10">
          <p className="font-anthropic-serif text-[20px] text-slate-dark/60">Ready to never miss a meeting detail again?</p>
          <Link
            href="/register"
            className="font-anthropic-sans font-semibold text-[14px] bg-slate-dark text-white px-8 py-3.5 rounded-lg hover:bg-black transition-all"
          >
            Get started for free
          </Link>
        </div>
      </section>

      {/* 4. "Why Smriti?" Section (Bento Box) */}
      <section id="why" className="w-full max-w-[1280px] mx-auto px-6 py-[120px] flex flex-col gap-[104px]">
        <h2 className="font-anthropic-serif text-[68px] leading-[1.1] text-center text-slate-dark">
          Why Smriti?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Box 1 (Large, Cream) - Secure */}
          <div className="md:col-span-2 bg-ivory-light rounded-[24px] p-[40px] md:p-[56px] flex flex-col justify-between min-h-[440px] relative overflow-hidden">
            <h3 className="font-anthropic-sans font-bold text-[32px] text-slate-dark relative z-10">
              Secure
            </h3>
            
            {/* Topographic Map Visualization */}
            <div className="absolute top-0 right-0 w-[150%] md:w-[120%] h-full text-slate-dark opacity-[0.04] pointer-events-none">
              <svg viewBox="0 0 500 500" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1">
                {/* Flowing elevation lines */}
                <path d="M 500 0 C 400 100 300 150 200 100 C 100 50 0 100 -50 150" />
                <path d="M 500 30 C 410 120 310 170 210 120 C 110 70 0 120 -50 170" />
                <path d="M 500 60 C 420 140 320 190 220 140 C 120 90 0 140 -50 190" />
                <path d="M 500 90 C 430 160 330 210 230 160 C 130 110 0 160 -50 210" />
                
                {/* Secondary elevation hill */}
                <path d="M 500 200 C 350 300 250 200 150 300 C 50 400 0 350 -50 400" />
                <path d="M 500 230 C 360 320 260 220 160 320 C 60 420 0 370 -50 420" />
                <path d="M 500 260 C 370 340 270 240 170 340 C 70 440 0 390 -50 440" />
                <path d="M 500 290 C 380 360 280 260 180 360 C 80 460 0 410 -50 460" />
                
                {/* Closed contours representing secure isolated areas */}
                <path d="M 350 200 C 380 180 420 180 420 220 C 420 260 380 270 340 240 C 310 220 320 210 350 200 Z" />
                <path d="M 345 205 C 370 190 405 190 405 220 C 405 250 375 255 345 235 C 320 220 325 210 345 205 Z" />
                <path d="M 340 210 C 360 200 390 200 390 220 C 390 240 370 240 350 230 C 330 220 330 215 340 210 Z" />
              </svg>
            </div>

            <div className="relative z-10 mt-16">
              <h4 className="font-anthropic-serif text-[32px] leading-[1.2] text-slate-dark mb-4">
                Your meeting data stays isolated and protected.
              </h4>
              <p className="font-anthropic-serif text-[20px] leading-[1.5] text-slate-dark/80 max-w-[500px]">
                Smriti ensures that every customer's data remains completely safe, strictly isolated, and entirely your own.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:col-span-1">
            {/* Box 2 (Square, Beige) - Trustworthy */}
            <div className="bg-manilla rounded-[24px] p-[32px] md:p-[40px] flex flex-col justify-between flex-1">
              <h3 className="font-anthropic-sans font-bold text-[24px] text-slate-dark mb-16">
                Trustworthy
              </h3>
              <div>
                <h4 className="font-anthropic-serif text-[22px] leading-[1.3] text-slate-dark mb-3">
                  Grounded in your meeting data.
                </h4>
                <p className="font-anthropic-serif text-[16px] leading-[1.5] text-slate-dark/80">
                  Smriti connects answers and reports to the conversations and context your team already has.
                </p>
              </div>
            </div>

            {/* Box 3 (Square, Terracotta) - Reliable */}
            <div className="bg-[#b86b59] text-ivory-light rounded-[24px] p-[32px] md:p-[40px] flex flex-col justify-between flex-1">
              <h3 className="font-anthropic-sans font-bold text-[24px] text-ivory-light mb-16">
                Reliable
              </h3>
              <div>
                <h4 className="font-anthropic-serif text-[22px] leading-[1.3] text-ivory-light mb-3">
                  Never miss a detail again.
                </h4>
                <p className="font-anthropic-serif text-[16px] leading-[1.5] text-ivory-light/90">
                  Smriti joins your calls automatically and captures the important moments, decisions, and commitments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer Section */}
      <footer 
        className="w-full min-h-screen flex flex-col justify-between relative pt-[100px] pb-[40px] px-6 mt-24 bg-slate-dark" 
        style={{ backgroundImage: "url('/Kashi.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Dark overlay to ensure text is legible over the image */}
        <div className="absolute inset-0 bg-black/70"></div>
        
        {/* Footer Closing Statement */}
        <div className="w-full max-w-[1280px] mx-auto relative z-10 mb-24">
          <p className="font-anthropic-sans text-[13px] uppercase tracking-[0.15em] text-white/50 mb-6">Start today</p>
          <h2 className="font-anthropic-serif text-[56px] md:text-[72px] leading-[1.05] text-white mb-10 max-w-[700px]">
            Every meeting deserves to be remembered.
          </h2>
          <Link
            href="/register"
            className="inline-block font-anthropic-sans font-semibold text-[14px] bg-white text-slate-dark px-8 py-3.5 rounded-lg hover:bg-ivory-light transition-all"
          >
            Try Smriti for free
          </Link>
        </div>

        <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          {/* Left Column */}
          <div className="md:col-span-2">
            <div className="font-anthropic-sans font-bold text-[20px] uppercase tracking-wider text-white mb-4">
              SMRITI
            </div>
          </div>
          
          {/* Links Columns */}
          <div>
            <h4 className="font-anthropic-sans font-semibold text-[12px] text-white mb-4 uppercase">
              Product
            </h4>
            <ul className="flex flex-col gap-[8px]">
              <li>
                <Link href="#" className="font-anthropic-sans text-[12px] text-white/80 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="font-anthropic-sans text-[12px] text-white/80 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-anthropic-sans font-semibold text-[12px] text-white mb-4 uppercase">
              Company
            </h4>
            <ul className="flex flex-col gap-[8px]">
              <li>
                <Link href="#" className="font-anthropic-sans text-[12px] text-white/80 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="font-anthropic-sans text-[12px] text-white/80 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-anthropic-sans font-semibold text-[12px] text-white mb-4 uppercase">
              Legal
            </h4>
            <ul className="flex flex-col gap-[8px]">
              <li>
                <Link href="#" className="font-anthropic-sans text-[12px] text-white/80 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="font-anthropic-sans text-[12px] text-white/80 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="w-full max-w-[1280px] mx-auto mt-auto pt-[24px] border-t border-white/20 relative z-10">
          <p className="font-anthropic-sans text-[12px] text-white/60">
            © 2026 Smriti Inc.
          </p>
        </div>
      </footer>
    </main>
  );
}
