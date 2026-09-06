/**
 * Vercel Serverless Function: GET /api/crowd
 * DivYatra Crowd Telemetry for Standalone Simulator
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const templeId = req.query?.templeId || 'somnath';

  return res.status(200).json({
    success: true,
    data: {
      templeId,
      templeName: 'Shree Somnath Jyotirlinga',
      crowdPercentage: 58,
      estimatedWaitMinutes: 34,
      statusLabel: 'Moderate',
      status: 'Moderate',
      flowRatePerMinute: 45,
      zone: 'Gate 1 Turnstile',
      lastUpdated: new Date().toISOString(),
    },
  });
}
