/**
 * Vercel Serverless Function: POST /api/auth/login
 * DivYatra Devotee & Authority Authentication Endpoint
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
    const { email = '', password = '' } = req.body || {};
    const cleanEmail = email.toLowerCase().trim();

    let role = 'pilgrim';
    let name = 'Ramesh Patel (Pilgrim)';
    let assignedTemple = null;

    if (cleanEmail.includes('admin')) {
      role = 'admin';
      name = 'Pravin Shah (Trust Admin)';
    } else if (cleanEmail.includes('authority') || cleanEmail.includes('officer')) {
      role = 'authority';
      name = 'Inspector R. Jadeja (Security Officer)';
      assignedTemple = 'somnath';
    }

    const user = {
      id: `usr-${Date.now()}`,
      name,
      email: cleanEmail || 'pilgrim@divyatra.in',
      role,
      assignedTemple,
      phone: '+91 98250 12345'
    };

    const token = `jwt_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return res.status(200).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Authentication error'
    });
  }
}
