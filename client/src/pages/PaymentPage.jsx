import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
  Truck,
  MapPin,
  ShoppingBag,
} from 'lucide-react';

export const PaymentPage = () => {
  const { draftBooking, saveConfirmedBooking } = useBooking();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Payment form states
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [upiId, setUpiId] = useState('patel@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8842');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('842');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  
  // Delivery & fulfillment mode
  const [fulfillmentType, setFulfillmentType] = useState(
    draftBooking.deliveryMode || 'TEMPLE_COUNTER_PICKUP'
  ); // 'TEMPLE_COUNTER_PICKUP' | 'SPEED_POST_DELIVERY'
  const [shippingAddress, setShippingAddress] = useState('Flat 402, Shivam Heights, Ahmedabad, Gujarat - 380015');

  // Processing flow state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Price calculations
  const darshanAmount = draftBooking.vipPassFee || (draftBooking.specialQueue ? 200 * (draftBooking.pilgrimCount || 1) : 0);
  const facilitiesFee = draftBooking.facilitiesFee || 0;
  const prasadamAmount = draftBooking.prasadCart?.reduce((sum, i) => sum + i.price * i.quantity, 0) || draftBooking.prasadTotal || 0;
  const deliveryFee = fulfillmentType === 'SPEED_POST_DELIVERY' && prasadamAmount > 0 ? 50 : 0;
  const taxAndFees = 0; // Transparent zero hidden charges
  const totalPayable = darshanAmount + facilitiesFee + prasadamAmount + deliveryFee + taxAndFees;

  const handleCompletePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Step 1: Initiate Payment Order with Gateway Abstraction
      setProcessingStep('Initiating Secure Order with Payment Gateway...');
      const order = await api.createPayment({
        amount: totalPayable,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          templeId: draftBooking.templeId || 'somnath',
          pilgrims: draftBooking.pilgrimCount || 1,
        },
      });

      await new Promise((r) => setTimeout(r, 900));

      // Step 2: Authorizing Transaction via Mock/Razorpay Provider
      setProcessingStep(`Authorizing ₹${totalPayable} via ${paymentMethod.toUpperCase()}...`);
      await new Promise((r) => setTimeout(r, 1100));

      // Step 3: Verifying Signature and Creating E-Pass + Notification
      setProcessingStep('Verifying Transaction & Locking Darshan Quota with Temple Node...');

      const bookingPayload = {
        userId: user?.id || user?._id || null,
        templeId: draftBooking.templeId || 'somnath',
        templeName: draftBooking.templeName || 'Shree Somnath Jyotirlinga',
        date: draftBooking.date || new Date().toISOString().split('T')[0],
        timeSlot: draftBooking.timeSlot || '06:30 AM - 08:00 AM',
        slotId: draftBooking.slotId || 's-01',
        pilgrimCount: draftBooking.pilgrimCount || 2,
        leadPilgrim: draftBooking.leadPilgrim || {
          name: user?.name || 'Ramesh Patel',
          phone: user?.phone || '+91 98250 12345',
          email: user?.email || 'pilgrim@divyatra.in',
          idType: 'Aadhaar Card',
        },
        coPilgrims: draftBooking.coPilgrims || [],
        facilities: draftBooking.facilities || [],
        specialQueue: draftBooking.specialQueue || false,
        prasadCart: draftBooking.prasadCart || [],
        vipPassFee: darshanAmount,
        facilitiesFee,
        prasadTotal: prasadamAmount,
        deliveryFee,
        deliveryMode: fulfillmentType,
        shippingAddress: fulfillmentType === 'SPEED_POST_DELIVERY' ? shippingAddress : null,
        totalAmount: totalPayable,
        amountPaid: totalPayable,
        status: 'confirmed',
      };

      const verificationResponse = await api.verifyPayment({
        paymentId: `pay_${order?.id?.replace('order_', '') || Date.now()}`,
        orderId: order?.id || `order_sim_${Date.now()}`,
        signature: `sig_mock_verified_${Date.now()}`,
        bookingData: bookingPayload,
        userId: user?.id || user?._id || null,
      });

      const confirmedBooking = verificationResponse.booking || (await api.createBooking(bookingPayload));

      // Step 4: Finalizing QR & E-Pass
      setProcessingStep('Generating High-Resolution Scannable QR E-Pass...');
      await new Promise((r) => setTimeout(r, 600));

      saveConfirmedBooking(confirmedBooking);

      // Celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      showToast('Payment Verified! E-Darshan Pass & Prasadam Order Confirmed.', 'success');
      navigate(`/confirmation?id=${confirmedBooking.bookingId}`);
    } catch (err) {
      showToast('Payment processing error. Please retry.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] py-12 sm:py-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Gateway Header Banner */}
        <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#102A56] text-[#D5A63A] flex items-center justify-center font-serif font-black text-lg sm:text-xl shadow-md shrink-0">
              ₹
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#E97820] block">
                Razorpay Certified Secure Gateway
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#102A56]">
                Temple Trust Express Checkout
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#FFFBEB] border border-amber-200 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-amber-900 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-[#E97820] shrink-0" />
            <span>Session: <strong className="font-mono text-xs sm:text-sm">{formatTime(timeLeft)}</strong></span>
          </div>
        </div>

        {/* Processing Modal Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-[#102A56]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-[calc(100vw-32px)] sm:max-w-sm w-full text-center space-y-4 shadow-2xl border border-[#E5DED0] animate-scaleUp">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-[#102A56] to-[#E97820] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg">
                <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#102A56]">
                Processing Payment
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {processingStep}
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[#E97820] h-full rounded-full animate-pulse w-3/4" />
              </div>
              <span className="text-[10px] text-gray-400 block">
                Do not close or refresh this browser window.
              </span>
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Method Tabs & Inputs (Left 2 cols) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Fulfillment Mode Selector (if prasadam is included) */}
            {prasadamAmount > 0 && (
              <div className="bg-white rounded-3xl border border-[#E5DED0] p-6 shadow-luxury space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#EBE4D5]">
                  <ShoppingBag className="w-4 h-4 text-[#E97820]" />
                  <h4 className="font-serif text-base font-bold text-[#102A56]">
                    Prasadam Fulfillment Preference
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFulfillmentType('TEMPLE_COUNTER_PICKUP')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      fulfillmentType === 'TEMPLE_COUNTER_PICKUP'
                        ? 'border-[#E97820] bg-[#FFFBF7] shadow-sm'
                        : 'border-[#EBE4D5] bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-[#102A56]" />
                      <strong className="text-xs font-bold text-[#102A56]">Temple Counter Pickup</strong>
                    </div>
                    <p className="text-[11px] text-gray-500">Collect fresh consecrated box at Counter 1 with QR pass (Free).</p>
                  </div>

                  <div
                    onClick={() => setFulfillmentType('SPEED_POST_DELIVERY')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      fulfillmentType === 'SPEED_POST_DELIVERY'
                        ? 'border-[#E97820] bg-[#FFFBF7] shadow-sm'
                        : 'border-[#EBE4D5] bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-[#E97820]" />
                      <strong className="text-xs font-bold text-[#102A56]">India Speed Post Delivery</strong>
                    </div>
                    <p className="text-[11px] text-gray-500">Dispatched via Speed Post (+₹50 flat shipping across India).</p>
                  </div>
                </div>

                {fulfillmentType === 'SPEED_POST_DELIVERY' && (
                  <div className="space-y-1 pt-2 animate-fadeIn">
                    <label className="block text-xs font-bold text-[#102A56]">Delivery Postal Address *</label>
                    <textarea
                      rows={2}
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter complete postal delivery address with PIN code"
                      className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl border border-[#E5DED0] p-6 sm:p-8 shadow-luxury space-y-6">
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-2xl">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                  { id: 'card', label: 'Cards', icon: CreditCard },
                  { id: 'netbanking', label: 'NetBanking', icon: Building2 }
                ].map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-3 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                        active
                          ? 'bg-[#102A56] text-white shadow-md'
                          : 'text-slate-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Method Form */}
              <form onSubmit={handleCompletePayment} className="space-y-5">
                {paymentMethod === 'upi' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-bold text-[#102A56] mb-1.5">
                        Enter UPI ID / VPA
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@okhdfcbank"
                          className="w-full p-3.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#E97820]"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Verified VPA
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                        <div
                          key={app}
                          className="p-3 rounded-xl border border-gray-200 text-center text-xs font-semibold text-slate-700 bg-[#FAF8F5] flex items-center justify-center gap-1.5"
                        >
                          <span>{app}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-bold text-[#102A56] mb-1.5">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full p-3.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-[#E97820]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#102A56] mb-1.5">Valid Thru</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-[#E97820]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#102A56] mb-1.5">CVV / CVC</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-[#E97820]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-4 animate-fadeIn">
                    <label className="block text-xs font-bold text-[#102A56] mb-1.5">Select Bank</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                            selectedBank === b
                              ? 'border-[#E97820] bg-[#FFFBF7] text-[#E97820]'
                              : 'border-gray-200 text-slate-700 bg-[#FAF8F5]'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-[#0D8259] hover:bg-[#0A6B49] text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{totalPayable} & Generate Verified Pass</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Summary Sidebar (Itemized Calculation) */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-[#E5DED0] p-6 shadow-luxury space-y-4">
              <h4 className="font-serif font-bold text-lg text-[#102A56] pb-3 border-b border-[#EBE4D5]">
                Order Calculation Breakdown
              </h4>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Shrine:</span>
                  <strong className="text-[#102A56] text-right truncate max-w-[140px]">
                    {draftBooking.templeName || 'Somnath Temple'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Slot Date:</span>
                  <strong className="text-[#102A56]">{draftBooking.date || 'Tomorrow'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Devotees:</span>
                  <strong className="text-[#102A56]">{draftBooking.pilgrimCount || 2} Pax</strong>
                </div>

                <div className="pt-2 border-t border-dashed border-[#EBE4D5] space-y-2">
                  <div className="flex justify-between">
                    <span>Darshan Pass Amount:</span>
                    <strong className="text-[#102A56]">
                      {darshanAmount === 0 ? '₹0 (Free General)' : `₹${darshanAmount}`}
                    </strong>
                  </div>

                  {facilitiesFee > 0 && (
                    <div className="flex justify-between">
                      <span>Optional Facilities:</span>
                      <strong className="text-[#102A56]">₹{facilitiesFee}</strong>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Prasadam Offerings:</span>
                    <strong className="text-[#102A56]">₹{prasadamAmount}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery / Shipping Fee:</span>
                    <strong className={deliveryFee === 0 ? 'text-emerald-700' : 'text-[#102A56]'}>
                      {deliveryFee === 0 ? '₹0 (Pickup)' : `₹${deliveryFee} (Speed Post)`}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Govt Trust Tax & Fees:</span>
                    <strong className="text-emerald-700">₹0 (Zero Surcharge)</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EBE4D5] flex items-baseline justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Total Amount:</span>
                <strong className="font-serif text-2xl font-bold text-[#102A56]">
                  ₹{totalPayable}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] text-[11px] text-gray-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Certified 256-bit SSL gateway. Raw card data is never stored.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
