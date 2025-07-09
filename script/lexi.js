const axios = require("axios");

module.exports = {
  config: {
    name: "lexi",
    aliases: ["lexireply", "lexitalk"],
    version: "1.0",
    role: 0,
    author: "Vern",
    countDown: 3,
    longDescription: "Generate a Lexi-style caption based on your text input.",
    category: "text",
    guide: {
      en: "{pn} <text> | <type>\n\nExample:\n{pn} hello there | direct"
    }
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ").split("|").map(i => i.trim());

    const text = input[0];
    const type = input[1] || "direct";

    if (!text) {
      return message.reply("⚠️ Please provide text for the Lexi caption.\n\nUsage:\n/lexi <text> | <type>\nTypes: direct, savage, cute, etc.");
    }

    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/lexi?text=${encodeURIComponent(text)}&type=${encodeURIComponent(type)}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data.error) {
        return message.reply(`❌ API Error: ${data.error}`);
      }

      return message.reply(`🗣️ Lexi says: ${data.result || "No response"}`);

    } catch (err) {
      console.error(err.message);
      return message.reply("❌ Failed to generate Lexi caption. Please try again later.");
    }
  }
};