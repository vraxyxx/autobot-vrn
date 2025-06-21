const axios = require("axios");

module.exports = {
  config: {
    name: "spotify",
    version: "1.0.0",
    author: "vernex",
    description: "Search and play Spotify music via Hiroshi API",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
      return api.sendMessage(
        "🎵 Usage:\n/spotify [song name]\n\nExample:\n/spotify Someone You Loved",
        threadID,
        messageID
      );
    }

    const query = args.join(" ");
    const apiUrl = `https://hiroshi-api.onrender.com/tiktok/spotify?search=${encodeURIComponent(query)}`;

    try {
      await api.sendMessage(`🔍 Searching Spotify for: "${query}"...`, threadID, messageID);

      const { data } = await axios.get(apiUrl);
      const result = data?.[0];

      if (!result) {
        return api.sendMessage("❌ No results found.", threadID, messageID);
      }

      const message = `
🎶 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗥𝗘𝗦𝗨𝗟𝗧𝗦 🎶
━━━━━━━━━━━━━━━
🎧 Title: ${result.name}
🔗 Link: ${result.track}
━━━━━━━━━━━━━━━`.trim();

      await api.sendMessage(message, threadID, messageID);

      if (result.image) {
        await api.sendMessage({ attachment: await global.getStreamFromURL(result.image) }, threadID, messageID);
      }

      if (result.download) {
        await api.sendMessage({ attachment: await global.getStreamFromURL(result.download) }, threadID, messageID);
      }

    } catch (err) {
      console.error("❌ Spotify command error:", err.message);
      return api.sendMessage(`❌ Failed to fetch data.\nReason: ${err.message}`, threadID, messageID);
    }
  }
};
