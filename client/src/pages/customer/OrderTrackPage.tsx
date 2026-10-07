import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { socketBus } from '../../services/socket';
import { Order, OrderStatus, RiderDetails } from '../../types';
import { 
  ArrowLeft, 
  Bike, 
  Phone, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  Navigation
} from 'lucide-react';

export const OrderTrackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [riderProgressPercent, setRiderProgressPercent] = useState<number>(35);
  const [simulatedEtaMinutes, setSimulatedEtaMinutes] = useState<number>(24);

  useEffect(() => {
    async function fetchOrder() {
      if (id) {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      }
    }
    fetchOrder();

    // Listen to real-time socket events
    const unbindStatus = socketBus.on('order:statusChanged', (payload: any) => {
      if (payload.orderId === id) {
        setOrder(prev => prev ? { ...prev, orderStatus: payload.status } : null);
      }
    });

    const unbindAssigned = socketBus.on('order:assigned', (payload: any) => {
      if (payload.orderId === id) {
        setOrder(prev => prev ? { ...prev, assignedRider: payload.rider, orderStatus: 'RIDER_ASSIGNED' } : null);
      }
    });

    // Simulated rider GPS movement
    const progressTimer = setInterval(() => {
      setRiderProgressPercent(prev => {
        if (prev >= 95) return 95;
        return prev + 5;
      });
      setSimulatedEtaMinutes(prev => (prev > 2 ? prev - 1 : 2));
    }, 4000);

    return () => {
      unbindStatus();
      unbindAssigned();
      clearInterval(progressTimer);
    };
  }, [id]);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500">
        <p>Loading live tracking...</p>
      </div>
    );
  }

  const rider = order.assignedRider || {
    id: 'rider_01',
    name: 'Rajesh Kumar',
    phone: '+919822334455',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    vehicleType: 'BIKE',
    vehicleNumber: 'UK 07 AF 4821',
    rating: 4.9,
    totalTrips: 482
  };

  const steps: Array<{ status: OrderStatus; label: string }> = [
    { status: 'CONFIRMED', label: 'Confirmed' },
    { status: 'PREPARING', label: 'Cooking' },
    { status: 'RIDER_ASSIGNED', label: 'Rider Assigned' },
    { status: 'PICKED_UP', label: 'Picked Up' },
    { status: 'DELIVERED', label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.orderStatus);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        to={`/orders/${order._id}`}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Order Details</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Simulated Radar Map & Route */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xl">
            {/* Top Status Header */}
            <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block">
                  Live Dispatch GPS
                </span>
                <h1 className="text-xl font-bold font-mono text-white">
                  Order #{order.orderNumber}
                </h1>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-400 font-bold block flex items-center justify-end space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
                  Live GPS
                </span>
                <span className="text-lg font-extrabold text-white">
                  {order.orderStatus === 'DELIVERED' ? 'Arrived!' : `ETA ~${simulatedEtaMinutes} mins`}
                </span>
              </div>
            </div>

            {/* Zero-Token Interactive Cartographic Radar Canvas */}
            <div className="relative h-80 bg-stone-950 overflow-hidden flex items-center justify-center p-4">
              <svg className="w-full h-full" viewBox="0 0 500 300">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#262626" strokeWidth="0.8" />
                  </pattern>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Radar concentric rings */}
                <circle cx="250" cy="150" r="60" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                <circle cx="250" cy="150" r="110" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />

                {/* Route Path from Restaurant (Left) to Customer (Right) */}
                <path
                  d="M 80 180 Q 220 80 420 140"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                />
                <path
                  d="M 80 180 Q 220 80 420 140"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="4"
                />

                {/* Restaurant Pin (Left) */}
                <g transform="translate(80, 180)">
                  <circle r="12" fill="#d97706" />
                  <circle r="6" fill="#ffffff" />
                  <text x="-40" y="28" fill="#f59e0b" fontSize="11" fontWeight="bold">
                    {order.restaurantName || 'Kitchen'}
                  </text>
                </g>

                {/* Customer Pin (Right) */}
                <g transform="translate(420, 140)">
                  <circle r="12" fill="#059669" />
                  <circle r="6" fill="#ffffff" />
                  <text x="-35" y="28" fill="#10b981" fontSize="11" fontWeight="bold">
                    Your Home
                  </text>
                </g>

                {/* Moving Rider Pin */}
                {/* Parametric position calculated from riderProgressPercent */}
                {(() => {
                  const t = riderProgressPercent / 100;
                  // Quadratic bezier formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
                  const p0x = 80, p0y = 180;
                  const p1x = 220, p1y = 80;
                  const p2x = 420, p2y = 140;
                  const rx = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * p1x + t * t * p2x;
                  const ry = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;

                  return (
                    <g transform={`translate(${rx}, ${ry})`}>
                      <circle r="20" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
                      <circle r="14" fill="#047857" stroke="#ffffff" strokeWidth="2" />
                      <text x="-6" y="4" fill="#ffffff" fontSize="10" fontWeight="bold">🛵</text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Stepper Timeline */}
            <div className="p-6 bg-stone-50 border-t border-stone-200">
              <div className="flex items-center justify-between text-xs font-bold text-stone-600 mb-2">
                {steps.map((st, i) => (
                  <span
                    key={st.status}
                    className={`${i <= activeIndex ? 'text-brand-600 font-extrabold' : 'text-stone-400'}`}
                  >
                    {st.label}
                  </span>
                ))}
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Rider & Delivery Verification Card */}
        <div className="space-y-6">
          {/* OTP Card */}
          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm text-center">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
              Delivery Verification Code
            </span>
            <div className="text-3xl font-extrabold font-mono text-stone-900 tracking-widest my-2">
              {order.deliveryOtp || '4829'}
            </div>
            <p className="text-xs text-amber-700">
              Share this 4-digit OTP with your delivery partner once you receive the package.
            </p>
          </div>

          {/* Rider Card */}
          <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xl">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
              Your Delivery Partner
            </h3>

            <div className="flex items-center space-x-3.5 mb-4">
              <img
                src={rider.photoUrl}
                alt={rider.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{rider.name}</h4>
                <div className="flex items-center space-x-2 text-xs text-stone-500 mt-0.5">
                  <span className="font-bold text-emerald-600">★ {rider.rating}</span>
                  <span>•</span>
                  <span>{rider.totalTrips} deliveries</span>
                </div>
                <span className="text-[11px] text-stone-400 block font-mono">{rider.vehicleNumber}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-3 border-t border-stone-100">
              <a
                href={`tel:${rider.phone}`}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>

              <button
                onClick={() => alert(`Initiating direct chat with ${rider.name}...`)}
                className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                title="Message Partner"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
