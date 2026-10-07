import React from 'react';
import { UtensilsCrossed, ShieldCheck, HeartHandshake, FileText, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-display text-xl font-bold text-white tracking-tight">
                Gourmet<span className="text-brand-500">Fleet</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              An ethical, transparent marketplace for fine dining reservations, chef-crafted takeaways, and artisanal food delivery.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-900/50">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Zero stealth markups • Itemized fee transparency</span>
            </div>
          </div>

          {/* Diners & Explorers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-4">Guest Experience</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><a href="/" className="hover:text-white transition-colors">Curated Restaurants</a></li>
              <li><a href="/orders" className="hover:text-white transition-colors">Live Order Tracking</a></li>
              <li><a href="/reservations" className="hover:text-white transition-colors">Instant QR Table Passes</a></li>
              <li><a href="/loyalty" className="hover:text-white transition-colors">Epicure Loyalty Club</a></li>
            </ul>
          </div>

          {/* Restaurant Partners */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-4">For Restaurateurs</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><a href="/auth?tab=register&role=restaurant_owner" className="hover:text-white transition-colors">Partner With Us</a></li>
              <li><a href="/owner/dashboard" className="hover:text-white transition-colors">Kitchen Display & Floor Hub</a></li>
              <li><span className="text-stone-500">Owner AI Business Copilot</span></li>
              <li><span className="text-stone-500">Fair 8-12% Capped Commissions</span></li>
            </ul>
          </div>

          {/* Regulatory & Compliance Notices */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-2">Compliance & Governance</h4>
            <div className="text-[11px] text-stone-400 space-y-2 leading-tight">
              <p className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                <span><strong>FSSAI Compliant:</strong> All culinary partners hold validated food safety certifications.</span>
              </p>
              <p className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                <span><strong>DPDP Act 2023:</strong> Full user privacy rights, encrypted tokens & zero third-party data selling.</span>
              </p>
              <p className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                <span><strong>GSTIN Invoices:</strong> Itemized 5% food & 18% service GST tax credits.</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500">
          <p>© 2026 GourmetFleet Marketplace Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-stone-400 cursor-pointer">Privacy Charter</span>
            <span className="hover:text-stone-400 cursor-pointer">Terms of Hospitality</span>
            <span className="hover:text-stone-400 cursor-pointer">Security Vulnerability Disclosure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
