const axios = require("axios");

module.exports = {
  config: {
    name: "pinterest",
    version: "1.0.1",
    author: "vern",
    description: "Search Pinterest images by query and send a random result.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage(
        "❗ Please provide a search query.\n\nUsage: /pinterest [search terms]",
        threadID,
        messageID
      );
    }

    const query = encodeURIComponent(args.join(" "));

    try {
      const response = await axios.get(`https://api.ferdev.my.id/search/pinterest?query=${query}`);

      // Basic validation of API response structure
      if (!response.data || !Array.isArray(response.data.data)) {
        return api.sendMessage(
          "❌ Unexpected API response format.",
          threadID,
          messageID
        );
      }

      const images = response.data.data;

      if (images.length === 0) {
        return api.sendMessage(
          `❌ No images found for "${args.join(" ")}".`,
          threadID,
          messageID
        );
      }

      // Select a random image URL
      const randomImage = images[Math.floor(Math.random() * images.length)];

      // Check if global.utils.getStream is available
      if (typeof global.utils?.getStream !== "function") {
        return api.sendMessage(
          "❌ Image streaming utility not available.",
          threadID,
          messageID
        );
      }

      // Send message with image attachment stream
      await api.sendMessage(
        {
          body: `🎉 Pinterest result for: ${args.join(" ")}`,
          attachment: await global.utils.getStream(randomImage)
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error("Error in pinterest command:", error);
      return api.sendMessage(
        `❌ Failed to fetch Pinterest images.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};
