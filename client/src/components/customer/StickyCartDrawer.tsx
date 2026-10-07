import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export const StickyCartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isDrawerOpen, 
    setDrawerOpen, 
    items, 
    restaurantName, 
    orderType, 
    setOrderType, 
    tip, 
    setTip, 
    couponCode, 
    applyCoupon, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getSubtotal 
  } = useCartStore();

  if (!isDrawerOpen) return null;

  const subtotal = getSubtotal();
  const isTakeout = orderType === 'TAKEOUT';
  const deliveryFee = isTakeout ? 0 : 35; // ₹35 base
  const packagingFee = isTakeout ? 15 : 20; // ₹20 delivery packaging, ₹15 takeout
  const platformFee = 10; // ₹10 transparent platform fee
  const foodGst = parseFloat((subtotal * 0.05).toFixed(2));
  const serviceGst = parseFloat(((platformFee + deliveryFee) * 0.18).toFixed(2));
  const totalGst = parseFloat((foodGst + serviceGst).toFixed(2));

  let discount = 0;
  if (couponCode.toUpperCase() === 'GOURMET10') {
    discount = Math.min(150, parseFloat((subtotal * 0.10).toFixed(2)));
  } else if (couponCode.toUpperCase() === 'FREEDELIVERY' && !isTakeout) {
    discount = deliveryFee;
  } else if (couponCode.toUpperCase() === 'WELCOME50' && subtotal >= 199) {
    discount = 50;
  }

  const finalTotal = parseFloat(
    Math.max(0, subtotal + deliveryFee + packagingFee + platformFee + totalGst + tip - discount).toFixed(2)
  );

  const handleProceedToCheckout = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Top Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
            <div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-brand-600" />
                <h3 className="font-display text-lg font-bold text-stone-900">Your Dining Cart</h3>
              </div>
              {restaurantName && (
                <p className="text-xs text-stone-500 mt-0.5">From <strong className="text-stone-800">{restaurantName}</strong></p>
              )}
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-stone-800 text-sm">Your cart is empty</h4>
                <p className="text-xs text-stone-500 max-w-xs">Explore our curated menus and add exquisite dishes to begin your order.</p>
              </div>
            ) : (
              <>
                {/* Order Type Selector */}
                <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setOrderType('DELIVERY')}
                    className={`py-2 rounded-lg transition-all ${
                      orderType === 'DELIVERY' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    🚀 Delivery
                  </button>
                  <button
                    onClick={() => setOrderType('TAKEOUT')}
                    className={`py-2 rounded-lg transition-all ${
                      orderType === 'TAKEOUT' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    🛍️ Takeout Pickup
                  </button>
                </div>

                <div className="divide-y divide-stone-100 space-y-3 pt-2">
                  {items.map((item, index) => (
                    <div key={index} className="pt-3 first:pt-0 flex items-start justify-between">
                      <div className="space-y-1 pr-4">
                        <div className="font-semibold text-xs text-stone-900">{item.name}</div>
                        {item.selectedVariant && (
                          <div className="text-[11px] text-stone-400">Variant: {item.selectedVariant}</div>
                        )}
                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                          <div className="text-[11px] text-stone-400">
                            Add-ons: {item.selectedModifiers.map(m => m.optionName).join(', ')}
                          </div>
                        )}
                        <div className="text-xs font-bold text-stone-800">
                          ₹{item.totalPrice.toFixed(2)}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center space-x-2 bg-stone-50 border border-stone-200 px-2 py-1 rounded-lg">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="text-stone-500 hover:text-stone-900 p-0.5"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-xs font-bold text-stone-900 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="text-stone-500 hover:text-stone-900 p-0.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Input */}
                <div className="pt-3 border-t border-stone-100">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Try 'WELCOME50' or 'FREEDELIVERY'"
                      value={couponCode}
                      onChange={e => applyCoupon(e.target.value)}
                      className="flex-1 uppercase text-xs px-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Transparent Itemized Fee Breakdown (INR ₹) */}
                <div className="pt-4 border-t border-stone-200/80 space-y-2 text-xs text-stone-600 bg-stone-50/70 p-3.5 rounded-xl border">
                  <div className="flex items-center justify-between">
                    <span>Food Subtotal</span>
                    <span className="font-semibold text-stone-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery Fee ({isTakeout ? 'Takeout' : 'Base 2 km'})</span>
                    <span className="font-semibold text-stone-900">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Eco Tamper-Proof Packaging</span>
                    <span className="font-semibold text-stone-900">₹{packagingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform Convenience Fee</span>
                    <span className="font-semibold text-stone-900">₹{platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taxes (5% Food GST + 18% Service GST)</span>
                    <span className="font-semibold text-stone-900">₹{totalGst.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                      <span>Promo Coupon Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Driver Tip Chips (INR) */}
                  {!isTakeout && (
                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                      <span className="text-[11px] text-stone-500">Courteous Driver Tip:</span>
                      <div className="flex space-x-1.5">
                        {[20, 30, 50, 100].map(amt => (
                          <button
                            key={amt}
                            onClick={() => setTip(amt)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                              tip === amt ? 'bg-stone-900 text-white' : 'bg-white border text-stone-700'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Transparent Fee Guarantee: What you see is exactly what you pay in INR.</span>
                </div>
              </>
            )}
          </div>

          {/* Bottom Action Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Final Total</span>
                <span className="font-display text-2xl font-bold text-stone-900">₹{finalTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
