/**
 * Vercel Serverless Function: POST /api/yatra/plan
 * DivYatra AI Predictive Pilgrimage Planner
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      destination = 'all',
      startDate,
      durationDays = 4,
      groupType = 'family',
      crowdPreference = 'avoid_rush',
      travelMode = 'car',
      specialAssistance = false
    } = req.body || {};

    const dateObj = new Date(startDate || Date.now());
    const isAll = destination === 'all';
    const schedule = [];

    if (isAll) {
      schedule.push(
        {
          day: 1,
          date: dateObj.toISOString().split('T')[0],
          title: 'Day 1: Arrival & Holy Somnath Jyotirlinga',
          temple: 'Shree Somnath Jyotirlinga',
          recommendedSlot: '06:30 AM - 08:00 AM (Prabhat Aarti)',
          crowdStatus: 'Low Crowd Forecast (< 20 min wait)',
          activities: [
            '06:30 AM: Morning Prabhat Aarti with ocean view',
            '09:00 AM: Sagar Darshan walkway & Banstambh observation',
            '12:00 PM: Traditional Gujarati Thali at Sardar Patel Annakshetra',
            '04:30 PM: Bhalka Teerth & Triveni Sangam Snan',
            '08:00 PM: Cinematic Sound & Light Show by Arabian Sea'
          ],
          aiTip: 'Visit between 6:30 AM - 8:00 AM to bypass the 7:00 PM evening peak surge (saving ~45 minutes in line).'
        },
        {
          day: 2,
          date: new Date(dateObj.getTime() + 86400000).toISOString().split('T')[0],
          title: 'Day 2: Coastal Drive & Shree Dwarkadhish Kingdom',
          temple: 'Shree Dwarkadhish Temple (Jagat Mandir)',
          recommendedSlot: '05:00 PM - 07:00 PM (Uthapan)',
          crowdStatus: 'Moderate Flow (Pre-book recommended)',
          activities: [
            '08:00 AM: Scenic coastal drive from Somnath to Dwarka (approx 4.5 hrs via Porbandar)',
            '02:00 PM: Hotel check-in & rest',
            '04:00 PM: Holy Gomti Ghat dip & Sudama Setu walk',
            '05:30 PM: Enter Moksha Dwaar via DivYatra Fast Queue',
            '07:30 PM: Grand 52-Gaj Dhwajarohan ceremony & Sandhya Aarti'
          ],
          aiTip: 'Moksha Dwaar experiences heaviest rush from 11:30 AM to 1:00 PM. We recommend early morning or late afternoon.'
        },
        {
          day: 3,
          date: new Date(dateObj.getTime() + 86400000 * 2).toISOString().split('T')[0],
          title: 'Day 3: Sacred Ambaji Shaktipeeth & Gabbar Hill',
          temple: 'Shree Arasuri Ambaji Mata Temple',
          recommendedSlot: '10:00 AM - 11:30 AM',
          crowdStatus: 'Smooth Flow (< 15 min wait)',
          activities: [
            '06:00 AM: Morning transit towards Banaskantha Aravalli hills',
            '10:30 AM: DivYatra verified Darshan of sacred Viso Yantra',
            '12:30 PM: Traditional Mohanthal Prasad collection at Counter 2',
            '03:30 PM: Gabbar Hill Ropeway ride to Akhand Jyot shrine',
            '07:45 PM: 3D Light & Sound Projection Show on Gabbar Rock'
          ],
          aiTip: 'Ropeway waiting time at Gabbar is lowest between 3:00 PM - 4:30 PM.'
        },
        {
          day: 4,
          date: new Date(dateObj.getTime() + 86400000 * 3).toISOString().split('T')[0],
          title: 'Day 4: Pavagadh Mahakali Summit & Champaner Heritage',
          temple: 'Shree Mahakali Mata Temple, Pavagadh',
          recommendedSlot: '05:30 AM - 07:30 AM (Sunrise Darshan)',
          crowdStatus: 'Peak Ropeway Queue - Early Start Advised',
          activities: [
            '05:30 AM: Board Machi Base high-speed ropeway at dawn',
            '06:30 AM: Sunrise darshan at hilltop Mahakali Garbhagriha',
            '08:30 AM: Walk the ancient Cliff Parikrama pathway',
            '11:00 AM: Descend to explore UNESCO World Heritage Champaner Fort',
            '02:00 PM: Yatra conclusion & blessed departure'
          ],
          aiTip: 'Avoid summit stair ascent between 10:00 AM and 1:00 PM when heat and ropeway queue both peak.'
        }
      );
    } else {
      const destNames = {
        somnath: 'Shree Somnath Jyotirlinga',
        dwarka: 'Shree Dwarkadhish Mandir',
        ambaji: 'Shree Arasuri Ambaji Mata Temple',
        pavagadh: 'Shree Mahakali Mata Temple, Pavagadh'
      };
      const destName = destNames[destination] || `${destination.charAt(0).toUpperCase() + destination.slice(1)} Temple`;
      schedule.push({
        day: 1,
        date: dateObj.toISOString().split('T')[0],
        title: `Comprehensive Pilgrimage to ${destName}`,
        temple: destName,
        recommendedSlot: crowdPreference === 'aarti_priority' ? '06:30 PM - 08:30 PM (Maha Aarti)' : '06:30 AM - 08:30 AM (Low Density)',
        crowdStatus: 'Optimized AI Flow (< 20 min wait)',
        activities: [
          '06:30 AM: Recommended entry time via pre-booked DivYatra digital pass',
          '08:00 AM: Temple Parikrama & Sanctum Darshan',
          '10:00 AM: Collect consecrated authentic Mahaprasad',
          '12:30 PM: Sacred Temple Trust Annakshetra meal',
          '04:30 PM: Heritage exploration of surrounding holy spots & teerths',
          '07:30 PM: Evening Aarti participation'
        ],
        aiTip: 'Our predictive AI forecasts a 60% drop in waiting time if entering before 08:30 AM vs the 11:30 AM peak.'
      });
    }

    const recommendation = {
      planId: `YATRA-${Date.now()}`,
      destination: isAll ? 'Gujarat 4-Dham Maha Circuit' : (destination.charAt(0).toUpperCase() + destination.slice(1) + ' Pilgrimage'),
      totalTemplesCovered: isAll ? 4 : 1,
      estimatedTotalDistanceKm: isAll ? 1420 : 60,
      predictedCrowdIndex: 'OPTIMAL (32% Average Density)',
      estimatedWaitTimeSavedHours: isAll ? 4.5 : 1.5,
      suggestedDeparture: '05:30 AM',
      emergencyHelpline: '1070 / 112 (DivYatra Integrated Helpdesk)',
      schedule
    };

    return res.status(200).json({
      success: true,
      plan: recommendation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
