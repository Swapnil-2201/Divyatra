import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCrowd } from '../context/CrowdContext';
import { TempleCard } from '../components/common/TempleCard';
import { Search, Filter, Sparkles, MapPin, Users, Clock, SlidersHorizontal } from 'lucide-react';

export const TemplesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { temples, loading } = useCrowd();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [crowdFilter, setCrowdFilter] = useState('all'); // 'all', 'low', 'moderate', 'high'
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'wait_asc', 'capacity_desc'

  const filteredTemples = useMemo(() => {
    return temples
      .filter((t) => {
        const matchesSearch =
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.deity.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCrowd =
          crowdFilter === 'all' ||
          (crowdFilter === 'low' && t.liveStatus.crowdPercentage < 45) ||
          (crowdFilter === 'moderate' && t.liveStatus.crowdPercentage >= 45 && t.liveStatus.crowdPercentage < 75) ||
          (crowdFilter === 'high' && t.liveStatus.crowdPercentage >= 75);

        return matchesSearch && matchesCrowd;
      })
      .sort((a, b) => {
        if (sortBy === 'wait_asc') {
          return a.liveStatus.estimatedWaitMinutes - b.liveStatus.estimatedWaitMinutes;
        }
        if (sortBy === 'capacity_desc') {
          return b.liveStatus.dailyCapacity - a.liveStatus.dailyCapacity;
        }
        return 0;
      });
  }, [temples, searchTerm, crowdFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8F5EF] py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E97820]/10 border border-[#E97820]/30 text-[#E97820] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sacred Shrines of Gujarat</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#102A56]">
            Pilgrimage Temple Discovery
          </h1>
          <p className="text-xs sm:text-base text-slate-600">
            Explore live crowd statuses, waiting times, Aarti schedules, and instant Darshan reservations for Gujarat's most revered temples.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-[#E5DED0] p-3.5 sm:p-5 shadow-luxury space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search temple name, deity, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820] text-[#102A56] min-h-[44px]"
              />
            </div>

            {/* Crowd Level Filter */}
            <div>
              <select
                value={crowdFilter}
                onChange={(e) => setCrowdFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820] text-[#102A56] font-medium min-h-[44px]"
              >
                <option value="all">All Crowd Levels</option>
                <option value="low">Low Wait (&lt; 45%)</option>
                <option value="moderate">Moderate Flow (45-75%)</option>
                <option value="high">High Crowd (&gt; 75%)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#E97820] text-[#102A56] font-medium min-h-[44px]"
              >
                <option value="popular">Sort: Featured</option>
                <option value="wait_asc">Sort: Lowest Wait Time</option>
                <option value="capacity_desc">Sort: Highest Capacity</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-xs text-slate-500 pt-2 border-t border-gray-100">
            <span>Showing <strong>{filteredTemples.length}</strong> Sacred Shrines</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live CCTV Telemetry Synced
            </span>
          </div>
        </div>

        {/* Temples Grid */}
        {filteredTemples.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredTemples.map((temple) => (
              <TempleCard key={temple.id} temple={temple} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E5DED0] space-y-3">
            <MapPin className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#102A56]">No Temples Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setCrowdFilter('all'); }}
              className="px-4 py-2 bg-[#E97820] text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
