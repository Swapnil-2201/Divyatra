import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  ArrowRight,
  ExternalLink,
  Flame,
  Calendar,
  Activity,
  ShoppingBag,
  HeartPulse,
  Compass,
  Building2,
  Clock,
  Sparkles,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { TEMPLES_DATA } from '../../data/temples';

const MULTILINGUAL_TEMPLE_KEYWORDS = {
  somnath: ['somnath', 'सोमनाथ', 'સોમનાથ', 'shiv', 'shiva', 'શિવ', 'મહાદેવ', 'jyotirlinga', 'જ્યોતિર્લિંગ', 'veraval', 'વેરાવળ'],
  dwarka: ['dwarka', 'द्वारका', 'દ્વારકા', 'dwarkadhish', 'द्वारकाधीश', 'દ્વારકાધીશ', 'krishna', 'કૃષ્ણ', 'jagat mandir', 'જગત મંદિર'],
  ambaji: ['ambaji', 'अंबाजी', 'અંબાજી', 'shaktipeeth', 'શક્તિપીઠ', 'mata', 'માતાજી', 'amba', 'અંબા', 'gabbar', 'ગબ્બર'],
  pavagadh: ['pavagadh', 'पावागढ़', 'પાવાગઢ', 'mahakali', 'महाकाली', 'મહાકાળી', 'champaner', 'ચાંપાનેર', 'ropeway', 'રોપવે']
};

export const NavbarSearch = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Focus input automatically when search opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle escape key & keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < searchResults.length ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleSelectResult(searchResults[selectedIndex]);
        } else if (query.trim()) {
          navigate(`/temples?search=${encodeURIComponent(query.trim())}`);
          onClose();
        }
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  // Pre-built searchable dataset
  const searchableItems = useMemo(() => {
    const items = [];

    // 1. Temples
    TEMPLES_DATA.forEach((temple) => {
      const localizedName = t(`templeData.${temple.id}.name`, { defaultValue: temple.name });
      const localizedShortName = t(`templeData.${temple.id}.shortName`, { defaultValue: temple.shortName || temple.name });
      const localizedDeity = t(`templeData.${temple.id}.deity`, { defaultValue: temple.deity });
      const localizedLocation = t(`templeData.${temple.id}.location`, { defaultValue: temple.location });
      const extraKeywords = MULTILINGUAL_TEMPLE_KEYWORDS[temple.id] || [];

      items.push({
        id: `temple-${temple.id}`,
        type: 'TEMPLE',
        title: localizedName,
        subtitle: `${localizedDeity} • ${localizedLocation}`,
        badge: 'Temple Page',
        badgeColor: 'bg-orange-100 text-[#E97820] border-orange-200',
        icon: Building2,
        iconColor: 'text-[#E97820] bg-orange-50',
        url: `/temples/${temple.id}`,
        urlLabel: `/temples/${temple.id}`,
        keywords: [
          temple.name.toLowerCase(),
          temple.shortName.toLowerCase(),
          localizedName.toLowerCase(),
          localizedShortName.toLowerCase(),
          temple.deity.toLowerCase(),
          temple.location.toLowerCase(),
          temple.id,
          'temple',
          'mandir',
          'darshan',
          'મંદિર',
          'દર્શન',
          ...extraKeywords
        ]
      });

      // Temple specific booking shortcut
      items.push({
        id: `booking-${temple.id}`,
        type: 'BOOKING',
        title: `Book ${localizedShortName} Darshan Pass`,
        subtitle: `Digital QR E-Pass • Daily Slots • Avg wait ${temple.estimatedWait}m`,
        badge: 'Darshan Pass',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: Calendar,
        iconColor: 'text-emerald-600 bg-emerald-50',
        url: `/booking?temple=${temple.id}`,
        urlLabel: `/booking?temple=${temple.id}`,
        keywords: [temple.id, temple.shortName.toLowerCase(), localizedShortName.toLowerCase(), 'book', 'booking', 'pass', 'slot', 'vip', 'darshan', 'બુકિંગ', 'પાસ', ...extraKeywords]
      });

      // Temple specific Live Darshan shortcut
      items.push({
        id: `live-${temple.id}`,
        type: 'LIVE',
        title: `${localizedShortName} Live Darshan Feed`,
        subtitle: `24x7 HD Stream & Aarti Broadcasts • Official Feed`,
        badge: 'Live Stream',
        badgeColor: 'bg-red-100 text-red-700 border-red-200',
        icon: Flame,
        iconColor: 'text-red-600 bg-red-50',
        url: `/live-darshan?temple=${temple.id}`,
        urlLabel: `/live-darshan?temple=${temple.id}`,
        keywords: [temple.id, temple.shortName.toLowerCase(), localizedShortName.toLowerCase(), 'live', 'stream', 'aarti', 'video', 'darshan', 'youtube', 'લાઇવ', 'આરતી', ...extraKeywords]
      });

      // Temple specific Queue Telemetry shortcut
      items.push({
        id: `crowd-${temple.id}`,
        type: 'QUEUE',
        title: `${localizedShortName} Live Queue & Wait Time`,
        subtitle: `Crowd density: ${temple.crowdLevel} • Current occupancy: ${temple.occupancy?.toLocaleString()}`,
        badge: 'Queue Status',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Activity,
        iconColor: 'text-blue-600 bg-blue-50',
        url: `/live-crowd?temple=${temple.id}`,
        urlLabel: `/live-crowd?temple=${temple.id}`,
        keywords: [temple.id, temple.shortName.toLowerCase(), localizedShortName.toLowerCase(), 'crowd', 'queue', 'wait', 'density', 'rush', 'line', 'ભીડ', 'લાઈન', ...extraKeywords]
      });

      // Temple Aarti Timings shortcut
      items.push({
        id: `aarti-${temple.id}`,
        type: 'AARTI',
        title: `${localizedShortName} Aarti Schedules & Timings`,
        subtitle: `Next Aarti: ${temple.nextAarti} • Morning & Evening rituals`,
        badge: 'Aarti Schedule',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: Clock,
        iconColor: 'text-amber-600 bg-amber-50',
        url: `/temples/${temple.id}`,
        urlLabel: `/temples/${temple.id}`,
        keywords: [temple.id, temple.shortName.toLowerCase(), localizedShortName.toLowerCase(), 'aarti', 'timing', 'schedule', 'mangla', 'sandhya', 'shringar', 'bhog', 'puja', 'આરતી', 'પૂજા', ...extraKeywords]
      });
    });

    // 2. Global Portal Features & Services
    const generalServices = [
      {
        id: 'service-plan-yatra',
        type: 'SERVICE',
        title: 'Plan 4-Dham Gujarat Yatra Itinerary',
        subtitle: 'Optimal route calculator, travel times, maps & seasonal recommendations',
        badge: 'Yatra Planner',
        badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Compass,
        iconColor: 'text-purple-600 bg-purple-50',
        url: '/plan-yatra',
        urlLabel: '/plan-yatra',
        keywords: ['plan', 'yatra', 'itinerary', 'route', '4-dham', 'distance', 'map', 'travel', 'trip', 'tour']
      },
      {
        id: 'service-prasad',
        type: 'SERVICE',
        title: 'Order Sacred Temple Mahaprasad',
        subtitle: 'Authentic temple prasad packs delivered directly to your home address',
        badge: 'Prasadam',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: ShoppingBag,
        iconColor: 'text-amber-600 bg-amber-50',
        url: '/prasad',
        urlLabel: '/prasad',
        keywords: ['prasad', 'prasadam', 'bhog', 'sweets', 'order', 'delivery', 'panchamrut', 'laddu', 'mohandthal']
      },
      {
        id: 'service-emergency',
        type: 'SERVICE',
        title: 'Emergency SOS & Medical Helplines',
        subtitle: 'Police 112, Ambulance 108, Lost & Found, First Aid & Wheelchair help',
        badge: 'Emergency SOS',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: HeartPulse,
        iconColor: 'text-rose-600 bg-rose-50',
        url: '/emergency-help',
        urlLabel: '/emergency-help',
        keywords: ['emergency', 'sos', 'police', 'ambulance', 'hospital', 'doctor', 'medical', 'help', 'wheelchair', 'lost']
      },
      {
        id: 'service-all-temples',
        type: 'SERVICE',
        title: 'All Gujarat Temples Directory',
        subtitle: 'Explore Somnath, Dwarkadhish, Ambaji, and Pavagadh shrines',
        badge: 'Directory',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: Building2,
        iconColor: 'text-slate-600 bg-slate-50',
        url: '/temples',
        urlLabel: '/temples',
        keywords: ['all temples', 'temples', 'shrine', 'gujarat', 'somnath', 'dwarka', 'ambaji', 'pavagadh']
      },
      {
        id: 'service-donation',
        type: 'SERVICE',
        title: 'Offer Sacred E-Hundi & Temple Donations',
        subtitle: 'Support Annakshetra, Goshala, and Sanctum Restoration with 80G tax receipt',
        badge: 'E-Hundi',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Coins,
        iconColor: 'text-yellow-600 bg-yellow-50',
        url: '/temples',
        urlLabel: '/temples (Select Temple & Donate)',
        keywords: ['donation', 'donate', 'e-hundi', 'hundi', 'annakshetra', 'goshala', '80g', 'seva', 'trust']
      }
    ];

    return [...items, ...generalServices];
  }, []);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default recommended quick searches
      return searchableItems.filter(item => 
        item.type === 'TEMPLE' || item.id === 'service-plan-yatra' || item.id === 'service-prasad'
      ).slice(0, 6);
    }

    // Split search words for multi-token matching
    const tokens = q.split(/\s+/);

    return searchableItems
      .filter((item) => {
        const fullText = `${item.title} ${item.subtitle} ${item.keywords.join(' ')}`.toLowerCase();
        return tokens.every((token) => fullText.includes(token));
      })
      .slice(0, 8);
  }, [query, searchableItems]);

  const handleSelectResult = (item) => {
    navigate(item.url);
    onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (searchResults[selectedIndex]) {
      handleSelectResult(searchResults[selectedIndex]);
    } else if (query.trim()) {
      navigate(`/temples?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="border-t border-[#EBE5D8] bg-[#FBF9F4] shadow-2xl relative z-50 animate-fadeIn">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        
        {/* Search Input Bar */}
        <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#E97820]" style={{ width: 18, height: 18 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search Somnath, Dwarka, Ambaji, Pavagadh, Aarti, Pass, Prasad..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border-2 border-[#E5DED0] focus:border-[#E97820] rounded-2xl text-xs sm:text-sm text-[#102A56] placeholder-slate-400 focus:outline-none shadow-sm transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-4 sm:px-5 py-2.5 bg-[#102A56] hover:bg-[#1B3B74] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 min-h-[42px]"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D5A63A]" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center"
            title="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Suggestion Tags (When query is short) */}
        {!query && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2.5 pb-1 text-[11px] text-slate-500">
            <span className="font-semibold text-[#102A56] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E97820]" />
              Popular:
            </span>
            {['Dwarka', 'Somnath Live', 'Ambaji Pass', 'Pavagadh', 'Aarti Timings', 'Prasadam', 'SOS Helpline'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  setSelectedIndex(0);
                }}
                className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-[#E97820] hover:border-orange-200 border border-[#E5DED0] rounded-full text-slate-600 font-medium transition-colors shadow-xs"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Search Results Dropdown List */}
        <div ref={dropdownRef} className="mt-3 bg-white border border-[#E5DED0] rounded-2xl shadow-xl overflow-hidden divide-y divide-gray-100 max-h-[380px] overflow-y-auto animate-fadeIn">
          
          <div className="px-3.5 py-2 bg-[#FAF8F5] border-b border-[#EBE4D5] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>{query ? `Matching Results (${searchResults.length})` : 'Recommended Destinations & Services'}</span>
            <span className="text-[10px] text-slate-400 font-normal normal-case hidden sm:inline">Use ↑ ↓ arrow keys to select</span>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#E97820] flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#102A56]">No direct pages found for "{query}"</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Try searching for <button onClick={() => setQuery('Somnath')} className="text-[#E97820] underline font-semibold">Somnath</button>, <button onClick={() => setQuery('Dwarka')} className="text-[#E97820] underline font-semibold">Dwarka</button>, <button onClick={() => setQuery('Aarti')} className="text-[#E97820] underline font-semibold">Aarti</button>, or <button onClick={() => setQuery('Booking')} className="text-[#E97820] underline font-semibold">Booking</button>.
              </p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComponent = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 sm:p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected ? 'bg-orange-50/70 border-l-4 border-[#E97820]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    
                    {/* Category Icon */}
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 shadow-xs ${item.iconColor}`}>
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs sm:text-sm font-bold text-[#102A56] group-hover:text-[#E97820] transition-colors truncate">
                          {item.title}
                        </strong>
                        <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                        {item.subtitle}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <span className="text-[#E97820] font-semibold">Leads to:</span>
                        <span className="truncate">{item.urlLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Destination Action Link / Arrow */}
                  <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-[#E97820] transition-colors">
                    <span className="text-[11px] font-bold hidden sm:inline">Go to page</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          )}

          {/* Footer of Search Dropdown */}
          <div className="p-2.5 bg-[#FAF8F5] border-t border-[#EBE4D5] flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              Showing top verified pilgrimage destinations & services
            </span>
            <button
              onClick={() => {
                navigate(`/temples?search=${encodeURIComponent(query.trim())}`);
                onClose();
              }}
              className="font-bold text-[#E97820] hover:underline flex items-center gap-1 text-xs"
            >
              <span>View in All Temples &rarr;</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NavbarSearch;
