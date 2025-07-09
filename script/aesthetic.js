const axios = require("axios");

module.exports = {
  config: {
    name: "aesthetic",
    aliases: ["aestext"],
    version: "1.0",
    role: 0,
    author: "Vern",
    countDown: 3,
    longDescription: "Generate aesthetic text image with your custom input.",
    category: "text",
    guide: {
      en: "{pn} <text> | <author> | <color>\n\nExample:\n{pn} hello world | cc | white"
    }
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ").split("|").map(i => i.trim());

    const text = input[0];
    const author = input[1] || "anonymous";
    const color = input[2] || "white";

    if (!text) {
      return message.reply("⚠️ Please provide some text.\n\nUsage: /aesthetic <text> | <author> | <color>");
    }

    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/aesthetic?text=${encodeURIComponent(text)}&author=${encodeURIComponent(author)}&color=${encodeURIComponent(color)}`;

    try {
      const imageStream = await global.utils.getStreamFromURL(apiUrl);

      return message.reply({
        body: "✨ Aesthetic image generated:",
        attachment: imageStream
      });

    } catch (err) {
      console.error(err.message);
      return message.reply("❌ Failed to generate aesthetic image. Please check your input or try again later.");
    }
  }
};