const axios = require("axios");

module.exports = {
  config: {
    name: "sim1",
    version: "1.0.0",
    aliases: ["simsimi"],
    description: "Chat with Simsimi AI (via ooguy.com API)",
    commandCategory: "chat",
    role: 0,
    hasPrefix: false,
    credits: "Vern",
    usage: "sim1 [text] | sim1 on/off",
    cooldown: 5,
  },

  // Active threads with Simsimi enabled
  simsimiThreads: new Set(),

  // Handle events for auto-reply
  handleEvent: async function ({ api, event }) {
    const { threadID, senderID, body, messageID } = event;

    if (!body || senderID === api.getCurrentUserID()) return;
    if (!this.simsimiThreads.has(threadID)) return;

    const reply = await this.fetchReply(body);
    if (reply.error) return;

    const message = reply.data.success || reply.data.error || "🤖 I didn’t understand that.";
    return api.sendMessage(message, threadID, messageID);
  },

  // Fetch reply from Simsimi API
  fetchReply: async function (text) {
    const apiKey = "UbPsGRJsUjZaX24-lutlbORQSo5xMjY0Rk-tEmOO";
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return { error: false, data: { success: "🤖 Simsimi needs something to respond to!" } };
    }

    try {
      const apiUrl = `https://api.simsimi.vn/v1/simtalk/sim?query=${encodeURIComponent(text)}&apikey=${apiKey}`;
      const res = await axios.get(apiUrl);

      if (res.data?.message) {
        return { error: false, data: { success: res.data.message } };
      } else if (res.data?.error) {
        return { error: false, data: { error: res.data.error } };
      } else {
        return { error: false, data: { error: "🤖 Simsimi didn’t understand that." } };
      }
    } catch (err) {
      console.error("[Simsimi API Error]:", err.response?.data || err.message);
      return { error: true, data: null };
    }
  },

  // Main command logic
  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const send = msg => api.sendMessage(msg, threadID, messageID);

    if (!args.length) {
      return send("ℹ️ Usage:\n• sim1 on — enable auto-reply\n• sim1 off — disable\n• sim1 [message] — talk to Simsimi");
    }

    const command = args[0].toLowerCase();

    if (command === "on") {
      if (this.simsimiThreads.has(threadID)) return send("✅ Simsimi is already enabled.");
      this.simsimiThreads.add(threadID);
      return send("🤖 Simsimi has been enabled. I will now respond automatically.");
    }

    if (command === "off") {
      if (!this.simsimiThreads.has(threadID)) return send("ℹ️ Simsimi is already disabled.");
      this.simsimiThreads.delete(threadID);
      return send("❎ Simsimi has been disabled in this thread.");
    }

    const query = args.join(" ");
    const reply = await this.fetchReply(query);
    if (reply.error) return send("🚫 Unable to reach Simsimi API. Please try again later.");

    const message = reply.data.success || reply.data.error || "🤖 Simsimi didn’t understand that.";
    return send(message);
  }
};
