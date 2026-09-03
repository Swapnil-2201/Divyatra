import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { getPrasadItemImage } from '../data/prasadImages';
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Package,
  Plus,
  Trash2,
  ArrowRight,
  Clock,
  Check,
  Building2,
} from 'lucide-react';

const TEMPLE_TABS = [
  { id: 'all', name: 'All 4 Shrines', count: 20, icon: '🛕' },
  { id: 'somnath', name: 'Somnath Jyotirlinga', count: 5, icon: '🔱' },
  { id: 'dwarka', name: 'Dwarkadhish Temple', count: 5, icon: '🦚' },
  { id: 'ambaji', name: 'Ambaji Shaktipeeth', count: 5, icon: '🌺' },
  { id: 'pavagadh', name: 'Pavagadh Mahakali', count: 5, icon: '⚡' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Offerings' },
  { id: 'Mahaprasad', label: 'Mahaprasad' },
  { id: 'Panchamrut', label: 'Panchamrut & Bhog' },
  { id: 'Temple Special', label: 'Temple Special' },
  { id: 'Blessings Box', label: 'Blessings Box' },
];

export const PrasadPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTemple = searchParams.get('temple') || 'all';

  const [prasadList, setPrasadList] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState(initialTemple);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deliveryMode, setDeliveryMode] = useState('TEMPLE_COUNTER_PICKUP'); // "TEMPLE_COUNTER_PICKUP" | "SPEED_POST_DELIVERY"
  const [loading, setLoading] = useState(true);

  const { draftBooking, addPrasadToDraft, removePrasadFromDraft, updateDraft } = useBooking();
  const { showToast } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrasad = async () => {
      setLoading(true);
      try {
        const data = await api.getPrasadItems();
        setPrasadList(data);
      } catch (err) {
        console.error('Failed to load prasad items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrasad();
  }, []);

  // Sync with URL query parameter changes
  useEffect(() => {
    const templeParam = searchParams.get('temple');
    if (templeParam && templeParam !== selectedTemple) {
      setSelectedTemple(templeParam);
    }
  }, [searchParams]);

  const handleTempleTabChange = (templeId) => {
    setSelectedTemple(templeId);
    if (templeId === 'all') {
      searchParams.delete('temple');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ temple: templeId });
    }
  };

  const filteredPrasad = prasadList.filter((item) => {
    // 1. Temple filter
    const matchesTemple = selectedTemple === 'all' || item.templeId === selectedTemple;
    // 2. Category filter
    const matchesCategory =
      selectedCategory === 'all' ||
      item.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesTemple && matchesCategory;
  });

  const totalPrasadAmount = draftBooking.prasadCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckoutPrasad = () => {
    if (draftBooking.prasadCart.length === 0) {
      showToast('Please add at least one Sacred Prasad box to your order', 'warning');
      return;
    }
    updateDraft({
      totalAmount:
        draftBooking.vipPassFee +
        totalPrasadAmount +
        (deliveryMode === 'SPEED_POST_DELIVERY' ? 60 : 0),
    });

    if (!user) {
      showToast('Please sign in to complete your Sacred Prasadam order.', 'info');
      navigate('/login?redirect=/payment');
      return;
    }

    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] py-10 sm:py-14 pb-28 space-y-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── Page Title & Hero Header ── */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E97820]/10 border border-[#E97820]/30 text-[#E97820] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pure Gir Cow Desi Ghee Certified Offerings</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#102A56] tracking-tight">
            Sacred Temple Prasadam Store
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-light leading-relaxed">
            Handcrafted with supreme devotion inside holy temple trust kitchens. Consecrated during daily Aarti ceremonies, delivered across India via Speed Post or ready for fast counter pickup.
          </p>
        </div>

        {/* ── 1. Temple Selector Buttons (First-Class Feature) ── */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 text-center sm:text-left">
            Select Pilgrimage Shrine
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {TEMPLE_TABS.map((tab) => {
              const active = selectedTemple === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTempleTabChange(tab.id)}
                  className={`px-4 py-3.5 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between gap-2 ${
                    active
                      ? 'bg-[#102A56] text-white border-[#102A56] shadow-md -translate-y-0.5'
                      : 'bg-white text-slate-700 border-[#E5DED0] hover:border-[#E97820]/40 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{tab.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        active ? 'bg-white/20 text-[#D5A63A]' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count} Items
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-xs sm:text-[13px] block leading-tight">
                      {tab.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. Category Filter & Delivery Mode Switcher ── */}
        <div className="bg-white rounded-2xl border border-[#E5DED0] p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#E97820] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Delivery Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl self-start md:self-auto">
            <button
              onClick={() => setDeliveryMode('TEMPLE_COUNTER_PICKUP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                deliveryMode === 'TEMPLE_COUNTER_PICKUP'
                  ? 'bg-[#102A56] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#102A56]'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#D5A63A]" />
              <span>Counter Pickup (Free)</span>
            </button>
            <button
              onClick={() => setDeliveryMode('SPEED_POST_DELIVERY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                deliveryMode === 'SPEED_POST_DELIVERY'
                  ? 'bg-[#102A56] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#102A56]'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#E97820]" />
              <span>Speed Post (+₹60)</span>
            </button>
          </div>
        </div>

        {/* ── 3. Prasad Catalog Grid ── */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#E97820] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-600">Loading Sacred Prasadam...</p>
          </div>
        ) : filteredPrasad.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-[#E5DED0] p-8 space-y-3">
            <p className="text-base font-semibold text-[#102A56]">No prasad items match this filter.</p>
            <button
              onClick={() => {
                setSelectedTemple('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-[#E97820] text-white text-xs font-semibold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredPrasad.map((item) => {
              const inCart = draftBooking.prasadCart.find((p) => p.id === item.id);
              const prasadImg = getPrasadItemImage(item.id, item.templeId);

              return (
                <div
                  key={item.id}
                  className="editorial-card overflow-hidden flex flex-col justify-between group"
                >
                  {/* Image with overlay tags */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                    <img
                      src={prasadImg}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102A56]/60 via-transparent to-transparent" />

                    {/* Temple badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#102A56] px-2.5 py-1 rounded-md text-[11px] font-bold shadow-md flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-[#E97820]" />
                      <span>{item.templeName.replace('Shree ', '').replace(' Temple', '').replace(' Jyotirlinga', '').replace(' Shaktipeeth', '')}</span>
                    </div>

                    {/* Price badge */}
                    <div className="absolute top-3 right-3 bg-[#E97820] text-white px-3 py-1 rounded-md text-xs font-bold shadow-md">
                      ₹{item.price}
                    </div>

                    {/* Weight & Category chip on image bottom */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white font-medium">
                      <span className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                        {item.weight}
                      </span>
                      {item.pureGheeCertified && (
                        <span className="bg-emerald-600/90 text-white backdrop-blur-sm px-2 py-0.5 rounded font-semibold text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3" /> Pure Ghee
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="text-[#D5A63A] uppercase tracking-wider font-semibold">
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Shelf life: {item.shelfLife || '25 Days'}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-semibold text-[#102A56] leading-snug">
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {/* Items Included checklist */}
                      {item.itemsIncluded && (
                        <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                            Sacred Contents:
                          </span>
                          <ul className="text-[11.5px] text-slate-600 space-y-1">
                            {item.itemsIncluded.slice(0, 3).map((inc, i) => (
                              <li key={i} className="flex items-start gap-1.5 leading-tight">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="truncate">{inc}</span>
                              </li>
                            ))}
                            {item.itemsIncluded.length > 3 && (
                              <li className="text-[10px] text-slate-400 pl-5">
                                + {item.itemsIncluded.length - 3} more sacred items
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action / Cart Controls */}
                    <div className="pt-3 border-t border-[#EBE4D5]">
                      {inCart ? (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                          <span className="text-xs font-bold text-emerald-800 px-2">
                            {inCart.quantity} in Bag (₹{inCart.quantity * item.price})
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => removePrasadFromDraft(item.id)}
                              className="p-1.5 bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                              title="Decrease quantity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => addPrasadToDraft(item, 1)}
                              className="p-1.5 bg-[#102A56] text-white hover:bg-[#1B3B74] rounded-lg transition-colors"
                              title="Add more"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            addPrasadToDraft(item, 1);
                            showToast(`Added ${item.name} to your sacred bag!`, 'success');
                          }}
                          className="w-full py-2.5 rounded-xl bg-[#102A56] hover:bg-[#1B3B74] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-[#D5A63A]" />
                          <span>Order Sacred Prasad</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 4. Floating Cart Checkout Bar ── */}
        {draftBooking.prasadCart.length > 0 && (
          <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[calc(100vw-24px)] sm:w-full px-1 sm:px-4 animate-fade-up">
            <div className="bg-[#102A56] text-white p-3.5 sm:p-5 rounded-2xl shadow-2xl border border-[#D5A63A] flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E97820] flex items-center justify-center text-white shrink-0">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[11px] sm:text-xs text-slate-300 block">
                    {draftBooking.prasadCart.reduce((s, i) => s + i.quantity, 0)} Prasad Box(es) in Bag
                  </span>
                  <strong className="text-base sm:text-lg font-bold text-[#D5A63A] font-serif">
                    Total: ₹{totalPrasadAmount}
                  </strong>
                </div>
              </div>

              <button
                onClick={handleCheckoutPrasad}
                className="w-full xs:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#E97820] hover:bg-[#D36A18] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all shrink-0 min-h-[44px]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── 5. Trust & Quality Banner ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-white border border-[#EBE5D8] rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#102A56]">100% Authentic Temple Kitchen</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Prepared fresh in sanctified temple trust kitchens with pure Gir cow Desi Ghee.</p>
            </div>
          </div>
          <div className="bg-white border border-[#EBE5D8] rounded-xl p-4 flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#E97820] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#102A56]">Express Speed Post Dispatch</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Dispatched within 24 hours of Aarti offering with hermetic vacuum packaging.</p>
            </div>
          </div>
          <div className="bg-white border border-[#EBE5D8] rounded-xl p-4 flex items-start gap-3">
            <Package className="w-5 h-5 text-[#D5A63A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#102A56]">Fast Counter Pickup</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Show your digital barcode at Gate 1 prasad counter for immediate zero-wait handover.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
