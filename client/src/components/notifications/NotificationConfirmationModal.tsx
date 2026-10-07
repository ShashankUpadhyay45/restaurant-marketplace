import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Smartphone, 
  CheckCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  PhoneCall, 
  Clock 
} from 'lucide-react';
import { api } from '../../services/api';

interface NotificationData {
  type?: 'ORDER_CONFIRMATION' | 'RESERVATION_CONFIRMATION' | 'ORDER_STATUS_UPDATE';
  normalizedPhone?: string;
  whatsAppMessage?: string;
  smsMessage?: string;
  whatsappShareUrl?: string;
  orderNumber?: string;
  bookingId?: string;
  restaurantName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data?: NotificationData | null;
  defaultType?: 'ORDER_CONFIRMATION' | 'RESERVATION_CONFIRMATION';
}

export const NotificationConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  defaultType = 'ORDER_CONFIRMATION'
}) => {
  const [activeTab, setActiveTab] = useState<'WHATSAPP' | 'SMS'>('WHATSAPP');
  const [content, setContent] = useState<NotificationData | null>(data || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (data && (data.whatsAppMessage || data.smsMessage)) {
      setContent(data);
    } else {
      // Fetch live simulated preview from backend
      setLoading(true);
      api.get(`/notifications/preview/${defaultType}`)
        .then(res => {
          if (res.success) {
            setContent({
              type: res.type,
              normalizedPhone: res.normalizedPhone,
              whatsAppMessage: res.whatsAppMessage,
              smsMessage: res.smsMessage,
              whatsappShareUrl: res.whatsappShareUrl
            });
          }
        })
        .catch(err => console.error('Failed to load notification preview', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, data, defaultType]);

  if (!isOpen) return null;

  const currentPhone = content?.normalizedPhone || '+91 98765 43210';
  const whatsappUrl = content?.whatsappShareUrl || 
    `https://api.whatsapp.com/send?phone=${currentPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(content?.whatsAppMessage || '')}`;

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="bg-stone-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display font-bold text-lg leading-tight">Instant Confirmation</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  DISPATCHED
                </span>
              </div>
              <p className="text-xs text-stone-400 flex items-center mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Dispatched via WhatsApp & SMS to <strong className="text-stone-200 ml-1">{currentPhone}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('WHATSAPP')}
            className={`flex items-center space-x-2 pb-3 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'WHATSAPP'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Confirmation</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">Rich</span>
          </button>

          <button
            onClick={() => setActiveTab('SMS')}
            className={`flex items-center space-x-2 pb-3 px-3 text-xs font-bold transition-all border-b-2 ml-2 ${
              activeTab === 'SMS'
                ? 'border-brand-600 text-brand-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-brand-600" />
            <span>DLT SMS Message</span>
            <span className="text-[10px] bg-stone-200 text-stone-700 font-bold px-1.5 py-0.2 rounded-full">[GURMET]</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-stone-500">Generating live delivery preview...</p>
            </div>
          ) : activeTab === 'WHATSAPP' ? (
            
            /* TAB 1: WHATSAPP CHAT PREVIEW */
            <div className="space-y-4">
              
              {/* WhatsApp Interface Mockup */}
              <div className="rounded-2xl border border-emerald-200 bg-[#E5DDD5] overflow-hidden shadow-inner">
                
                {/* Mock WhatsApp Top Bar */}
                <div className="bg-[#075E54] px-4 py-3 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 border border-emerald-400 flex items-center justify-center font-bold text-xs">
                      GF
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-xs leading-none">GourmetFleet India</span>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-300 inline" />
                      </div>
                      <span className="text-[10px] text-emerald-200 flex items-center mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1" />
                        Verified Business Account
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-200">Just Now</span>
                </div>

                {/* Chat Bubble Area */}
                <div className="p-4 space-y-2">
                  <div className="max-w-[92%] bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm text-stone-900 border border-stone-200/80">
                    <pre className="font-sans text-xs whitespace-pre-wrap leading-relaxed text-stone-800">
                      {content?.whatsAppMessage || 'Formatting confirmation message...'}
                    </pre>

                    {/* Delivery & Read Receipts */}
                    <div className="flex items-center justify-end space-x-1 mt-2 text-[10px] text-stone-400">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500 ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for WhatsApp */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleOpenWhatsApp}
                  className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in WhatsApp</span>
                </button>

                <button
                  onClick={() => handleCopyText(content?.whatsAppMessage || '')}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

            </div>
          ) : (

            /* TAB 2: SMS PREVIEW */
            <div className="space-y-4">
              
              {/* Native SMS Interface Mockup */}
              <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4 shadow-inner space-y-3">
                <div className="flex items-center justify-between text-[11px] text-stone-500 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-800 flex items-center">
                    <Smartphone className="w-3.5 h-3.5 mr-1 text-stone-600" />
                    Sender: [GURMET]
                  </span>
                  <span>TRAI / DLT Verified Transactional SMS</span>
                </div>

                <div className="bg-blue-600 text-white rounded-2xl rounded-br-xs p-4 shadow-sm">
                  <p className="text-xs leading-relaxed font-mono">
                    {content?.smsMessage || 'Loading SMS payload...'}
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-blue-200 mt-2">
                    <span>Delivered via Indian Telecom Gateway</span>
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for SMS */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => handleCopyText(content?.smsMessage || '')}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'SMS Copied to Clipboard!' : 'Copy SMS Payload'}</span>
                </button>
              </div>

            </div>
          )}

          {/* Footer Informational Badge */}
          <div className="mt-5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-900 flex items-center justify-between">
            <span className="flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
              <span>Full compliance with TRAI DLT registration and Meta Business guidelines</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full ml-2 shrink-0">
              Active
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
