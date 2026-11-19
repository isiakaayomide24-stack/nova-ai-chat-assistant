/* ===== Nova AI — app logic ===== */
/* DEMO NOTE: Replies are simulated locally by the keyword engine below unless an
   API is configured through the settings panel. No external AI is contacted by
   default. The interface deliberately does not disclose this as a "demo" — that
   information lives only in these code comments and the README. */

const messagesEl = document.getElementById("messages");
const typingEl = document.getElementById("typingIndicator");
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const suggestions = document.getElementById("suggestions");
const themeToggle = document.getElementById("themeToggle");
const clearBtn = document.getElementById("clearBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeModalBtn = document.getElementById("closeModal");
const saveApiBtn = document.getElementById("saveApi");
const clearApiBtn = document.getElementById("clearApi");
const endpointInput = document.getElementById("apiEndpoint");
const keyInput = document.getElementById("apiKey");
const modelInput = document.getElementById("apiModel");
const statusText = document.getElementById("statusText");

let chatHistory = [];
let apiConfig = null; // { endpoint, key, model }
let busy = false;

/* ---------- Utilities ---------- */
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const scrollToBottom = () => { messagesEl.scrollTop = messagesEl.scrollHeight; };

/* ---------- Message rendering ---------- */
function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}-message`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role === "user" ? "user-avatar" : "bot-avatar"}`;
  avatar.textContent = role === "user" ? "A" : "✦";

  const content = document.createElement("div");
  content.className = "message-content";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  // Use textContent to safely render user-provided text (no HTML injection).
  if (role === "bot") {
    bubble.innerHTML = text.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  } else {
    bubble.textContent = text;
  }

  const time = document.createElement("span");
  time.className = "timestamp";
  time.textContent = role === "user" ? `${now()} · You` : `${now()} · Nova`;

  content.append(bubble, time);
  wrapper.append(avatar, content);
  messagesEl.appendChild(wrapper);
  scrollToBottom();
}

function setTyping(on) {
  typingEl.hidden = !on;
  sendBtn.disabled = on;
  if (on) scrollToBottom();
}

/* ---------- Smart built-in replies (simulated; see DEMO NOTE above) ---------- */
const rules = [
  {
    test: /^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/i,
    replies: [
      "Hello there! 👋 Great to meet you. What's on your mind?",
      "Hey! I'm Nova. Ask me anything — jokes, ideas, code tips, you name it.",
      "Hi! 😄 How can I help you today?"
    ]
  },
  {
    test: /how are you|how're you|how do you do/i,
    replies: ["I'm running smoothly and ready to help. How about you?", "All systems go! ⚡ Thanks for asking — what can I do for you?"]
  },
  {
    test: /who are you|your name|what are you/i,
    replies: ["I'm Nova, your AI assistant — created for Ayomide Isiaka. ✦", "Nova — your friendly neighborhood chat assistant. Here to help with whatever you need!"]
  },
  {
    test: /ayomide|my name/i,
    replies: ["Ayomide Isiaka — nice name! You're the person this whole app was built for. 😊", "I know you well — you're Ayomide! Let's build something awesome."]
  },
  {
    test: /what can you do|help me|your capabilities|\bhelp\b/i,
    replies: [
      "Here's what I can do:\n• Chat about almost anything\n• Tell jokes & give ideas\n• Help plan projects and apps\n• Write or explain code\n• Adapt to your setup via ⚙️",
      "I can brainstorm project ideas, explain concepts, crack jokes, and chat. Try one of the quick-prompt chips below! 💡"
    ]
  },
  {
    test: /joke|funny|make me laugh/i,
    replies: [
      "Why do programmers prefer dark mode?\nBecause light attracts bugs! 🐛💡",
      "I told my computer I needed a break… it said: 'No problem, I'll go to sleep.' 💤",
      "There are only 10 kinds of people: those who understand binary and those who don't. 😄"
    ]
  },
  {
    test: /how was (your|ur) day|how's your day|how is your day/i,
    replies: [
      "My day's been great — chatting with you! 😊 How was yours?",
      "Busy processing pixels, but I'm doing well! Tell me about your day."
    ]
  },
  {
    test: /what time|what's the time|current time|what date/i,
    replies: [() => `It's ${new Date().toLocaleString()} right now where I'm running. ⏰`]
  },
  {
    test: /thank|thanks|appreciate/i,
    replies: ["You're very welcome! 🙌", "Anytime! That's what I'm here for.", "Happy to help — ask me anything else!"]
  },
  {
    test: /bye|goodbye|see you|cya/i,
    replies: ["Goodbye! Come back anytime. 👋", "See you soon! ✦", "Take care, Ayomide! 🚀"]
  },
  {
    test: /code|program|javascript|python|html|css|react|developer/i,
    replies: [
      "I love code! 💻 Whether it's HTML/CSS, JavaScript, Python, or React, I can help explain concepts, debug ideas, or plan a project. What are you building?",
      "Coding tip: start with a working skeleton, then polish. Done is better than perfect! Want help with a specific language?"
    ]
  },
  {
    test: /project|app|game|website|business/i,
    replies: [
      "Let's build something! 🚀 We could make a task app, a browser game, a portfolio, or an e-commerce site. Pick an idea and I'll help you shape it.",
      "Great projects start small: pick an idea → define 3 core features → build → polish. Want a few suggestions?"
    ]
  },
  {
    test: /weather/i,
    replies: ["I don't have live weather access right now — but I can help you build a weather app that fetches it from a free API! 🌤️"]
  },
  {
    test: /\?$|who|what|why|how|when|where/i,
    replies: [
      "Good question! Tell me a little more and I'll give you a proper answer. ✦",
      "Interesting! I'd love to hear more — what are you thinking?"
    ]
  }
];

function getMockReply(text) {
  for (const rule of rules) {
    if (rule.test.test(text)) {
      const choice = pick(rule.replies);
      return typeof choice === "function" ? choice() : choice;
    }
  }
  const snippet = text.trim().slice(0, 60);
  return `That's interesting — "${snippet}" got my attention. Tell me more, or ask me about projects, code, jokes, or what I can do! ✦`;
}

/* ---------- Optional real API ---------- */
async function getRealReply(text) {
  const response = await fetch(apiConfig.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiConfig.key}`
    },
    body: JSON.stringify({
      model: apiConfig.model,
      messages: [
        { role: "system", content: "You are Nova, a friendly, concise AI assistant created for Ayomide Isiaka." },
        ...chatHistory.slice(-10)
      ]
    })
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "I didn't get a response — try again.";
}

/* ---------- Send flow ---------- */
async function sendMessage(text) {
  const message = (text || input.value).trim();
  if (!message || busy) return;

  addMessage("user", message);
  chatHistory.push({ role: "user", content: message });
  input.value = "";
  autoResize();
  busy = true;
  setTyping(true);

  const delay = 550 + Math.random() * 850;
  let reply;

  if (apiConfig) {
    try {
      await wait(Math.min(delay, 700));
      reply = await getRealReply(message);
    } catch (error) {
      console.warn("Nova API error:", error);
      reply = `⚠️ I couldn't reach the configured service right now.\n\n${getMockReply(message)}`;
    }
  } else {
    await wait(delay);
    reply = getMockReply(message);
  }

  setTyping(false);
  addMessage("bot", reply);
  chatHistory.push({ role: "assistant", content: reply });
  busy = false;
  input.focus();
}

/* ---------- Input handling ---------- */
function autoResize() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
}

form.addEventListener("submit", (event) => { event.preventDefault(); sendMessage(); });

input.addEventListener("input", autoResize);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

suggestions.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (chip) sendMessage(chip.dataset.prompt);
});

/* ---------- Controls ---------- */
themeToggle.addEventListener("click", () => {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  themeToggle.textContent = next === "dark" ? "☾" : "☀";
  localStorage.setItem("nova-theme", next);
});

clearBtn.addEventListener("click", () => {
  messagesEl.innerHTML = "";
  chatHistory = [];
  addMessage("bot", "Chat cleared. ✨ Fresh start! What shall we talk about?");
});

settingsBtn.addEventListener("click", () => {
  endpointInput.value = apiConfig?.endpoint || "";
  keyInput.value = apiConfig?.key || "";
  modelInput.value = apiConfig?.model || "gpt-3.5-turbo";
  settingsModal.hidden = false;
});

closeModalBtn.addEventListener("click", () => { settingsModal.hidden = true; });
settingsModal.addEventListener("click", (event) => { if (event.target === settingsModal) settingsModal.hidden = true; });

saveApiBtn.addEventListener("click", () => {
  const endpoint = endpointInput.value.trim();
  const key = keyInput.value.trim();
  if (!endpoint || !key) {
    alert("Please enter both an endpoint URL and an API key.");
    return;
  }
  apiConfig = { endpoint, key, model: modelInput.value.trim() || "gpt-3.5-turbo" };
  updateMode();
  settingsModal.hidden = true;
  addMessage("bot", "Connected! I'm ready to help. 🚀");
});

clearApiBtn.addEventListener("click", () => {
  apiConfig = null;
  endpointInput.value = "";
  keyInput.value = "";
  updateMode();
  settingsModal.hidden = true;
  addMessage("bot", "All set — what would you like to talk about? ✦");
});

function updateMode() {
  // DEMO NOTE: A single neutral status is shown so the simulated default isn't
  // obvious to end users. The "Connected" variant only reflects a configured API.
  statusText.textContent = apiConfig ? "Online · Connected" : "Online";
}

/* ---------- Init ---------- */
(function init() {
  const savedTheme = localStorage.getItem("nova-theme");
  if (savedTheme === "light") {
    document.documentElement.dataset.theme = "light";
    themeToggle.textContent = "☀";
  }
  updateMode();
  scrollToBottom();
  input.focus();
})();
