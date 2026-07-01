import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, Link as LinkIcon, ClipboardPaste, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

export default function Landing() {
  const handleGetStarted = () => {
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="min-h-screen bg-app-bg text-on-surface font-sans selection:bg-primary-orange/20 selection:text-primary overflow-x-hidden">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 bg-app-bg/85 backdrop-blur-md z-50 px-5 md:px-8 lg:px-10 py-4 flex items-center justify-between border-b border-brand-outline-variant/10">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new Event('popstate'));
          }}
        >
          <Logo className="w-6 h-8 shrink-0" />
          <h1 className="font-display font-extrabold text-xl text-primary tracking-tight leading-none">
            AllMarked
          </h1>
        </div>
        <button
          onClick={handleGetStarted}
          className="text-xs font-bold text-primary-orange border-2 border-primary-orange/20 hover:border-primary-orange hover:bg-primary-orange/5 px-4 py-2 rounded-full transition-all cursor-pointer bg-white/50"
        >
          Sign In
        </button>
      </header>

      <main>
        {/* 2. HERO SECTION */}
        <section className="px-5 md:px-8 lg:px-10 pt-20 pb-24 max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-brand-outline-variant/10 shadow-sm text-xs font-bold text-on-surface-muted uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Free • No credit card
          </div>
          
          <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-on-surface tracking-tight leading-[1.05] mb-6">
            Save anything.<br />Find it instantly.
          </h1>
          
          <p className="text-on-surface-muted font-medium text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Paste any link from Instagram, YouTube or anywhere. AI sorts it automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-24">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto py-3.5 px-8 bg-gradient-to-r from-primary-orange to-primary text-white font-display font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(249,115,22,0.25)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
            <button
              className="w-full sm:w-auto py-3.5 px-8 bg-white border border-brand-outline-variant/20 text-on-surface font-display font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-surface-low transition-all duration-200 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-on-surface" />
              <span>Watch how it works</span>
            </button>
          </div>

          {/* CSS Phone Mockup */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full max-w-[300px] mx-auto aspect-[9/19.5] bg-white rounded-[3rem] border-[8px] border-[#e5e5e5] shadow-2xl overflow-hidden flex flex-col items-center"
          >
            {/* Phone Notch */}
            <div className="absolute top-0 w-32 h-6 bg-[#e5e5e5] rounded-b-2xl z-20" />
            
            {/* App UI inside phone */}
            <div className="w-full h-full bg-app-bg pt-12 px-4 pb-4 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="w-24 h-5 bg-[#e5e5e5] rounded-md" />
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary-orange/50 rounded-full" />
                </div>
              </div>
              
              {/* Search bar */}
              <div className="w-full h-10 bg-white rounded-xl border border-brand-outline-variant/10 flex items-center px-3 shadow-sm">
                <div className="w-4 h-4 rounded-full bg-[#e5e5e5]" />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {/* Item 1 */}
                <div className="aspect-[4/5] bg-white rounded-2xl p-2 flex flex-col border border-brand-outline-variant/10 shadow-sm">
                  <div className="w-full h-2/3 bg-orange-100 rounded-xl mb-2" />
                  <div className="w-16 h-2.5 bg-[#e5e5e5] rounded-full mb-1.5" />
                  <div className="w-10 h-2 bg-[#f0f0f0] rounded-full" />
                </div>
                {/* Item 2 */}
                <div className="aspect-[4/5] bg-white rounded-2xl p-2 flex flex-col border border-brand-outline-variant/10 shadow-sm">
                  <div className="w-full h-2/3 bg-blue-100 rounded-xl mb-2" />
                  <div className="w-14 h-2.5 bg-[#e5e5e5] rounded-full mb-1.5" />
                  <div className="w-12 h-2 bg-[#f0f0f0] rounded-full" />
                </div>
                {/* Item 3 */}
                <div className="aspect-[4/5] bg-white rounded-2xl p-2 flex flex-col border border-brand-outline-variant/10 shadow-sm">
                  <div className="w-full h-2/3 bg-emerald-100 rounded-xl mb-2" />
                  <div className="w-20 h-2.5 bg-[#e5e5e5] rounded-full mb-1.5" />
                  <div className="w-8 h-2 bg-[#f0f0f0] rounded-full" />
                </div>
                {/* Item 4 */}
                <div className="aspect-[4/5] bg-white rounded-2xl p-2 flex flex-col border border-brand-outline-variant/10 shadow-sm">
                  <div className="w-full h-2/3 bg-purple-100 rounded-xl mb-2" />
                  <div className="w-12 h-2.5 bg-[#e5e5e5] rounded-full mb-1.5" />
                  <div className="w-10 h-2 bg-[#f0f0f0] rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 3. HOW IT WORKS */}
        <section className="py-24 bg-white border-y border-brand-outline-variant/5">
          <div className="max-w-6xl mx-auto px-5 md:px-8 lg:px-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-brand-outline-variant/20 to-transparent" />
              
              {/* Step 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3"
              >
                <div className="w-16 h-16 rounded-2xl bg-app-bg border border-brand-outline-variant/10 flex items-center justify-center mb-6 shadow-sm">
                  <LinkIcon className="w-7 h-7 text-primary-orange" />
                </div>
                <h3 className="font-display font-bold text-lg text-on-surface mb-2">Copy any link</h3>
                <p className="text-sm font-medium text-on-surface-muted leading-relaxed max-w-[200px]">
                  From Instagram, YouTube, TikTok
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3"
              >
                <div className="w-16 h-16 rounded-2xl bg-app-bg border border-brand-outline-variant/10 flex items-center justify-center mb-6 shadow-sm">
                  <ClipboardPaste className="w-7 h-7 text-primary-orange" />
                </div>
                <h3 className="font-display font-bold text-lg text-on-surface mb-2">Paste in AllMarked</h3>
                <p className="text-sm font-medium text-on-surface-muted leading-relaxed max-w-[200px]">
                  Or share directly from app
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-container border border-primary-orange/20 flex items-center justify-center mb-6 shadow-sm">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-on-surface mb-2">AI sorts it</h3>
                <p className="text-sm font-medium text-on-surface-muted leading-relaxed max-w-[200px]">
                  Saved to right collection instantly
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4. DEMO SECTION */}
        <section className="py-24 px-5 md:px-8 lg:px-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-3xl md:text-4xl text-on-surface tracking-tight mb-4">
              Your collections, auto-organized
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Fake Card 1 - Cars */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-[#1c1b1b] rounded-3xl p-3 border border-white/10 shadow-xl overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-full aspect-[4/3] bg-[#2a2a2a] rounded-2xl mb-4 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent" />
                 <div className="absolute top-3 left-3 flex gap-1.5">
                   <span className="bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold text-white">Instagram</span>
                   <span className="bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold text-white">YouTube</span>
                 </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="text-white font-display font-bold text-lg">🚗 Cars</h3>
                <p className="text-white/50 text-sm font-medium mt-1">12 reels</p>
              </div>
            </motion.div>

            {/* Fake Card 2 - Food */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 }}
              className="bg-[#1c1b1b] rounded-3xl p-3 border border-white/10 shadow-xl overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-full aspect-[4/3] bg-[#2a2a2a] rounded-2xl mb-4 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 to-transparent" />
                 <div className="absolute top-3 left-3 flex gap-1.5">
                   <span className="bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold text-white">TikTok</span>
                   <span className="bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold text-white">Instagram</span>
                 </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="text-white font-display font-bold text-lg">🍕 Food</h3>
                <p className="text-white/50 text-sm font-medium mt-1">8 reels</p>
              </div>
            </motion.div>

            {/* Fake Card 3 - Travel */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2 }}
              className="bg-[#1c1b1b] rounded-3xl p-3 border border-white/10 shadow-xl overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform duration-300 sm:col-span-2 md:col-span-1"
            >
              <div className="w-full aspect-[4/3] bg-[#2a2a2a] rounded-2xl mb-4 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-transparent" />
                 <div className="absolute top-3 left-3 flex gap-1.5">
                   <span className="bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold text-white">YouTube</span>
                 </div>
              </div>
              <div className="px-2 pb-2">
                <h3 className="text-white font-display font-bold text-lg">✈️ Travel</h3>
                <p className="text-white/50 text-sm font-medium mt-1">5 reels</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 5. BOTTOM CTA */}
        <section className="bg-on-surface text-white py-24 px-5 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-8">
              Start saving. It's free.
            </h2>
            <button
              onClick={handleGetStarted}
              className="py-4 px-10 bg-primary-orange text-white font-display font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(249,115,22,0.4)] hover:shadow-[0_8px_32px_rgba(249,115,22,0.6)] hover:-translate-y-1 transition-all duration-300 cursor-pointer mb-4"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
            <p className="text-white/50 font-medium text-sm">
              No account needed to try
            </p>
          </div>
        </section>
      </main>

      {/* 6. FOOTER */}
      <footer className="bg-on-surface border-t border-white/10 py-8 text-center px-5">
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
          AllMarked © 2026 • Made for saving things.
        </p>
      </footer>
    </div>
  );
}
