const axios = require("axios");

module.exports = {
  config: {
    name: "pinterest",
    version: "1.0.0",
    author: "You",
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
      const data = response.data;

      if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        return api.sendMessage(
          `❌ No images found for "${args.join(" ")}".`,
          threadID,
          messageID
        );
      }

      // Pick a random image from results
      const randomImage = data.data[Math.floor(Math.random() * data.data.length)];

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
      api.sendMessage(
        `❌ Failed to fetch Pinterest images.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};
