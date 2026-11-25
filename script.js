/* ===== Nova — app logic ===== */
/* NOTE: Replies are simulated locally by the keyword engine below unless an API
   endpoint is configured in Connection settings. No external service is contacted
   by default. This behaviour is documented here and in the README, not surfaced
   as a "demo" label in the interface. */

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
const modeBadge = document.getElementById("modeBadge");
const footerMode = document.getElementById("footerMode");

let chatHistory = [];
let apiConfig = null; // { endpoint, key, model }
let busy = false;

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const scrollToBottom = () => { messagesEl.scrollTop = messagesEl.scrollHeight; };

/* ---------- Message rendering ---------- */
function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}-message`;

  const content = document.createElement("div");
  content.className = "message-content";

  const meta = document.createElement("span");
  meta.className = "message-meta";
  meta.textContent = `${role === "bot" ? "Nova" : "You"} · ${now()}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (role === "bot") {
    // Bot copy is authored here, so limited formatting is safe.
    bubble.innerHTML = text.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  } else {
    // User text is inserted as plain text — never as HTML.
    bubble.textContent = text;
  }

  content.append(meta, bubble);
  wrapper.appendChild(content);
  messagesEl.appendChild(wrapper);
  scrollToBottom();
}

function setTyping(on) {
  typingEl.hidden = !on;
  sendBtn.disabled = on;
  if (on) scrollToBottom();
}

/* ---------- Local reply engine ---------- */
const rules = [
  {
    test: /^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/i,
    replies: [
      "Hello. What are we working on?",
      "Hi — give me the shape of the problem and we'll start there.",
      "Hey. Want to plan something, write something, or think something through?"
    ]
  },
  {
    test: /how are you|how're you|how do you do/i,
    replies: [
      "Running well. What are you working on?",
      "Good — ready when you are. What's the task?"
    ]
  },
  {
    test: /who are you|your name|what are you/i,
    replies: [
      "I'm Nova, a chat workspace built for focused work. I can help you plan, draft, explain, and pressure-test ideas.",
      "Nova. Part thinking partner, part drafting desk. What do you need?"
    ]
  },
  {
    test: /ayomide|my name/i,
    replies: [
      "Ayomide — noted. Tell me what you're building and I'll keep the advice specific.",
      "Good to know. What's the project?"
    ]
  },
  {
    test: /what can you do|your capabilities|^\s*help\s*$/i,
    replies: [
      "I can help you:\n• turn a rough idea into a plan\n• draft short copy or a brief\n• explain a technical concept\n• review an approach and spot gaps\n• work through code or a bug\n\nWhere do you want to start?",
      "Mostly thinking and drafting. Bring me a project, a paragraph, or a problem. I'll ask for what's missing and help you move forward."
    ]
  },
  {
    test: /joke|funny|make me laugh/i,
    replies: [
      "Why do programmers prefer dark mode?\nBecause light attracts bugs.",
      "I told my computer I needed a break. It said it would go to sleep.\n\nI'll be here.",
      "There are two kinds of people: those who understand binary and those who don't."
    ]
  },
  {
    test: /what time|what's the time|current time|what date/i,
    replies: [() => `It's ${new Date().toLocaleString()} on this device.`]
  },
  {
    test: /thank|thanks|appreciate/i,
    replies: ["You're welcome. What's next?", "Anytime. Keep going if you want to refine it.", "Happy to help."]
  },
  {
    test: /bye|goodbye|see you|cya/i,
    replies: ["Take care. The conversation stays here while the tab is open.", "See you. Start a new session whenever you're ready."]
  },
  {
    test: /code|program|javascript|python|html|css|react|developer|bug/i,
    replies: [
      "Start with the smallest working version, then change one thing at a time. If you paste the relevant block or describe the error, I can narrow it down with you.",
      "For front-end work: get the structure and states right before styling. Most 'layout bugs' are actually state bugs. What are you building?"
    ]
  },
  {
    test: /project|app|game|website|business|launch|portfolio|plan\b|idea/i,
    replies: [
      "A useful project plan has three parts: the outcome, the smallest version that proves it, and what you'll deliberately leave out. Tell me the idea and I'll help you write all three.",
      "Start with the user and the one action they need to complete. Everything else is secondary. What's the action?"
    ]
  },
  {
    test: /weather/i,
    replies: ["I don't have live weather access here. I can help you build a small client against a free weather API instead — that's a good first fetch project."]
  },
  {
    test: /\?$|who|what|why|how|when|where/i,
    replies: [
      "Give me a little more context and I'll give you a specific answer rather than a generic one.",
      "That depends on the constraints. What are you optimising for — speed, clarity, cost, or something else?"
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
  return `Let's unpack "${snippet}". What outcome are you after, and what have you tried so far?`;
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
        { role: "system", content: "You are Nova, a concise, practical assistant. Prefer specific next steps over general advice." },
        ...chatHistory.slice(-10)
      ]
    })
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "No response came back. Try sending that again.";
}

/* ---------- Send flow ---------- */
async function sendMessage(text) {
  const message = (text || input.value).trim();
  if (!message || busy) return;

  suggestions.hidden = true;
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
      reply = `I couldn't reach the configured endpoint. Check the connection settings and try again.\n\n${getMockReply(message)}`;
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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

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
  localStorage.setItem("nova-theme", next);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", next === "dark" ? "#0e100d" : "#e9e5da");
});

clearBtn.addEventListener("click", () => {
  messagesEl.innerHTML = "";
  chatHistory = [];
  busy = false;
  setTyping(false);
  suggestions.hidden = false;
  addMessage("bot", "New session. What are we working on?");
});

settingsBtn.addEventListener("click", () => {
  endpointInput.value = apiConfig?.endpoint || "";
  keyInput.value = apiConfig?.key || "";
  modelInput.value = apiConfig?.model || "gpt-3.5-turbo";
  settingsModal.hidden = false;
  endpointInput.focus();
});

closeModalBtn.addEventListener("click", () => { settingsModal.hidden = true; });
settingsModal.addEventListener("click", (event) => { if (event.target === settingsModal) settingsModal.hidden = true; });

saveApiBtn.addEventListener("click", () => {
  const endpoint = endpointInput.value.trim();
  const key = keyInput.value.trim();
  if (!endpoint || !key) {
    alert("Enter both an endpoint URL and an API key.");
    return;
  }
  apiConfig = { endpoint, key, model: modelInput.value.trim() || "gpt-3.5-turbo" };
  updateMode();
  settingsModal.hidden = true;
  addMessage("bot", "Connected. Messages will go to your endpoint from here on.");
});

clearApiBtn.addEventListener("click", () => {
  apiConfig = null;
  endpointInput.value = "";
  keyInput.value = "";
  updateMode();
  settingsModal.hidden = true;
  addMessage("bot", "Disconnected. Back to local replies.");
});

function updateMode() {
  const connected = Boolean(apiConfig);
  statusText.textContent = connected ? "Connected" : "Ready";
  if (modeBadge) modeBadge.textContent = connected ? "API connected" : "Local engine";
  if (footerMode) footerMode.textContent = connected ? "Endpoint connected" : "No external calls";
}

/* ---------- Init ---------- */
(function init() {
  const savedTheme = localStorage.getItem("nova-theme");
  if (savedTheme === "light") {
    document.documentElement.dataset.theme = "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#e9e5da");
  }
  updateMode();
  autoResize();
  scrollToBottom();
  input.focus();
})();
