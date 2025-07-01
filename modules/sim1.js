const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const ENABLED_FILE = path.join(__dirname, "../data/simsimi-enabled.json");
const MODE_FILE = path.join(__dirname, "../data/simsimi-mode.json");
let enabledThreads = [], modeData = {};

fs.ensureDirSync(path.dirname(ENABLED_FILE));
fs.ensureFileSync(MODE_FILE);

if (fs.existsSync(ENABLED_FILE)) {
  try { enabledThreads = fs.readJSONSync(ENABLED_FILE); } catch {}
}
try { modeData = fs.readJSONSync(MODE_FILE); } catch {}

async function fetchReply(text, mode = "normal") {
  const apiKey = "3f722ddc86104152a7f6c9aa951e6136b94cf0fd";
  try {
    const res = await axios.get("https://simsimi.ooguy.com/sim", {
      params: { query: text, apikey: apiKey }
    });
    let message = res.data?.message || "🤖 I didn't get that.";
    if (mode === "angry") {
      message = "💢 " + message
        .replace(/you/gi, "you dumb")
        .replace(/why/gi, "why the hell")
        .replace(/what/gi, "what the hell")
        .replace(/\.$/, " 🤬.")
        .replace(/^/g, "😤 ");
    }
    return message;
  } catch {
    return "🚫 Simsimi error.";
  }
}

module.exports.config = {
  name: "sim1",
  version: "1.2",
  role: 0,
  credits: "Vern",
  description: "Chat with Simsimi (manual + auto + angry mode)",
  usage: "sim1 [on|off|angry|normal|text]",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  if (!args.length) return send("ℹ️ Use: sim1 on | off | angry | normal | [text]");

  const cmd = args[0].toLowerCase();
  if (cmd === "on") {
    if (!enabledThreads.includes(threadID)) {
      enabledThreads.push(threadID);
      fs.writeJSONSync(ENABLED_FILE, enabledThreads, { spaces: 2 });
    }
    return send("🟢 Auto‑reply enabled!");
  }
  if (cmd === "off") {
    enabledThreads = enabledThreads.filter(id => id !== threadID);
    fs.writeJSONSync(ENABLED_FILE, enabledThreads, { spaces: 2 });
    return send("🔴 Auto‑reply disabled.");
  }
  if (cmd === "angry") {
    modeData[threadID] = "angry";
    fs.writeJSONSync(MODE_FILE, modeData, { spaces: 2 });
    return send("😡 Angry mode ON.");
  }
  if (cmd === "normal") {
    modeData[threadID] = "normal";
    fs.writeJSONSync(MODE_FILE, modeData, { spaces: 2 });
    return send("🙂 Normal mode ON.");
  }

  const query = args.join(" ");
  const mode = modeData[threadID] || "normal";
  const reply = await fetchReply(query, mode);
  return send(reply);
};
