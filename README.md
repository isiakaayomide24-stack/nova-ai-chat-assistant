# Nova AI — Chat Assistant UI

A polished, self-contained chat interface built with plain HTML, CSS, and JavaScript. No build tools or dependencies required.

Built for **Ayomide Isiaka**. ✦

Developer note: replies are simulated locally by a keyword engine until an API is configured. The interface intentionally presents the assistant as a normal product and does not expose that status to end users; full details are in the comments at the top of `script.js`.

## Features
- 🤖 Chat bubbles for user and bot with avatars and timestamps
- ⏳ Animated typing indicator with realistic response delay
- 🧠 Keyword-based "smart" built-in replies (greetings, jokes, code, projects, time, and more)
- 🔌 Optional OpenAI-compatible API connection via the ⚙️ button
- 🌗 Dark/light theme toggle (saved in localStorage)
- 🧹 Clear-chat control and quick-prompt suggestion chips
- ⌨️ Enter to send, Shift+Enter for a new line, auto-growing input
- 📱 Responsive — works on desktop and mobile
- 🔒 Safe rendering: user messages use `textContent`, so no HTML injection

## Run it
Simply open `index.html` in any modern browser.

Or serve locally with Python:
```bash
cd ai-chat-assistant
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Connect a real API (optional)
1. Click the ⚙️ button in the header.
2. Enter an endpoint (e.g. `https://api.openai.com/v1/chat/completions`).
3. Enter your API key and model name.
4. Click **Save & connect**.

The app sends an OpenAI-style `/chat/completions` request with a short system prompt and the last 10 messages as context. If the request fails (for example, due to browser CORS restrictions or an invalid key), the app shows a neutral warning and continues with its built-in replies.

> ⚠️ For production apps, never expose secret API keys in browser code — use a backend proxy instead. This panel is intended for local development only.

## Put it on GitHub
This folder is GitHub-ready. See [SETUP_GITHUB.md](SETUP_GITHUB.md) for three ways to publish it:
- Drag-and-drop upload via the GitHub website (no Git needed)
- GitHub CLI (`gh repo create ... --push`)
- Plain Git (`setup-git.ps1` → `git push`)

It also includes a `.gitignore` and an MIT `LICENSE` under Ayomide Isiaka's name.

## Files
- `index.html` — page structure
- `styles.css` — theme, layout, and animations
- `script.js` — chat logic, reply engine, and API integration
- `.gitignore` — keeps OS/secret files out of the repo
- `LICENSE` — MIT license
- `setup-git.ps1` — initializes the repo and makes the first commit
- `SETUP_GITHUB.md` — step-by-step publishing guide

## Customize
- Edit `rules` in `script.js` to add or change built-in replies.
- Change the bot name/avatar in `index.html`.
- Adjust colors via the CSS variables at the top of `styles.css`.
