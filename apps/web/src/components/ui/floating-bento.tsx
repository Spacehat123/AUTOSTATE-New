import React from 'react'

export function FloatingBento() {
  return (
    <div className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center animate-fade-up" style={{ animationDelay: '400ms' }}>
      {/* Container to hold the floating cards */}
      <div className="relative w-[340px] h-[380px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px]">
        
        {/* Card 1: Invoice (Top Left) */}
        <div 
          className="absolute top-4 left-0 sm:top-10 sm:left-4 w-[260px] sm:w-64 p-4 sm:p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-black/[0.04] shadow-[0_20px_40px_rgba(0,0,0,0.06)] animate-[float_6s_ease-in-out_infinite]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Invoice Sent</div>
            <div className="w-2 h-2 rounded-full bg-[#8ceda9] shadow-[0_0_8px_rgba(140,237,169,0.8)]"></div>
          </div>
          <div className="text-sm sm:text-base font-semibold text-zinc-900 tracking-tight">ACME Corp Redesign</div>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1 tracking-tighter">$4,200</div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[10px] sm:text-xs font-medium text-zinc-500 bg-white border border-black/5 px-2.5 py-1.5 rounded-lg w-fit shadow-sm">
            Due in 14 days
          </div>
        </div>

        {/* Card 2: AI Action (Center Right) */}
        <div 
          className="absolute top-40 right-0 sm:top-48 sm:-right-8 w-[280px] sm:w-[320px] p-5 sm:p-6 bg-zinc-900 rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.16)] animate-[float_7s_ease-in-out_1s_infinite]"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
            </div>
            <div className="text-sm font-semibold text-white tracking-tight">AutoState AI</div>
          </div>
          <div className="text-sm text-zinc-300 leading-relaxed font-medium">
            <span className="text-white">Invoice #1042 paid.</span> I've updated the CRM to Active, marked the task complete, and drafted a thank you note.
          </div>
        </div>

        {/* Card 3: WhatsApp Bubble (Bottom Left) */}
        <div 
          className="absolute bottom-6 left-4 sm:bottom-8 sm:left-12 w-[240px] sm:w-[280px] p-4 bg-white/80 backdrop-blur-xl rounded-2xl rounded-bl-sm border border-black/[0.04] shadow-[0_16px_32px_rgba(0,0,0,0.06)] animate-[float_8s_ease-in-out_2s_infinite]"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-zinc-500 tracking-wide uppercase">WhatsApp Sent</div>
          </div>
          <div className="text-sm font-medium text-zinc-800 leading-snug">
            Payment received! 🎉 The onboarding documents have been sent to your email.
          </div>
        </div>

      </div>
    </div>
  )
}
