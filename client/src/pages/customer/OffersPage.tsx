import React, { useState, useEffect } from 'react';
import { promotionService } from '../../services/promotionService';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { Promotion } from '../../types';
import { Tag, Copy, Check, Gift, Sparkles, Percent, ShieldCheck } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { applyCoupon, couponCode } = useCartStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    async function loadOffers() {
      const data = await promotionService.getOffers();
      setPromotions(data);
    }
    loadOffers();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    applyCoupon(code);
    showToast({
      type: 'success',
      title: 'Coupon Applied & Copied',
      message: `Code '${code}' copied to clipboard and applied to your active cart.`
    });

    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 p-8 sm:p-12 text-white shadow-xl mb-12">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold mb-4">
            <Gift className="w-3.5 h-3.5" />
            <span>Artisanal Offers & Savings</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Gourmet Deals & Exclusive Savings
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Apply transparent promotional coupons with zero hidden convenience fees. Save up to ₹200 on hand-crafted multi-city Indian delicacies.
          </p>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => {
          const isCurrentActive = couponCode === promo.code;
          const isCopied = copiedCode === promo.code;

          return (
            <div
              key={promo._id}
              className={`relative flex flex-col justify-between p-6 rounded-2xl bg-white border transition-all shadow-xs hover:shadow-md ${
                isCurrentActive ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-stone-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <Percent className="w-3.5 h-3.5 mr-1" />
                    {promo.discountType === 'PERCENTAGE'
                      ? `${promo.discountValue}% OFF`
                      : `₹${promo.discountValue} FLAT OFF`}
                  </span>
                  <span className="text-[11px] text-stone-400 font-semibold">
                    Valid till Dec 2026
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mb-1">{promo.title}</h3>
                <p className="text-xs text-stone-600 mb-4 leading-relaxed">{promo.description}</p>

                <div className="text-xs text-stone-500 space-y-1 mb-6 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div className="flex justify-between">
                    <span>Minimum Order:</span>
                    <span className="font-bold text-stone-800">₹{promo.minOrderAmount}</span>
                  </div>
                  {promo.maxDiscount && (
                    <div className="flex justify-between">
                      <span>Maximum Discount:</span>
                      <span className="font-bold text-stone-800">₹{promo.maxDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Applicability:</span>
                    <span className="font-bold text-stone-800">All 100+ Restaurants</span>
                  </div>
                </div>
              </div>

              {/* Promo Code & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <div className="font-mono text-sm font-extrabold tracking-wider text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200 border-dashed">
                  {promo.code}
                </div>

                <button
                  onClick={() => handleCopyCode(promo.code)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                    isCopied || isCurrentActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : isCurrentActive ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Apply & Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
