const axios = require("axios");

module.exports = {
  config: {
    name: "tiktok",
    version: "1.0.0",
    author: "vernex",
    description: "Search and stream TikTok videos by keyword",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
      return api.sendMessage(
        "📤 Usage:\n/tiktok [search keywords]\n\nExample:\n/tiktok capcut anime edits",
        threadID,
        messageID
      );
    }

    const query = encodeURIComponent(args.join(" "));
    const apiUrl = `https://haji-mix.up.railway.app/api/tiktok?search=${query}&limit=10&page=1&stream=true`;

    try {
      api.sendMessage(`🔍 Searching TikTok for: ${args.join(" ")}\nPlease wait...`, threadID, messageID);

      const res = await axios.get(apiUrl);
      const { result } = res.data;

      if (!result || result.length === 0) {
        return api.sendMessage("❌ No results found.", threadID, messageID);
      }

      let msg = `🎵 TikTok Results for "${args.join(" ")}"\n\n`;

      result.forEach((item, index) => {
        msg += `${index + 1}. ${item.title || "No Title"}\n🔗 ${item.url}\n\n`;
      });

      return api.sendMessage(msg.trim(), threadID, messageID);
    } catch (err) {
      console.error("❌ Error in /tiktok:", err.message);
      return api.sendMessage("❌ An error occurred while fetching TikTok results.", threadID, messageID);
    }
  }
};
