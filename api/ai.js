// Vercel Serverless Function: /api/ai
// Node 18+ (fetch yra global)
export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  // Leidžiami origin'ai (iš ENV, kableliais). Fallback – tavo GitHub Pages URL'ai.
  const envList = (process.env.ALLOWED_ORIGINS
      || 'https://confromzone.github.io,https://confromzone.github.io/ai-concierge-site')
    .split(',').map(s => s.trim()).filter(Boolean);

  const origin = String(req.headers.origin || '');
  if (!envList.some(a => origin.startsWith(a))) {
    return res.status(403).send('Forbidden');
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lang = body.lang === 'lt' ? 'lt' : 'en';

    const system = {
      role: 'system',
      content:
        lang === 'lt'
          ? 'Tu esi AI asistentas, padedantis parduoti AI concierge. Atsakinėk aiškiai ir trumpai. Jei tinka — pasiūlyk demo ir paprašyk kontakto.'
          : 'You are an AI concierge for sales. Be clear and concise. Offer a demo and ask for contact when relevant.',
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // ← ENV
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [system, ...messages],
        temperature: 0.6,
        max_tokens: 600
      })
    });

    const data = await r.json();
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e?.message || 'AI error' });
  }
}
