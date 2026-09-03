import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Download,
  Receipt,
  User,
  Mail,
  Phone,
  FileText,
  CreditCard,
  Smartphone,
  Building2,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const PRESET_AMOUNTS = [101, 251, 501, 1100, 2100, 5100];

const SEVA_CAUSES = [
  {
    id: 'annakshetra',
    title: 'Annakshetra & Mahaprasad Seva',
    icon: '🍲',
    desc: 'Provides free sanctified midday meals and food packets to thousands of daily pilgrims.'
  },
  {
    id: 'goshala',
    title: 'Sacred Goshala & Gir Cow Care',
    icon: '🐄',
    desc: 'Supports indigenous Gir cows, fodder supply, and traditional Ayurvedic dairy care.'
  },
  {
    id: 'sanctum',
    title: 'Temple Heritage & Sanctum Maintenance',
    icon: '🛕',
    desc: 'Preserves ancient stone carvings, golden Kalash, and sacred temple architecture.'
  },
  {
    id: 'puja',
    title: 'Daily Puja, Shringar & Deepam',
    icon: '🌸',
    desc: 'Funds daily aromatic flowers, pure chandan, dhoop, and evening Aarti deepam oil.'
  },
  {
    id: 'general',
    title: 'General Temple Trust E-Hundi (Sarva Seva)',
    icon: '🪙',
    desc: 'Unrestricted devotee contribution toward pilgrim amenities, RO water, and trust operations.'
  }
];

export const TempleDonationModal = ({ isOpen, onClose, temple }) => {
  const { t } = useTranslation();
  const { showToast } = useNotification();

  const [selectedAmount, setSelectedAmount] = useState(501);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCause, setSelectedCause] = useState('annakshetra');
  
  // Devotee details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [want80G, setWant80G] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Transaction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedReceipt, setConfirmedReceipt] = useState(null);

  if (!isOpen || !temple) return null;

  const activeAmount = customAmount ? Number(customAmount) : selectedAmount;
  const currentCause = SEVA_CAUSES.find((c) => c.id === selectedCause) || SEVA_CAUSES[0];

  const handlePresetClick = (amt) => {
    setSelectedAmount(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    if (val) setSelectedAmount(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeAmount || activeAmount < 11) {
      showToast('Please enter a valid offering amount (minimum ₹11).', 'warning');
      return;
    }
    if (!name.trim()) {
      showToast('Please enter the devotee name for the sacred receipt.', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create payment order via backend API
      const order = await api.createPayment({
        amount: activeAmount,
        currency: 'INR',
        receipt: `don_${temple.id}_${Date.now()}`,
        notes: {
          type: 'TEMPLE_DONATION',
          templeId: temple.id,
          templeName: temple.name || temple.shortName,
          cause: currentCause.title,
          devoteeName: name,
          pan: panNumber || 'N/A',
          is80G: want80G
        }
      });

      // Step 2: Verify payment
      const paymentId = `pay_don_${Math.random().toString(36).substring(2, 10)}`;
      const verification = await api.verifyPayment({
        paymentId,
        orderId: order?.id || `ord_${Date.now()}`,
        signature: `sig_don_${Date.now()}`,
        bookingData: {
          type: 'donation',
          templeId: temple.id,
          templeName: temple.name || temple.shortName,
          amount: activeAmount,
          devoteeName: name,
          email: email || 'devotee@divyatra.gujarat.gov.in',
          phone: phone || '+91 9876543210',
          panNumber: panNumber || null,
          cause: currentCause.title,
          is80G: want80G
        }
      });

      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      const receiptData = {
        receiptNumber: `DY-DON-${Math.floor(100000 + Math.random() * 900000)}`,
        transactionId: paymentId,
        templeName: temple.name || temple.shortName,
        deity: temple.deity || 'Divine Shrine',
        amount: activeAmount,
        devoteeName: name,
        cause: currentCause.title,
        panNumber: panNumber || 'N/A',
        is80G: want80G,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setConfirmedReceipt(receiptData);
      showToast(`Divine blessing! Donation of ₹${activeAmount} received with sacred thanks.`, 'success');
    } catch (err) {
      showToast('Payment could not be completed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedReceipt(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5DED0] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#102A56] via-[#1A3F7A] to-[#102A56] text-white p-5 sm:p-6 relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#D5A63A]/20 text-[#D5A63A]">
              <HeartHandshake className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#D5A63A]">
              Official Temple Trust E-Hundi
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
            {t(`templeData.${temple.id}.name`, { defaultValue: temple.name || temple.shortName })}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Offer sacred Seva & Danam directly to the verified temple trust.
          </p>
        </div>

        {/* Content Area */}
        {confirmedReceipt ? (
          /* Success Receipt Screen */
          <div className="p-5 sm:p-6 space-y-5 bg-[#FAF8F5]">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#102A56]">
                Sacred Offering Acknowledged
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                May the divine grace of <strong>{t(`templeData.${temple.id}.name`, { defaultValue: temple.name })}</strong> bring eternal peace, health, and prosperity to you and your family.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="bg-white rounded-2xl border border-[#E5DED0] p-4 sm:p-5 shadow-sm space-y-3.5 text-xs text-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-gray-200">
                <div>
                  <span className="text-[10.5px] text-gray-400 block uppercase font-semibold">Receipt Number</span>
                  <strong className="text-slate-800 font-mono text-xs">{confirmedReceipt.receiptNumber}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10.5px] text-gray-400 block uppercase font-semibold">Offering Amount</span>
                  <strong className="text-lg font-bold text-emerald-700">₹{confirmedReceipt.amount}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-400 text-[10.5px] block font-medium">Devotee Name</span>
                  <strong className="text-slate-800 text-xs truncate block">{confirmedReceipt.devoteeName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[10.5px] block font-medium">Date & Time</span>
                  <span className="text-slate-700 text-xs">{confirmedReceipt.date}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 text-[10.5px] block font-medium">Seva Purpose</span>
                  <span className="text-slate-800 font-semibold">{confirmedReceipt.cause}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10.5px] block font-medium">Transaction ID</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate block">{confirmedReceipt.transactionId}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10.5px] block font-medium">80G Tax Exemption</span>
                  <span className="text-emerald-700 font-bold">50% Tax Exempt</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Official Gujarat Devasthan Trust
                </span>
                <span className="font-mono">80G Reg: GUJ/TR/2026/80G</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-[#102A56]/20 bg-white text-[#102A56] font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save E-Receipt</span>
              </button>
              <button
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 rounded-xl bg-[#102A56] text-white font-semibold text-xs hover:bg-[#1B3B74] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Donation Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* 1. Select Offering Amount */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#102A56] flex items-center justify-between">
                <span>Select Offering Amount (INR)</span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  100% Secure & 80G Exempt
                </span>
              </label>

              {/* Preset buttons */}
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = selectedAmount === amt && !customAmount;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handlePresetClick(amt)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-[#E97820] bg-orange-50 text-[#E97820] shadow-sm scale-[1.02]'
                          : 'border-[#E5DED0] bg-[#FAF8F5] text-slate-700 hover:border-[#102A56]/30'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  );
                })}
              </div>

              {/* Custom amount input */}
              <div className="relative mt-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                  ₹
                </span>
                <input
                  type="text"
                  placeholder="Or enter custom amount (e.g. 5000)"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E5DED0] text-xs font-bold text-slate-800 placeholder:text-gray-400 focus:outline-none focus:border-[#E97820] focus:ring-1 focus:ring-[#E97820]"
                />
              </div>
            </div>

            {/* 2. Select Seva Cause */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#102A56] block">
                Seva Offering Purpose
              </label>
              <div className="space-y-1.5">
                {SEVA_CAUSES.map((cause) => {
                  const isSelected = selectedCause === cause.id;
                  return (
                    <label
                      key={cause.id}
                      onClick={() => setSelectedCause(cause.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[#E97820] bg-amber-50/50'
                          : 'border-[#E5DED0] bg-[#FAF8F5] hover:bg-white'
                      }`}
                    >
                      <span className="text-lg leading-none mt-0.5">{cause.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${isSelected ? 'text-[#102A56]' : 'text-slate-700'}`}>
                          {cause.title}
                        </p>
                        <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
                          {cause.desc}
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="cause"
                        checked={isSelected}
                        onChange={() => setSelectedCause(cause.id)}
                        className="mt-1 text-[#E97820] focus:ring-[#E97820]"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Devotee Details */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              <label className="text-xs font-bold text-[#102A56] block">
                Devotee Contact & Receipt Info
              </label>
              
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Devotee Full Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5DED0] text-xs text-slate-800 placeholder:text-gray-400 focus:outline-none focus:border-[#E97820]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email Address (for e-receipt)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5DED0] text-xs text-slate-800 placeholder:text-gray-400 focus:outline-none focus:border-[#E97820]"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5DED0] text-xs text-slate-800 placeholder:text-gray-400 focus:outline-none focus:border-[#E97820]"
                  />
                </div>

                {/* 80G Tax Exemption Toggle */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Claim 80G Income Tax Exemption
                    </span>
                    <input
                      type="checkbox"
                      checked={want80G}
                      onChange={(e) => setWant80G(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  {want80G && (
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="Enter PAN Number (e.g. ABCDE1234F)"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs font-mono uppercase text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <label className="text-xs font-bold text-[#102A56] block">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                  { id: 'card', label: 'Cards', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
                        isSelected
                          ? 'border-[#E97820] bg-orange-50/60 text-[#E97820]'
                          : 'border-[#E5DED0] bg-[#FAF8F5] text-slate-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || !activeAmount}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E97820] to-[#D36A18] hover:from-[#D36A18] hover:to-[#B85710] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Sacred Offering...</span>
                </>
              ) : (
                <>
                  <HeartHandshake className="w-4 h-4" />
                  <span>Offer ₹{activeAmount || 0} to {temple.shortName || 'Temple'} Trust</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10.5px] text-slate-400 text-center">
              <Lock className="w-3 h-3" />
              <span>256-Bit SSL Encrypted Direct Temple Trust Gateway</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
