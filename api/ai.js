// api/ai.js  — Edge-safe versija (be "openai" paketo)
export const config = { runtime: 'edge' };

const MODEL = 'gpt-4o-mini';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Only POST allowed' }, 405);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'Missing OPENAI_API_KEY' }, 500);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { messages = [], lang = 'en', temperature = 0.2 } = body;

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature,
      }),
    });

    const raw = await r.text();

    if (!r.ok) {
      // 401/403 – dažniausiai raktas/prieiga
      return json(
        {
          error: true,
          status: r.status,
          message:
            /401|403/.test(String(r.status))
              ? 'OpenAI API rejected the request (check API key / model access).'
              : 'OpenAI API error.',
          detail: raw,
        },
        r.status
      );
    }

    const data = JSON.parse(raw);
    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      (lang === 'lt'
        ? 'Atsiprašau, šiuo metu negaliu atsakyti. Pabandykite dar kartą.'
        : "Sorry, I can't answer right now. Please try again.");

    return json({ reply: text });
  } catch (err) {
    return json(
      {
        error: true,
        message: 'Internal error. Please try again in a moment.',
        detail: String(err),
      },
      500
    );
  }
}
