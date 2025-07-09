const axios = require("axios");

module.exports = {
  config: {
    name: "brat",
    aliases: ["bratcaption", "brattalk"],
    version: "1.0",
    role: 0,
    author: "Jonell01",
    countDown: 3,
    longDescription: "Generate brat-style caption using input text.",
    category: "text",
    guide: {
      en: "{pn} <text> | <type>\n\nExample:\n{pn} you again? | direct"
    }
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ").split("|").map(i => i.trim());

    const text = input[0];
    const type = input[1] || "direct";

    if (!text) {
      return message.reply("⚠️ Please provide text for the brat caption.\n\nUsage:\n/brat <text> | <type>\nTypes: direct, sarcasm, savage, etc.");
    }

    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/brat?text=${encodeURIComponent(text)}&type=${encodeURIComponent(type)}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data.error) {
        return message.reply(`❌ API Error: ${data.error}`);
      }

      return message.reply(`💬 Brat says: ${data.result || "No response"}`);

    } catch (err) {
      console.error(err.message);
      return message.reply("❌ Failed to generate brat caption. Please try again later.");
    }
  }
};