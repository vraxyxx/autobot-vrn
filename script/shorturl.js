const axios = require("axios");

module.exports = {
  config: {
    name: "shorturl",
    aliases: ["shorten", "tinyurl"],
    version: "1.0",
    role: 0,
    author: "Vern",
    countDown: 3,
    longDescription: "Shorten a long URL using an API.",
    category: "tools",
    guide: {
      en: "{pn} <long_url>"
    }
  },

  onStart: async function ({ message, args }) {
    const longUrl = args[0];

    if (!longUrl || !longUrl.startsWith("http")) {
      return message.reply("🔗 Please provide a valid URL.\n\nExample:\n/shorturl https://example.com");
    }

    try {
      const api = `https://jonell01-ccprojectsapihshs.hf.space/api/shorturl?url=${encodeURIComponent(longUrl)}`;
      const { data } = await axios.get(api);

      if (data.error) {
        return message.reply(`❌ Error: ${data.error}`);
      }

      message.reply(`✅ URL shortened:\n🔗 Original: ${data.originalUrl}\n✂️ Short: ${data.shortenedUrl}`);

    } catch (err) {
      console.error(err.message);
      message.reply("❌ Failed to shorten the URL.");
    }
  }
};