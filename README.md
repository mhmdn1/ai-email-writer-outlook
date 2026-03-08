# AI Email Writer — Outlook Add-in

An Outlook add-in that writes professional emails for you using AI. Just describe what you want to say, and it generates a complete, structured email — ready to insert with one click.

## Features

- **Compose mode** — describe what you want to say and get a full email instantly
- **Reply mode** — reads the original email and generates a smart, contextual reply
- **Subject line generator** — auto-generates a subject line with every email
- **Formal / Semi-formal / Casual** — control the tone with a single tap
- **Structured output** — greeting, body, closing, and signature all handled automatically
- **Custom signature** — save your name and closing once, applied to every email
- **About you context** — tell the AI your role so it writes more relevant emails
- **Quick starts** — one-tap prompts for common email types (follow-up, decline meeting, etc.)
- **Free to use** — powered by Groq (free API tier)

## Install

> **Requirements:** A Microsoft 365 account with Outlook (personal or work)

### Step 1 — Download the manifest

Download [`manifest.xml`](https://outlook-ai-email-writer.vercel.app/manifest.xml) and save it to your computer.

### Step 2 — Sideload into Outlook

1. Go to **[aka.ms/olksideload](https://aka.ms/olksideload)** in your browser — this opens Outlook Web directly to the Add-ins dialog
2. Click **My add-ins** → scroll to **Custom Add-ins**
3. Click **Add a custom add-in → Add from File**
4. Upload the `manifest.xml` file you downloaded
5. Click **Install**

### Step 3 — Get your free API key

1. Sign up for free at **[console.groq.com](https://console.groq.com)**
2. Go to **API Keys** → create a new key
3. Copy the key (starts with `gsk_`)

### Step 4 — Use it

1. Open a **New Email** in Outlook (desktop or web)
2. Click the **AI Write** button in the toolbar
3. Paste your Groq API key when prompted → **Save Key** (one-time only)
4. Describe what you want to say → **Write my email** → **Insert**

## How it works

- Your API key is stored locally in your browser — it never touches any external server other than Groq
- The add-in sends your prompt to a Vercel serverless function, which calls the Groq API and returns the generated email
- AI model used: `llama-3.3-70b-versatile` via Groq (fast and free)

## Project Structure

```
├── manifest.xml          — Outlook add-in manifest
├── taskpane/
│   ├── taskpane.html     — Full UI and logic
│   └── commands.html     — Required by Outlook
├── api/
│   └── generate.js       — Vercel serverless proxy to Groq API
└── assets/
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-80.png
    └── icon-128.png
```

## Self-hosting

If you want to deploy your own instance:

1. Fork this repo
2. Deploy to [Vercel](https://vercel.com) (free) — connect your fork and deploy
3. Update the URLs in `manifest.xml` to point to your Vercel deployment
4. Sideload your updated `manifest.xml`

## License

MIT — free to use, modify, and share.
