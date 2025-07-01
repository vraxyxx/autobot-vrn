const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const ENABLED_FILE = path.join(__dirname, "../data/simsimi-enabled.json");
const MODE_FILE = path.join(__dirname, "../data/simsimi-mode.json");

let enabledThreads = [];
let modeData = {};

fs.ensureDirSync(path.dirname(ENABLED_FILE));
fs.ensureFileSync(MODE_FILE);

if (fs.existsSync(ENABLED_FILE)) {
  try { enabledThreads = fs.readJSONSync(ENABLED_FILE); } catch { enabledThreads = []; }
}

try { modeData = fs.readJSONSync(MODE_FILE); } catch { modeData = {}; }

async function fetchReply(text, mode = "normal") {
  const apiKey = "3f722ddc86104152a7f6c9aa951e6136b94cf0fd";
  try {
    const res = await axios.get("https://simsimi.ooguy.com/sim", {
      params: {
        query: text,
        apikey: apiKey,
        mode: mode === "angry" ? "rude" : "default"
      }
    });
    if (res.data?.message) return res.data.message;
    if (res.data?.error) return `⚠️ Simsimi says: ${res.data.error}`;
    return "🤖 I didn't get that.";
  } catch (err) {
    console.error("❌ Simsimi error:", err.response?.data || err.message);
    return "🚫 Simsimi failed to reply.";
  }
}

module.exports.config = {
  name: "sim1",
  version: "1.1",
  role: 0,
  credits: "Vern",
  description: "Chat with Simsimi AI (manual + auto + rude mode)",
  usage: "sim1 [on|off|angry|normal|text]",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  if (!args.length) return send("ℹ️ Use: sim1 on | off | angry | normal | [text]");

  const cmd = args[0].toLowerCase();

  if (cmd === "on") {
    if (enabledThreads.includes(threadID)) return send("✅ Already enabled.");
    enabledThreads.push(threadID);
    fs.writeJSONSync(ENABLED_FILE, enabledThreads, { spaces: 2 });
    return send("🟢 Simsimi auto-reply enabled!");
  }

  if (cmd === "off") {
    if (!enabledThreads.includes(threadID)) return send("✅ Already disabled.");
    enabledThreads = enabledThreads.filter(id => id !== threadID);
    fs.writeJSONSync(ENABLED_FILE, enabledThreads, { spaces: 2 });
    return send("🔴 Simsimi auto-reply disabled.");
  }

  if (cmd === "angry") {
    modeData[threadID] = "angry";
    fs.writeJSONSync(MODE_FILE, modeData, { spaces: 2 });
    return send("😡 Angry mode activated! Simsimi will now be rude.");
  }

  if (cmd === "normal") {
    modeData[threadID] = "normal";
    fs.writeJSONSync(MODE_FILE, modeData, { spaces: 2 });
    return send("🙂 Back to normal mode.");
  }

  const query = args.join(" ");
  const mode = modeData[threadID] || "normal";
  const reply = await fetchReply(query, mode);
  return send(reply);
};
