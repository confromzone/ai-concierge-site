// api/ai.js
// Vercel Edge Function – greita, paprasta, be papildomų framework'ų.
import OpenAI from "openai";

export const config = { runtime: "edge" };

// Aiški sisteminė rolė: LT + EN, be halucinacijų, mandagus, trumpi atsakymai,
// kai reikia – surenka kontaktus arba nukreipia į formą.
const SYSTEM_PROMPT = `
You are "AI Concierge" for a lead-generation website. 
Goals:
- Answer briefly, clearly, and helpfully in the user's language (lt or en).
- If the user asks about plans, features, setup, or a demo — explain and offer to collect contact details (name, email, phone, company, use case).
- Be factual. If not sure — say so briefly and propose a demo.
- Never invent prices or private facts. Use the site's public copy (pricing tiers, benefits) and generic knowledge only.
- Tone: friendly, concise, confident. Avoid jargon.

Lietuviškai:
- Atsakyk trumpai, aiškiai, mandagiai.
- Jei žmogus prašo demo arba kainodaros, pasiūlyk palikti kontaktus (vardas, el. paštas, tel., įmonė, poreikis).
- Jei trūksta informacijos – pasakyk atvirai ir pasiūlyk demo.

Always keep answers 1–4 trumpų pastraipų. 
If the user sends greetings or short tests, reply in 1–2 sakiniais.
`;

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    const body = await req.json().catch(() => ({}));
    const msgs = Array.isArray(body?.messages) ? body.messages : [];
    const lang = (body?.lang || "en").toLowerCase().startsWith("lt") ? "lt" : "en";

    if (!process.env.OPENAI_API_KEY) {
      return jsonResponse(
        {
          error: true,
          message:
            "Server is missing OPENAI_API_KEY. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.",
        },
        500
      );
    }
    if (!msgs.length) {
      return jsonResponse({ error: true, message: "messages[] is required" }, 400);
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Modelis: gpt-4o-mini – geras balansas tarp kokybės/greičio/kainos.
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 600,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: `User interface language: ${lang}` },
        // paskutinių 20 žinučių, jei ateina ilga istorija
        ...msgs.slice(-20),
      ],
    });

    const text =
      completion?.choices?.[0]?.message?.content?.trim() ||
      (lang === "lt"
        ? "Atsiprašau, šiuo metu negaliu atsakyti. Pabandykite dar kartą."
        : "Sorry, I can’t answer right now. Please try again.");

    return jsonResponse({ reply: text });
  } catch (err) {
    // 401/403 – dažniausiai dėl rakto ar prieigos; parodyk aiškų msg.
    const m = String(err || "");
    const isAuth = /401|403/.test(m) || /Unauthorized|Forbidden/i.test(m);

    return jsonResponse(
      {
        error: true,
        message: isAuth
          ? "OpenAI API rejected the request (check API key / model access)."
          : "Internal error. Please try again in a moment.",
        detail: m,
      },
      isAuth ? 403 : 500
    );
  }
}
