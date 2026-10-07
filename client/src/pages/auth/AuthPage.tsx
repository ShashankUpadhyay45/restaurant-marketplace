import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { HeroFoodCanvas } from '../../components/3d/HeroFoodCanvas';
import { 
  UtensilsCrossed, 
  Lock, 
  Mail, 
  User, 
  Store, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const initialRole = searchParams.get('role') === 'restaurant_owner' ? 'restaurant_owner' : 'customer';

  const { setAuth } = useAuthStore();

  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [role, setRole] = useState<'customer' | 'restaurant_owner'>(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Owner fields
  const [restaurantName, setRestaurantName] = useState('');
  const [operatingMode, setOperatingMode] = useState<'DELIVERY_ONLY' | 'DINING_ONLY' | 'HYBRID'>('HYBRID');
  const [fssaiLicense, setFssaiLicense] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/auth/login', {
        email: demoEmail,
        password: 'Password123!'
      });

      if (res.success) {
        setAuth(res.user, res.token);
        if (res.user.role === 'restaurant_owner') {
          navigate('/owner/dashboard');
        } else if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (res.user.role === 'delivery_partner') {
          navigate('/delivery/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (tab === 'login') {
        const res = await api.post('/auth/login', { email, password });
        if (res.success) {
          setAuth(res.user, res.token);
          if (res.user.role === 'restaurant_owner') navigate('/owner/dashboard');
          else if (res.user.role === 'admin') navigate('/admin/dashboard');
          else if (res.user.role === 'delivery_partner') navigate('/delivery/dashboard');
          else navigate('/');
        }
      } else {
        const payload: any = {
          email,
          password,
          fullName,
          phone,
          role
        };

        if (role === 'restaurant_owner') {
          payload.restaurantDetails = {
            name: restaurantName || 'Artisanal Kitchen',
            operatingMode,
            cuisineTypes: ['Contemporary'],
            fssaiLicenseNumber: fssaiLicense || 'FSSAI-DEMO-991188'
          };
        }

        const res = await api.post('/auth/register', payload);
        if (res.success) {
          setAuth(res.user, res.token);
          if (res.user.role === 'restaurant_owner') navigate('/owner/dashboard');
          else navigate('/');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background 3D Canvas / Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <HeroFoodCanvas />
      </div>
      <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-white">
            Gourmet<span className="text-brand-500">Fleet</span>
          </span>
        </Link>
        <p className="text-xs text-stone-400">
          Sign in to manage live orders, table bookings, rewards, or kitchen operations
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Quick Demo Credentials Panel */}
        <div className="bg-stone-800/90 border border-stone-700/80 p-4 rounded-2xl mb-4 text-xs space-y-2 backdrop-blur-md">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Test Access:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer@gourmetfleet.com')}
              className="py-1.5 px-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-white font-semibold text-[11px] transition-colors"
            >
              👤 Diner
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('vikram@doonbistro.com')}
              className="py-1.5 px-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-amber-300 font-semibold text-[11px] transition-colors"
            >
              👨‍🍳 Owner
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('rider@gourmetfleet.com')}
              className="py-1.5 px-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-emerald-300 font-semibold text-[11px] transition-colors"
            >
              🛵 Rider
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@gourmetfleet.com')}
              className="py-1.5 px-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-purple-300 font-semibold text-[11px] transition-colors"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white text-stone-900 py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-stone-200 space-y-6">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'login' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'register' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {tab === 'register' && (
              <>
                {/* Role Switcher */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1.5">Account Purpose</label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        role === 'customer'
                          ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      Diner / Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('restaurant_owner')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        role === 'restaurant_owner'
                          ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      Restaurant Owner
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Chef or Guest Name"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Restaurant Onboarding Fields */}
            {tab === 'register' && role === 'restaurant_owner' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block">
                  Restaurant Onboarding Profile
                </span>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">Restaurant Venue Name</label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={e => setRestaurantName(e.target.value)}
                    placeholder="e.g. The Great Doon Bistro & Bakery"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">Operating Mode</label>
                  <select
                    value={operatingMode}
                    onChange={e => setOperatingMode(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                  >
                    <option value="HYBRID">Hybrid (Food Delivery + Table Bookings)</option>
                    <option value="DELIVERY_ONLY">Delivery Only (Cloud Kitchen)</option>
                    <option value="DINING_ONLY">Dining Only (Fine Dining Reservations)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">FSSAI License / Food Safety ID</label>
                  <input
                    type="text"
                    required
                    value={fssaiLicense}
                    onChange={e => setFssaiLicense(e.target.value)}
                    placeholder="e.g. FSSAI-12623999000188"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In Securely' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="flex items-center space-x-2 text-[11px] text-stone-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DPDP Act 2023 Compliant • Bcrypt Hashed Passwords</span>
          </div>

        </div>

      </div>

    </div>
  );
};
