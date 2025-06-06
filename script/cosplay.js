const axios = require("axios");

module.exports = {
  config: {
    name: "cosplay",
    version: "1.0.0",
    author: "vernex",
    description: "Send a stream of random cosplay images.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      // Inform the user that loading has started
      await api.sendMessage("⏳ Fetching cosplay images for you...", threadID, messageID);

      // Request 10 cosplay image URLs
      const res = await axios.get(`https://haji-mix.up.railway.app/api/cosplay?limit=10&page=1&stream=true`);
      const { result } = res.data;

      if (!result || result.length === 0) {
        return api.sendMessage("❌ No cosplay images found.", threadID, messageID);
      }

      // Send the images one by one
      for (const url of result) {
        await api.sendMessage(
          {
            body: "✨ Cosplay Image:",
            attachment: await global.utils.getStream(url)
          },
          threadID
        );
      }
    } catch (error) {
      console.error("❌ Error fetching cosplay images:", error.message);
      return api.sendMessage(`❌ Failed to fetch cosplay images.\nError: ${error.message}`, threadID, messageID);
    }
  }
};
