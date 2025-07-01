const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ENABLED_FILE = path.join(__dirname, "../data/simsimi-enabled.json");
let enabledThreads = [];

// Load enabled threads if file exists
if (fs.existsSync(ENABLED_FILE)) {
  enabledThreads = fs.readJSONSync(ENABLED_FILE);
}

// 🧠 Fetch reply from Simsimi API
async function fetchReply(text) {
  const apiKey = "2a5a2264d2ee4f0b847cb8bd809ed34bc3309be7";
  if (!text.trim()) return "🤖 You didn't send anything!";
  try {
    const res = await axios.get("https://simsimi.ooguy.com/sim", {
      params: { query: text, apikey: apiKey }
    });

    if (res.data?.message) return res.data.message;
    if (res.data?.error) return `⚠️ Simsimi says: ${res.data.error}`;
    return "🤖 I didn't get that.";
  } catch (err) {
    console.error("Simsimi API error:", err.response?.data || err.message);
    return "🚫 Couldn't connect to Simsimi.";
  }
}

module.exports.config = {
  name: "sim1",
  version: "1.0.0",
  description: "Chat with Simsimi AI (auto-reply & manual)",
  usage: "sim1 [on|off|text]",
  credits: "Vern",
  cooldown: 5,
  role: 0,
  hasPrefix: true,
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, senderID, body } = event;
  if (!enabledThreads.includes(threadID)) return;
  if (!body || senderID === api.getCurrentUserID()) return;

  const reply = await fetchReply(body);
  return api.sendMessage(reply, threadID);
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  if (!args.length) {
    return send("ℹ️ Use `sim1 on`, `sim1 off`, or `sim1 [text]`");
  }
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

  // Manual reply
  const query = args.join(" ");
  const answer = await fetchReply(query);
  return send(answer);
};
