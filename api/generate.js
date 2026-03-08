export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { apiKey, prompt, tone, lengthGuide, mode, originalEmail, userContext } = req.body;

  if (!apiKey || !prompt) {
    return res.status(400).json({ error: 'Missing apiKey or prompt' });
  }

  const contextBlock = userContext
    ? `\n\nContext about the sender — use this to make the email feel natural and relevant:\n${userContext}`
    : '';

  const humanRules = `
CRITICAL RULES — read carefully:
- Write like a real person, not a corporate assistant. The reader should never suspect this was AI-written.
- Be direct. Get to the point in the first sentence. No warm-up lines.
- Use short sentences. Mix them with occasional longer ones for natural rhythm.
- Never start with: "I hope this email finds you well", "I am writing to", "I wanted to reach out", "As per our conversation", "Please don't hesitate", "I trust", "Thank you for your email", or any similar filler opener.
- No corporate buzzwords: avoid "leverage", "synergy", "circle back", "touch base", "going forward", "kindly", "per our discussion", "please be advised", "as mentioned".
- Do not over-explain or pad. If the point can be made in 5 words, use 5 words.
- Vary sentence starters — do not begin multiple sentences with "I".
- No passive voice unless it sounds natural.
- Match the energy of the formality level: ${tone}. Formal should feel polished, not robotic. Casual should feel like a real message between people who know each other.
- Length: ${lengthGuide}. Respect this strictly — do not pad to fill space.`;

  let systemPrompt;

  if (mode === 'reply' && originalEmail) {
    systemPrompt = `You write emails that sound like real humans wrote them.${contextBlock}

The user is replying to this email:
---
${originalEmail}
---
${humanRules}

Output ONLY in this exact format:
SUBJECT: [reply subject line — start with Re: if appropriate]

[email body only — no greeting, no closing, no signature, no markdown]`;
  } else {
    systemPrompt = `You write emails that sound like real humans wrote them.${contextBlock}
${humanRules}

Output ONLY in this exact format:
SUBJECT: [short, specific subject line — no clickbait, no generic titles]

[email body only — no greeting, no closing, no signature, no markdown]`;
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 700,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data.error?.message || 'API error' });
  }

  const raw = data.choices[0].message.content.trim();

  // Parse SUBJECT: line from response
  const subjectMatch = raw.match(/^SUBJECT:\s*(.+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : '';
  const body = raw.replace(/^SUBJECT:\s*.+\n*/i, '').trim();

  res.status(200).json({ text: body, subject });
}
