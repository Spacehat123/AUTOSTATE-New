import React from 'react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-100 pt-16 pb-8 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-16">
        
        {/* Brand */}
        <div className="max-w-xs">
          <div className="text-2xl font-serif font-bold text-zinc-900 mb-4 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-zinc-900 shadow-sm"></div>
            AutoState
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">
            One workspace to replace the fragmented mess of apps. 
            Automate your client interactions instantly.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16 lg:gap-24">
          <div>
            <h4 className="font-bold text-zinc-900 mb-6 uppercase tracking-wide text-xs">Product</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 mb-6 uppercase tracking-wide text-xs">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 mb-6 uppercase tracking-wide text-xs">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

      </div>

      <div className="max-w-6xl mx-auto border-t border-zinc-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-zinc-400 font-medium">
          © {new Date().getFullYear()} AutoState Inc. All rights reserved.
        </div>
        
        {/* Socials */}
        <div className="flex gap-5 text-zinc-400">
          <a href="#" className="hover:text-zinc-900 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
          </a>
          <a href="#" className="hover:text-zinc-900 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
          <a href="#" className="hover:text-zinc-900 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
