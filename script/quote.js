const axios = require("axios");

module.exports = {
  config: {
    name: "quote",
    version: "1.0.0",
    aliases: ["inspire", "motivate"],
    description: "Get a random inspirational quote.",
    usage: "quote",
    commandCategory: "fun",
    role: 0,
    hasPrefix: true,
    credits: "Vern",
    cooldown: 3
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      const res = await axios.get("https://rapido.zetsu.xyz/api/quote");
      const { quote, author } = res.data;

      const message = `💬 𝗤𝗨𝗢𝗧𝗘 𝗢𝗙 𝗧𝗛𝗘 𝗗𝗔𝗬\n\n"${quote}"\n\n— ${author}`;
      return api.sendMessage(message, threadID, messageID);

    } catch (err) {
      console.error("[quote.js] API Error:", err.message || err);
      return api.sendMessage("❌ Couldn't fetch a quote at the moment. Please try again later.", threadID, messageID);
    }
  }
};
