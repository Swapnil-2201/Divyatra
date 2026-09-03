import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCrowd } from '../context/CrowdContext';
import { useBooking } from '../context/BookingContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { getPrasadamItems } from '../data/prasadam';
import {
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  MapPin,
  Accessibility,
  KeyRound,
  Headphones,
  Zap,
} from 'lucide-react';

const OPTIONAL_FACILITIES = [
  { id: 'wheelchair', name: 'Free Wheelchair Assistance (Divyangjan & Senior Citizen)', pricePerPax: 0, icon: Accessibility },
  { id: 'locker', name: 'Secure Digital Shoe & Luggage Locker', pricePerPax: 0, icon: KeyRound },
  { id: 'audio_guide', name: 'Devotional Audio Tour Guide Headset', pricePerPax: 50, icon: Headphones },
  { id: 'battery_cart', name: 'Electric Battery Shuttle (Parking to Sanctum Gate)', pricePerPax: 30, icon: Zap },
];

export const BookingPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialTemple = searchParams.get('temple') || 'somnath';
  const navigate = useNavigate();

  const { temples } = useCrowd();
  const { draftBooking, updateDraft, addPrasadToDraft, removePrasadFromDraft } = useBooking();
  const { showToast } = useNotification();
  const { user } = useAuth();

  const [selectedTempleId, setSelectedTempleId] = useState(initialTemple);
  const [selectedDate, setSelectedDate] = useState(
    draftBooking.date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [pilgrimCount, setPilgrimCount] = useState(draftBooking.pilgrimCount || 2);
  const [leadName, setLeadName] = useState(draftBooking.leadPilgrim?.name || user?.name || 'Ramesh Patel');
  const [leadPhone, setLeadPhone] = useState(draftBooking.leadPilgrim?.phone || user?.phone || '+91 98250 12345');
  const [leadEmail, setLeadEmail] = useState(draftBooking.leadPilgrim?.email || user?.email || 'pilgrim@divyatra.in');
  const [idNumber, setIdNumber] = useState(draftBooking.leadPilgrim?.idNumber || 'XXXX-XXXX-8842');
  const [specialQueue, setSpecialQueue] = useState(draftBooking.specialQueue || false);
  const [selectedFacilities, setSelectedFacilities] = useState(draftBooking.facilities || ['locker']);

  const selectedTemple = temples.find((t) => t.id === selectedTempleId) || temples[0];

  useEffect(() => {
    if (selectedTemple?.darshanSlots?.length > 0) {
      setSelectedSlot(selectedTemple.darshanSlots[0]);
    }
  }, [selectedTemple]);

  // Toggle facility checkbox
  const toggleFacility = (facilityId) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId) ? prev.filter((id) => id !== facilityId) : [...prev, facilityId]
    );
  };

  // Calculate pricing breakdown
  const vipFee = specialQueue ? (selectedSlot?.vipPrice || 200) * Number(pilgrimCount) : 0;
  const facilitiesFee = selectedFacilities.reduce((sum, facId) => {
    const item = OPTIONAL_FACILITIES.find((f) => f.id === facId);
    return sum + (item ? item.pricePerPax * Number(pilgrimCount) : 0);
  }, 0);
  const prasadTotal = draftBooking.prasadCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalAmount = vipFee + facilitiesFee + prasadTotal;

  // Handle Proceed to Checkout
  const handleProceedToPayment = (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      showToast('Please select a valid Darshan time slot', 'error');
      return;
    }

    const facilityNames = selectedFacilities.map(
      (id) => OPTIONAL_FACILITIES.find((f) => f.id === id)?.name || id
    );

    updateDraft({
      templeId: selectedTemple.id,
      templeName: selectedTemple.name,
      date: selectedDate,
      timeSlot: selectedSlot?.time || selectedSlot?.title || '06:30 AM - 08:00 AM',
      slotId: selectedSlot?.id || 's-01',
      pilgrimCount: Number(pilgrimCount),
      leadPilgrim: {
        name: leadName,
        phone: leadPhone,
        email: leadEmail,
        idNumber,
        idType: 'Aadhaar Card',
      },
      facilities: facilityNames,
      specialQueue,
      vipPassFee: vipFee,
      facilitiesFee,
      prasadTotal,
      totalAmount,
    });

    if (!user) {
      showToast('Please sign in to confirm your Darshan booking.', 'info');
      navigate('/login?redirect=/payment');
      return;
    }

    navigate('/payment');
  };

  const samplePrasadItems = getPrasadamItems(selectedTempleId).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8F5EF] py-12 sm:py-16 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E97820]">
            Official Government & Temple Trust Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#102A56]">
            Darshan Pass & Slot Reservation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Guaranteed contactless sanctum entry. Receive an instant verified digital QR pass on completion.
          </p>
        </div>

        <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
          
          {/* Main Booking Controls (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* Step 1: Select Shrine */}
            <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-2xl space-y-3.5 sm:space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EBE4D5]">
                <span className="w-6 h-6 rounded-full bg-[#102A56] text-white text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#102A56]">
                  Select Pilgrimage Shrine
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {temples.map((tTemple) => (
                  <button
                    key={tTemple.id}
                    type="button"
                    onClick={() => setSelectedTempleId(tTemple.id)}
                    className={`p-2.5 sm:p-3.5 rounded-2xl border text-center transition-all min-h-[44px] ${
                      selectedTempleId === tTemple.id
                        ? 'border-[#E97820] bg-[#FFFBF7] text-[#E97820] font-bold shadow-sm'
                        : 'border-[#EBE4D5] bg-white text-slate-700 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="block text-xs truncate">
                      {t(`templeData.${tTemple.id}.shortName`, { defaultValue: tTemple.shortName || tTemple.name })}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      ~{tTemple.liveStatus.estimatedWaitMinutes}m wait
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Date & Available Slots */}
            <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EBE4D5]">
                <span className="w-6 h-6 rounded-full bg-[#102A56] text-white text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#102A56]">
                  Choose Date & Darshan Slot
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#102A56] mb-2">Darshan Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A56] mb-2">Available Quota Slots</label>
                  <div className="space-y-2 sm:space-y-2.5">
                    {selectedTemple?.darshanSlots?.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      return (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 text-xs min-h-[44px] ${
                            isSelected
                              ? 'border-[#E97820] bg-[#FFFBF7] shadow-sm'
                              : 'border-[#EBE4D5] bg-white hover:border-gray-300'
                          }`}
                        >
                          <div>
                            <strong className="text-xs sm:text-sm text-[#102A56] block">{slot.title}</strong>
                            <span className="text-gray-500 text-[11px] sm:text-xs">{slot.time}</span>
                          </div>
                          <div className="text-left xs:text-right">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-[10.5px] font-bold">
                              {slot.availableSlots} slots left
                            </span>
                            <span className="block text-[10.5px] sm:text-[11px] text-gray-500 mt-0.5">
                              {specialQueue ? `VIP: ₹${slot.vipPrice || 200}` : 'Free General Entry'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Pilgrim Details & Special Queue */}
            <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EBE4D5]">
                <span className="w-6 h-6 rounded-full bg-[#102A56] text-white text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#102A56]">
                  Lead Devotee & Party Details
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-[#102A56] mb-1.5">Number of Devotees</label>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPilgrimCount(num)}
                        className={`py-2 sm:py-2.5 rounded-xl font-bold transition-all text-center min-h-[44px] flex flex-col items-center justify-center ${
                          pilgrimCount === num
                            ? 'bg-[#102A56] text-white shadow'
                            : 'bg-[#FAF8F5] text-slate-700 border border-[#DDD5C5]'
                        }`}
                      >
                        <span className="text-xs sm:text-sm leading-none">{num}</span>
                        <span className="text-[9px] sm:text-[10px] opacity-80 mt-0.5">Dev</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#102A56] mb-1">Lead Devotee Full Name *</label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820] min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102A56] mb-1">Mobile Number (for SMS QR) *</label>
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="+91 98250 12345"
                      className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102A56] mb-1">Email ID</label>
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="devotee@example.com"
                      className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102A56] mb-1">Govt Photo ID / Aadhaar Last 4</label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="XXXX-XXXX-8842"
                      className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820]"
                    />
                  </div>
                </div>

                {/* Senior Citizen / Special Fast Queue */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#E97820]" />
                    <div>
                      <strong className="text-xs font-bold text-[#102A56] block">
                        VIP Fast Track Queue / Senior Citizen Priority
                      </strong>
                      <span className="text-[11px] text-gray-500">
                        Bypasses general waiting corridors. Nominal trust donation: ₹200/devotee.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={specialQueue}
                    onChange={(e) => setSpecialQueue(e.target.checked)}
                    className="w-5 h-5 accent-[#E97820] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Optional Facilities & Accessibility */}
            <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-2xl space-y-3.5 sm:space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EBE4D5]">
                <span className="w-6 h-6 rounded-full bg-[#102A56] text-white text-xs font-bold flex items-center justify-center">4</span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#102A56]">
                  Optional Temple Facilities
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {OPTIONAL_FACILITIES.map((fac) => {
                  const isChecked = selectedFacilities.includes(fac.id);
                  const Icon = fac.icon;
                  return (
                    <div
                      key={fac.id}
                      onClick={() => toggleFacility(fac.id)}
                      className={`p-3 sm:p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs min-h-[44px] ${
                        isChecked
                          ? 'border-[#E97820] bg-[#FFFBF7] shadow-sm'
                          : 'border-[#EBE4D5] bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isChecked ? 'text-[#E97820]' : 'text-slate-500'}`} />
                        <div>
                          <strong className="text-xs font-bold text-[#102A56] block">{fac.name}</strong>
                          <span className="text-[10.5px] sm:text-[11px] text-gray-500">
                            {fac.pricePerPax === 0 ? 'Complimentary' : `₹${fac.pricePerPax}/devotee`}
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#E97820] cursor-pointer shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Add Sacred Mahaprasad Bundle */}
            <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-2xl space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE4D5]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#E97820]" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#102A56]">
                    Add Consecrated Mahaprasad
                  </h3>
                </div>
                <span className="text-[11px] sm:text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  Temple Trust Blessed
                </span>
              </div>

              <p className="text-xs text-gray-500">Pre-booked prasad is kept consecrated and ready at Counter 1 for immediate collection.</p>

              <div className="space-y-2.5 sm:space-y-3">
                {samplePrasadItems.map((item) => {
                  const inCart = draftBooking.prasadCart.find((p) => p.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-3 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 min-h-[44px]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover"
                        />
                        <div>
                          <strong className="text-xs sm:text-sm font-bold text-[#102A56] block">{item.name}</strong>
                          <span className="text-xs font-semibold text-[#E97820]">₹{item.price}</span>
                        </div>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-2 self-end xs:self-center">
                          <span className="text-xs font-bold text-[#102A56] px-2">{inCart.quantity} in cart</span>
                          <button
                            type="button"
                            onClick={() => removePrasadFromDraft(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addPrasadToDraft(item, 1)}
                          className="w-full xs:w-auto px-4 py-2 rounded-xl bg-[#102A56] text-white hover:bg-[#1B3B74] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[38px]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Pass</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Summary Card (Sticky With Scroll) */}
          <div className="lg:col-span-1 sticky top-20 sm:top-24 z-20">
            <div className="bg-white rounded-3xl border-2 border-[#D5A63A] p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
              
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#E97820] block">
                  Reservation Summary
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#102A56] mt-0.5">
                  {selectedTemple ? t(`templeData.${selectedTemple.id}.name`, { defaultValue: selectedTemple.name }) : ''}
                </h3>
              </div>

              <div className="space-y-2.5 sm:space-y-3 text-xs border-y border-[#EBE4D5] py-3.5 sm:py-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <strong className="text-[#102A56]">{selectedDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Slot:</span>
                  <strong className="text-[#102A56] truncate max-w-[160px] sm:max-w-[180px]">{selectedSlot?.title || 'Morning Slot'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Devotees:</span>
                  <strong className="text-[#102A56]">{pilgrimCount} Person(s)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Queue Type:</span>
                  <strong className={specialQueue ? 'text-[#E97820]' : 'text-emerald-700'}>
                    {specialQueue ? 'VIP Fast Track' : 'General Queue (Free)'}
                  </strong>
                </div>
                {specialQueue && (
                  <div className="flex justify-between text-slate-600">
                    <span>VIP Fast Track Fee:</span>
                    <span>₹{vipFee}</span>
                  </div>
                )}
                {facilitiesFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Selected Facilities:</span>
                    <span>₹{facilitiesFee}</span>
                  </div>
                )}
                {prasadTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Mahaprasad Items:</span>
                    <span>₹{prasadTotal}</span>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">Total Payable</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Instant digital QR pass</span>
                </div>
                <div className="text-right">
                  <strong className="font-serif text-2xl sm:text-3xl font-extrabold text-[#102A56]">
                    ₹{totalAmount}
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 sm:py-4 rounded-xl bg-[#E97820] hover:bg-[#D36A18] text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[10px] sm:text-[10.5px] text-gray-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>256-Bit Encrypted Gateway Simulation</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
