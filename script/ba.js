const axios = require("axios");

module.exports = {
  config: {
    name: "ba",
    version: "1.0.0",
    aliases: ["baquote", "balinesay"],
    description: "Send a random Filipino 'BA' quote.",
    usage: "ba",
    commandCategory: "fun",
    role: 0,
    hasPrefix: true,
    credits: "Vern",
    cooldown: 3
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;
    try {
      const res = await axios.get("https://xvi-rest-api.vercel.app/api/ba");
      const quote = res.data?.result || "😶 No quote received.";

      return api.sendMessage(`🗣️ ${quote}`, threadID, messageID);

    } catch (error) {
      console.error("[ba.js] API Error:", error.response?.data || error.message);
      return api.sendMessage("❌ Couldn't fetch a quote at the moment. Please try again later.", threadID, messageID);
    }
  }
};
