# Nova — Chat Workspace

A self-contained chat interface built with plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.

Nova is designed as a focused writing and thinking workspace: a quiet layout, a keyboard-first composer, local reply logic, and an optional connection to an OpenAI-compatible endpoint.

Developer note: replies are produced by the keyword engine in `script.js` until an endpoint is configured. The interface presents Nova as a normal product rather than labelling it a demo; the full explanation lives here and in the code comments.

## Features

- Calm two-mode interface with light and dark themes
- Local reply engine covering greetings, planning, code, explanations and small talk
- Animated typing state and realistic response timing
- Optional OpenAI-compatible endpoint configuration
- Keyboard support: `Enter` sends, `Shift + Enter` adds a line
- Auto-growing message field
- Suggested prompts on the empty state
- New-conversation control
- Responsive layout down to small phones
- User messages rendered with `textContent`, so no HTML injection
- No storage of conversations or API keys beyond the current tab

## Run it

Open `index.html` in any modern browser.

Or serve it locally:

```bash
cd ai-chat-assistant
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Connect an endpoint (optional)

1. Open the sliders icon in the top bar.
2. Enter an OpenAI-compatible URL, for example `https://api.openai.com/v1/chat/completions`.
3. Add the key and model name.
4. Choose **Connect**.

Nova sends an OpenAI-style chat completion request with a short system prompt and the last ten messages. If the request fails — CORS, an invalid key, an unreachable host — the interface says so and falls back to local replies.

Keys live in memory only. For a production app, never ship a secret key in browser code; proxy requests through a server you control.

## Publishing

This folder is ready for GitHub. See `SETUP_GITHUB.md` for website upload, GitHub CLI, and plain Git workflows. The repository already includes an MIT `LICENSE`, a `.gitignore`, and a `setup-git.ps1` helper with the author details filled in.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App shell, top bar, messages, composer, connection dialog |
| `styles.css` | Design tokens, layout, responsive rules, motion |
| `script.js` | Message flow, reply engine, optional API integration |
| `SETUP_GITHUB.md` | Publishing walkthrough |
| `setup-git.ps1` | Initialises the repository and first commit |
| `LICENSE` | MIT licence |
