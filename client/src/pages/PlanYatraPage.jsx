import React, { useState } from 'react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  Compass,
  Calendar,
  Users,
  MapPin,
  Clock,
  Car,
  Train,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  Printer,
  ChevronRight,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlanYatraPage = () => {
  const { showToast } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const [errorState, setErrorState] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    destination: 'all', // "all", "somnath", "dwarka", "ambaji", "pavagadh"
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    durationDays: 4,
    groupType: 'family', // "family", "senior", "solo", "group"
    pilgrimCount: 2,
    crowdPreference: 'avoid_rush', // "avoid_rush", "aarti_priority", "fast_track"
    travelMode: 'car', // "car", "train", "bus"
    specialAssistance: false,
    stayType: 'trust_guesthouse'
  });

  const handleDestinationSelect = (dest) => {
    setFormData((prev) => ({
      ...prev,
      destination: dest,
      durationDays: dest === 'all' ? 4 : 2
    }));
  };

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    setErrorState(null);
    try {
      const plan = await api.generateYatraPlan(formData);
      if (!plan || typeof plan !== 'object') {
        throw new Error('Invalid Yatra plan response');
      }
      setGeneratedPlan(plan);
      setCurrentStep(6);
      showToast('Smart Yatra Itinerary Generated!', 'success');
    } catch (err) {
      console.error('Failed to generate plan:', err);
      setErrorState('Unable to generate the itinerary. Please try again.');
      showToast('Unable to generate the itinerary. Please try again.', 'error');
    } finally {
      setLoadingPlan(false);
    }
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-[#F8F5EF] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E97820]/10 border border-[#E97820]/30 text-[#E97820] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>AI Predictive Pilgrimage Planner</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#102A56]">
            Smart Yatra Itinerary Wizard
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Let our AI optimize your sacred journey to avoid peak congestion, bypass bottlenecks, and guarantee serene Darshan.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-10 shadow-luxury space-y-6 sm:space-y-8">
          
          {/* Step Indicator (Steps 1 to 5) */}
          {currentStep <= 5 && (
            <div className="space-y-3 pb-4 sm:pb-6 border-b border-[#EBE4D5]">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="text-[#E97820]">Step {currentStep} of {totalSteps}</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}% Completed</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#102A56] via-[#E97820] to-[#D5A63A] transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 1: Destination Selection */}
          {currentStep === 1 && (
            <div className="space-y-5 sm:space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#102A56]">
                  Select Pilgrimage Destination
                </h3>
                <p className="text-xs text-slate-500">Choose a single shrine or experience the complete 4-Dham Gujarat Circuit.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[
                  {
                    id: 'all',
                    title: 'Gujarat 4-Dham Circuit',
                    sub: 'Somnath + Dwarka + Ambaji + Pavagadh',
                    days: '4 Days (Recommended)',
                    icon: Sparkles,
                    highlight: true
                  },
                  {
                    id: 'somnath',
                    title: 'Shree Somnath Jyotirlinga',
                    sub: 'Veraval • 1st Shiva Jyotirlinga',
                    days: '1-2 Days',
                    icon: MapPin
                  },
                  {
                    id: 'dwarka',
                    title: 'Shree Dwarkadhish Mandir',
                    sub: 'Dwarka • Char Dham Supreme Shrine',
                    days: '1-2 Days',
                    icon: MapPin
                  },
                  {
                    id: 'ambaji',
                    title: 'Shree Ambaji Shaktipeeth',
                    sub: 'Banaskantha • Viso Yantra Shrine',
                    days: '1 Day',
                    icon: MapPin
                  },
                  {
                    id: 'pavagadh',
                    title: 'Pavagadh Mahakali Mandir',
                    sub: 'Champaner • High Altitude Peak',
                    days: '1 Day',
                    icon: MapPin
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.destination === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleDestinationSelect(item.id)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#E97820] bg-[#FFFBF7] shadow-md'
                          : 'border-[#EBE4D5] hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-[#E97820]' : 'text-gray-400'}`} />
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#E97820]" />}
                      </div>
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#102A56] mt-3">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                      <span className="inline-block mt-3 text-[10.5px] sm:text-[11px] font-bold text-[#D5A63A] bg-[#F8F5EF] px-2 py-0.5 rounded">
                        {item.days}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Date & Group Details */}
          {currentStep === 2 && (
            <div className="space-y-5 sm:space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#102A56]">
                  Travel Date & Pilgrim Group
                </h3>
                <p className="text-xs text-slate-500">Specify your commencement date and party composition.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-[#102A56] mb-2">Yatra Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-sm focus:outline-none focus:border-[#E97820] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102A56] mb-2">Number of Pilgrims</label>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {[1, 2, 4, 6, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData({ ...formData, pilgrimCount: num })}
                        className={`py-2.5 sm:py-3 rounded-xl font-bold transition-all text-center min-h-[44px] flex flex-col items-center justify-center ${
                          formData.pilgrimCount === num
                            ? 'bg-[#102A56] text-white shadow'
                            : 'bg-[#FAF8F5] text-[#102A56] border border-[#DDD5C5] hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-sm sm:text-base leading-none">{num}</span>
                        <span className="text-[9px] sm:text-[10px] opacity-80 mt-0.5">Dev</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-[#102A56] mb-2">Group Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {[
                      { id: 'family', label: 'Family with Children' },
                      { id: 'senior', label: 'Senior Citizens (60+)' },
                      { id: 'solo', label: 'Solo Pilgrim' },
                      { id: 'group', label: 'Large Group / Sangha' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, groupType: g.id })}
                        className={`p-3 sm:p-3.5 rounded-xl border text-xs font-semibold text-center transition-all min-h-[44px] flex items-center justify-center ${
                          formData.groupType === g.id
                            ? 'border-[#E97820] bg-[#FFFBF7] text-[#E97820]'
                            : 'border-[#DDD5C5] text-slate-700 bg-white'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Crowd & Priority Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#102A56]">
                  Crowd & Experience Preference
                </h3>
                <p className="text-xs text-slate-500">How should our AI optimize your queue allocation?</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 'avoid_rush',
                    title: 'Avoid Rush & Peak Density (Recommended)',
                    desc: 'Prioritizes early dawn and afternoon slots with <20 min wait times. Perfect for peaceful meditation.'
                  },
                  {
                    id: 'aarti_priority',
                    title: 'Aarti Priority (Mangala / Maha Sandhya Aarti)',
                    desc: 'Aligns itinerary directly with grand public Aartis and Deepotsav ceremonies.'
                  },
                  {
                    id: 'fast_track',
                    title: 'Fastest Darshan Throughput (Express)',
                    desc: 'Optimizes for minimal travel downtime and quickest sanctum entry passes.'
                  }
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, crowdPreference: opt.id })}
                    className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.crowdPreference === opt.id
                        ? 'border-[#E97820] bg-[#FFFBF7] shadow-sm'
                        : 'border-[#EBE4D5] bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#102A56] text-sm sm:text-base">
                        {opt.title}
                      </h4>
                      {formData.crowdPreference === opt.id && (
                        <CheckCircle2 className="w-5 h-5 text-[#E97820] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Travel & Accessibility */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#102A56]">
                  Travel Mode & Accessibility Support
                </h3>
                <p className="text-xs text-slate-500">Tell us how you are transiting between shrines.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'car', label: 'Private Car / Taxi', icon: Car, desc: 'Maximum route flexibility' },
                  { id: 'train', label: 'Indian Railways Express', icon: Train, desc: 'Veraval & Dwarka broad gauge' },
                  { id: 'bus', label: 'GSRTC Volvo / Pilgrim Coach', icon: Compass, desc: 'Temple-to-temple direct connection' }
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = formData.travelMode === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setFormData({ ...formData, travelMode: m.id })}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#E97820] bg-[#FFFBF7]'
                          : 'border-[#EBE4D5] bg-white'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-[#E97820]' : 'text-gray-400'}`} />
                      <h4 className="font-bold text-sm text-[#102A56] mt-3">{m.label}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Special Accessibility Checkbox */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <strong className="text-xs sm:text-sm font-bold text-[#102A56] block">
                      Require Wheelchair / Battery Buggy Assist
                    </strong>
                    <span className="text-[11px] text-gray-500">
                      Free temple trust ramp access and designated volunteer escort.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.specialAssistance}
                  onChange={(e) => setFormData({ ...formData, specialAssistance: e.target.checked })}
                  className="w-5 h-5 accent-[#E97820] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Stay & Review */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#102A56]">
                  Review & Generate Smart Itinerary
                </h3>
                <p className="text-xs text-slate-500">Confirm preferences before AI builds your congestion-free schedule.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Destination:</span>
                  <strong className="text-[#102A56] uppercase">{formData.destination}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Commencement:</span>
                  <strong className="text-[#102A56]">{formData.startDate}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Devotees:</span>
                  <strong className="text-[#102A56]">{formData.pilgrimCount} ({formData.groupType})</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Crowd Strategy:</span>
                  <strong className="text-[#E97820]">{formData.crowdPreference}</strong>
                </div>
              </div>

              {errorState && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️ {errorState}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Generated AI Itinerary Display */}
          {currentStep === 6 && (
            <div className="space-y-8 animate-fadeIn">
              {generatedPlan ? (
                <>
                  {/* Plan Summary Banner */}
                  <div className="p-6 rounded-3xl bg-[#102A56] text-white space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#D5A63A]">
                          AI Optimization Complete
                        </span>
                        <h3 className="font-serif text-2xl font-bold text-white">
                          {generatedPlan?.destination || 'Gujarat Pilgrimage Circuit'}
                        </h3>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        {generatedPlan?.predictedCrowdIndex || 'OPTIMAL (32% Average Density)'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-white/10">
                      <div>
                        <span className="text-gray-400 text-[10.5px] block">Wait Time Saved</span>
                        <strong className="text-emerald-400 text-base">{generatedPlan?.estimatedWaitTimeSavedHours ?? 4.5} Hours</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10.5px] block">Circuit Transit</span>
                        <strong className="text-[#D5A63A] text-base">{generatedPlan?.estimatedTotalDistanceKm ?? 1420} km</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10.5px] block">Suggested Departure</span>
                        <strong className="text-white text-base">{generatedPlan?.suggestedDeparture || '05:30 AM'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10.5px] block">Helpline</span>
                        <strong className="text-white text-base">{generatedPlan?.emergencyHelpline || '1070 / 112'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Day-by-Day Detailed Schedule */}
                  <div className="space-y-6">
                    <h4 className="font-serif text-xl font-bold text-[#102A56]">
                      Optimized Day-by-Day Schedule
                    </h4>

                    {(() => {
                      const schedule = Array.isArray(generatedPlan?.schedule)
                        ? generatedPlan.schedule
                        : Array.isArray(generatedPlan?.dailyItinerary)
                        ? generatedPlan.dailyItinerary.map((d, idx) => ({
                            day: d.day || idx + 1,
                            date: d.date || formData.startDate,
                            title: d.title || `Day ${d.day || idx + 1}: ${d.destination || 'Darshan'}`,
                            temple: d.destination || 'Sacred Temple',
                            recommendedSlot: d.recommendedSlot || '07:00 AM',
                            crowdStatus: 'Optimal Flow (< 20 min wait)',
                            activities: [d.highlight || 'Sanctum Darshan & Holy Prayers'],
                            aiTip: generatedPlan?.crowdOptimizationNote || 'Early arrival recommended.'
                          }))
                        : [];

                      if (schedule.length === 0) {
                        return (
                          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] text-center text-slate-600 text-sm">
                            No schedule items available for this selection.
                          </div>
                        );
                      }

                      return schedule.map((day, idx) => {
                        const activities = Array.isArray(day?.activities)
                          ? day.activities
                          : typeof day?.activities === 'string'
                          ? [day.activities]
                          : [];

                        return (
                          <div
                            key={day?.day || idx}
                            className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-4 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EBE4D5] gap-2">
                              <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E97820] block">
                                  Day {day?.day || idx + 1} {day?.date ? `• ${day.date}` : ''}
                                </span>
                                <h5 className="font-serif text-lg font-bold text-[#102A56]">
                                  {day?.title || `Day ${day?.day || idx + 1} Itinerary`}
                                </h5>
                              </div>
                              {day?.crowdStatus && (
                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                                  {day.crowdStatus}
                                </span>
                              )}
                            </div>

                            <div className="space-y-2">
                              <span className="text-xs font-bold text-[#102A56] uppercase tracking-wider block">
                                Recommended Sequence:
                              </span>
                              <ul className="space-y-1.5 text-xs text-slate-700">
                                {activities.map((act, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E97820] mt-1.5 shrink-0" />
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {day?.aiTip && (
                              <div className="p-3 rounded-xl bg-white border border-[#D5A63A]/40 text-xs text-slate-700 flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-[#D5A63A] shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-[#102A56] block">AI Congestion Tip:</strong>
                                  <span>{day.aiTip}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-slate-700 hover:bg-gray-50 text-xs font-bold min-h-[44px] flex items-center justify-center"
                    >
                      Create Another Plan
                    </button>

                    <div className="flex items-center gap-3">
                      <Link
                        to="/booking"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E97820] text-white hover:bg-[#D36A18] text-xs sm:text-sm font-bold shadow-md min-h-[44px] flex items-center justify-center"
                      >
                        Proceed to Book Slots &rarr;
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <p className="text-sm font-semibold text-rose-600">
                    {errorState || 'Unable to generate the itinerary. Please try again.'}
                  </p>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-5 py-2.5 rounded-xl bg-[#102A56] text-white text-xs font-bold"
                  >
                    Back to Review
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls (Steps 1 to 5) */}
          {currentStep <= 5 && (
            <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-[#EBE4D5] gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-4 sm:px-5 py-2.5 rounded-xl border border-gray-300 text-slate-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-2 min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : <div />}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#102A56] hover:bg-[#1B3B74] text-white text-xs font-bold shadow flex items-center gap-2 min-h-[44px]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={loadingPlan}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl bg-[#E97820] hover:bg-[#D36A18] text-white text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
                >
                  {loadingPlan ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Optimizing with AI Models...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Smart Yatra Plan</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
