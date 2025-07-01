const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ENABLED_FILE = path.join(__dirname, "simsimi-enabled.json");
let enabledThreads = [];

if (fs.existsSync(ENABLED_FILE)) {
  enabledThreads = fs.readJSONSync(ENABLED_FILE);
}

async function saveEnabledThreads() {
  await fs.writeJSON(ENABLED_FILE, enabledThreads, { spaces: 2 });
}

async function fetchSimsimiReply(text) {
  const apiKey = "UbPsGRJsUjZaX24-lutlbORQSo5xMjY0Rk-tEmOO";
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return { error: false, data: { success: "🤖 Simsimi needs something to respond to!" } };
  }
  try {
    const url = `https://api.simsimi.vn/v1/simtalk/sim?query=${encodeURIComponent(text)}&apikey=${apiKey}`;
    const res = await axios.get(url);
    if (res.data?.message) return { error: false, data: { success: res.data.message } };
    if (res.data?.error) return { error: false, data: { error: res.data.error } };
    return { error: false, data: { error: "🤖 Simsimi didn’t understand that." } };
  } catch (err) {
    console.error("[Simsimi API Error]:", err.response?.data || err.message);
    return { error: true, data: null };
  }
}

module.exports = {
  config: {
    name: "sim1",
    version: "1.0.0",
    aliases: ["simsimi"],
    description: "Chat with Simsimi AI",
    commandCategory: "chat",
    role: 0,
    hasPrefix: false,
    credits: "Vern",
    usage: "sim1 [text] | sim1 on/off",
    cooldown: 5,
  },

  handleEvent: async function ({ api, event }) {
    const { threadID, senderID, body, messageID } = event;
    if (!body || senderID === api.getCurrentUserID()) return;
    if (!enabledThreads.includes(threadID)) return;

    const reply = await fetchSimsimiReply(body);
    if (reply.error) return;
    const message = reply.data.success || reply.data.error || "🤖 Simsimi didn’t understand that.";
    return api.sendMessage(message, threadID, messageID);
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send("ℹ️ Usage:\n• sim1 on — enable auto-reply\n• sim1 off — disable\n• sim1 [message] — talk to Simsimi");
    }

    const command = args[0].toLowerCase();

    if (command === "on") {
      if (enabledThreads.includes(threadID)) return send("✅ Simsimi is already enabled.");
      enabledThreads.push(threadID);
      await saveEnabledThreads();
      return send("🤖 Simsimi has been enabled. I will now respond automatically.");
    }

    if (command === "off") {
      if (!enabledThreads.includes(threadID)) return send("ℹ️ Simsimi is already disabled.");
      enabledThreads = enabledThreads.filter(id => id !== threadID);
      await saveEnabledThreads();
      return send("❎ Simsimi has been disabled in this thread.");
    }

    const query = args.join(" ");
    const reply = await fetchSimsimiReply(query);
    if (reply.error) return send("🚫 Unable to reach Simsimi API. Please try again later.");

    const message = reply.data.success || reply.data.error || "🤖 Simsimi didn’t understand that.";
    return send(message);
  }
};
