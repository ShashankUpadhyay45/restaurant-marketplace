import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  Banknote,
  Building2,
  MessageSquare,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { NotificationConfirmationModal } from '../../components/notifications/NotificationConfirmationModal';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentLocation } = useLocationStore();
  const { 
    items, 
    restaurantId, 
    restaurantName, 
    orderType, 
    tip, 
    couponCode, 
    clearCart 
  } = useCartStore();

  // Address fields
  const [addressLine1, setAddressLine1] = useState<string>(
    user?.savedAddresses?.[0]?.addressLine1 || user?.savedAddresses?.[0]?.street || 'Flat 4B, Silver Oak Residency'
  );
  const [locality, setLocality] = useState<string>(
    user?.savedAddresses?.[0]?.locality || currentLocation.locality || 'Rajpur Road'
  );
  const [city, setCity] = useState<string>(
    user?.savedAddresses?.[0]?.city || currentLocation.city || 'Dehradun'
  );
  const [state, setState] = useState<string>(
    user?.savedAddresses?.[0]?.state || currentLocation.state || 'Uttarakhand'
  );
  const [postalCode, setPostalCode] = useState<string>(
    user?.savedAddresses?.[0]?.postalCode || currentLocation.postalCode || '248001'
  );
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState<string>('customer@okhdfcbank');
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phone || '+91 98765 43210');
  const [whatsappOptIn, setWhatsappOptIn] = useState<boolean>(true);
  const [orderCompletedData, setOrderCompletedData] = useState<any>(null);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [calculatedFees, setCalculatedFees] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validate cart
  useEffect(() => {
    if (!restaurantId || items.length === 0) {
      navigate('/');
    }
  }, [restaurantId, items, navigate]);

  // Request server-side calculation
  useEffect(() => {
    if (!restaurantId || items.length === 0) return;

    async function fetchPricing() {
      setIsCalculating(true);
      setErrorMsg(null);
      try {
        const payload = {
          restaurantId,
          items: items.map(i => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            variantName: i.selectedVariant,
            modifierOptionNames: i.selectedModifiers?.map(m => m.optionName)
          })),
          orderType,
          deliveryDistanceKm: 3.5,
          tip,
          couponCode
        };

        const res = await api.post('/orders/calculate', payload);
        if (res.success) {
          setCalculatedFees(res.calculation);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Pricing calculation failed.');
      } finally {
        setIsCalculating(false);
      }
    }

    fetchPricing();
  }, [restaurantId, items, orderType, tip, couponCode]);

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/auth?redirect=/checkout');
      return;
    }

    if (orderType === 'DELIVERY' && (!addressLine1.trim() || !city.trim() || !postalCode.trim())) {
      setErrorMsg('Please specify a complete delivery address with 6-digit PIN code.');
      return;
    }

    setIsPlacingOrder(true);
    setErrorMsg(null);

    try {
      const payload = {
        restaurantId,
        customerPhone,
        whatsappOptIn,
        items: items.map(i => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          variantName: i.selectedVariant,
          modifierOptionNames: i.selectedModifiers?.map(m => m.optionName),
          notes: i.notes
        })),
        orderType,
        deliveryDistanceKm: 3.5,
        tip,
        couponCode,
        deliveryAddress: {
          addressLine1,
          locality,
          city,
          state,
          postalCode,
          country: 'India',
          street: `${addressLine1}, ${locality}, ${city}`
        },
        specialInstructions,
        paymentMethod
      };

      const res = await api.post('/orders', payload);

      if (res.success) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        clearCart();
        setOrderCompletedData({
          order: res.order,
          notificationDelivery: res.notificationDelivery
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderCompletedData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Order Placed & Confirmed</span>
          <h1 className="font-display text-3xl font-bold text-stone-900 mt-1">
            Thank you for dining with GourmetFleet!
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            Order <strong>#{orderCompletedData.order.orderNumber}</strong> has been transmitted to the kitchen.
          </p>
        </div>

        {/* WhatsApp & SMS Confirmation Card */}
        <div className="p-6 bg-emerald-50/90 rounded-3xl border border-emerald-200 text-left space-y-4 shadow-sm">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-emerald-950">WhatsApp & SMS Confirmation Dispatched</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">Live Delivered</span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Your itemized ₹ receipt, estimated preparation window, and live GPS tracking link have been dispatched to <strong>{orderCompletedData.notificationDelivery?.normalizedPhone || customerPhone}</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-emerald-200/70">
            <button
              onClick={() => setShowNotificationModal(true)}
              className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Preview WhatsApp & SMS Receipt</span>
            </button>

            {orderCompletedData.notificationDelivery?.whatsappShareUrl && (
              <a
                href={orderCompletedData.notificationDelivery.whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(`/orders?orderId=${orderCompletedData.order._id}`)}
            className="py-3 px-6 bg-stone-900 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center space-x-2"
          >
            <span>Track Live Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/"
            className="py-3 px-6 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Return to Marketplace
          </Link>
        </div>

        <NotificationConfirmationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          data={orderCompletedData.notificationDelivery}
          defaultType="ORDER_CONFIRMATION"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Form & Address */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Secure Direct Checkout</span>
            <h1 className="font-display text-3xl font-bold text-stone-900 mt-1">Review & Confirm Order</h1>
            <p className="text-xs text-stone-500 mt-1">Ordering from <strong className="text-stone-800">{restaurantName}</strong></p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Fulfillment Details */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-stone-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>{orderType === 'DELIVERY' ? 'Indian Delivery Address' : 'Takeout Pickup Counter'}</span>
            </h3>

            {orderType === 'DELIVERY' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">
                    Flat / House No. / Building / Floor
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={e => setAddressLine1(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. Flat 4B, Silver Oak Residency, 32 Rajpur Road"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Locality / Sector / Area</label>
                    <input
                      type="text"
                      value={locality}
                      onChange={e => setLocality(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g. Rajpur Road / Jakhan"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g. Dehradun"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g. Uttarakhand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">6-Digit PIN Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g. 248001"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-200">
                You will pick up your freshly boxed meal directly at the host counter at <strong>{restaurantName}</strong>. You will receive a notification when the kitchen marks it ready.
              </p>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Delivery / Landmark Instructions (Optional)</label>
              <input
                type="text"
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Near Silver City Mall, ring bell twice"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Mobile Number for WhatsApp & SMS */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <label className="block text-[11px] font-bold uppercase text-stone-700 flex items-center justify-between">
                <span>Mobile Number for Status & Live Tracking</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1 inline" /> WhatsApp & SMS
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-stone-500 font-bold">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  value={customerPhone.replace('+91', '').trim()}
                  onChange={e => setCustomerPhone(`+91 ${e.target.value.replace(/[^0-9]/g, '')}`)}
                  className="w-full pl-16 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="98765 43210"
                />
              </div>

              <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={whatsappOptIn}
                  onChange={e => setWhatsappOptIn(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] text-stone-600 leading-tight">
                  Send instant order confirmation, itemized ₹ receipt, and live kitchen tracking updates via <strong>WhatsApp & SMS</strong>.
                </span>
              </label>
            </div>
          </div>

          {/* Indian Payment Methods */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-stone-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <span>Select Payment Method (India Verified)</span>
            </h3>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  paymentMethod === 'UPI'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                    : 'border-stone-200 hover:border-stone-400 text-stone-700'
                }`}
              >
                <Smartphone className="w-5 h-5 text-brand-600" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  paymentMethod === 'CARD'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                    : 'border-stone-200 hover:border-stone-400 text-stone-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-brand-600" />
                <span>Cards / RuPay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  paymentMethod === 'NETBANKING'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                    : 'border-stone-200 hover:border-stone-400 text-stone-700'
                }`}
              >
                <Building2 className="w-5 h-5 text-brand-600" />
                <span>Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  paymentMethod === 'COD'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                    : 'border-stone-200 hover:border-stone-400 text-stone-700'
                }`}
              >
                <Banknote className="w-5 h-5 text-brand-600" />
                <span>Pay on Delivery</span>
              </button>
            </div>

            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <label className="block text-[11px] font-bold uppercase text-stone-600">Enter Virtual Payment Address (VPA / UPI ID)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                    placeholder="e.g. yourname@okhdfcbank"
                  />
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded">
                    Auto-Verified
                  </span>
                </div>
                <p className="text-[10px] text-stone-400">Supports Google Pay, PhonePe, Paytm, BHIM, Cred UPI</p>
              </div>
            )}

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center space-x-3">
              <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="text-xs text-emerald-900">
                <span className="font-bold">Encrypted 256-Bit SSL Sandbox Active</span>
                <p className="text-[11px] text-emerald-700">Developer mode enables instant testing with zero bank charges.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-lg space-y-6">
            <h3 className="font-display text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Order Summary ({items.length} items)
            </h3>

            {/* Item List */}
            <div className="divide-y divide-stone-100 space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-start justify-between text-xs">
                  <div>
                    <div className="font-bold text-stone-900">{it.quantity}x {it.name}</div>
                    {it.selectedVariant && <div className="text-[10px] text-stone-400">Variant: {it.selectedVariant}</div>}
                    {it.selectedModifiers && it.selectedModifiers.length > 0 && (
                      <div className="text-[10px] text-stone-400">
                        {it.selectedModifiers.map(m => m.optionName).join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-stone-800">₹{it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Calculations in INR */}
            {isCalculating ? (
              <div className="p-4 bg-stone-50 rounded-2xl text-center text-xs text-stone-400 animate-pulse">
                Calculating authentic taxes and delivery fee...
              </div>
            ) : calculatedFees ? (
              <div className="space-y-2.5 text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div className="flex justify-between">
                  <span>Food Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{calculatedFees.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-stone-900">₹{calculatedFees.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eco Packaging</span>
                  <span className="font-semibold text-stone-900">₹{calculatedFees.packagingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-semibold text-stone-900">₹{calculatedFees.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5% Food + 18% Logistics)</span>
                  <span className="font-semibold text-stone-900">₹{calculatedFees.gstAmount.toFixed(2)}</span>
                </div>
                {calculatedFees.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount ({couponCode})</span>
                    <span>-₹{calculatedFees.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {calculatedFees.tip > 0 && (
                  <div className="flex justify-between">
                    <span>Driver Tip</span>
                    <span className="font-semibold text-stone-900">₹{calculatedFees.tip.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="font-bold text-stone-900 text-sm">Grand Total (INR)</span>
                  <span className="font-display text-2xl font-bold text-brand-600">
                    ₹{calculatedFees.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || isCalculating}
              className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isPlacingOrder ? 'Confirming with Kitchen...' : 'Place Order & Pay'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Full compliance with FSSAI regulations & Indian GST laws</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
