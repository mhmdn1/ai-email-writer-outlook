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
    ? `\n\nBackground about the sender (use this to make the email more relevant and accurate):\n${userContext}`
    : '';

  let systemPrompt;

  if (mode === 'reply' && originalEmail) {
    systemPrompt = `You are an expert email writer.${contextBlock}

The user wants to reply to the following email:
---
${originalEmail}
---

Write a reply based on the user's instructions. Write in a ${tone} tone. Length: ${lengthGuide}.
Output ONLY in this exact format — two parts separated by a blank line:
SUBJECT: [the reply subject line, starting with Re: if appropriate]

[the email body only — no greeting label, no closing, no signature, no markdown]`;
  } else {
    systemPrompt = `You are an expert email writer.${contextBlock}

Write an email based on the user's instructions. Write in a ${tone} tone. Length: ${lengthGuide}.
Output ONLY in this exact format — two parts separated by a blank line:
SUBJECT: [a concise subject line for this email]

[the email body only — no subject line, no greeting label, no closing, no signature, no markdown]`;
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
