const axios = require("axios");

module.exports = {
  config: {
    name: "picrandom",
    version: "1.0.0",
    author: "You",
    description: "Fetches a random image from the API and sends it.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  onMessage: async function ({ api, event }) {
    // No auto trigger needed here, just the run command.
  },

  run: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      // Replace with your actual API URL if different
      const response = await axios.get("https://your-api-url.com/endpoint");
      const data = response.data;

      if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        return api.sendMessage(
          "❌ API returned no images.",
          threadID,
          messageID
        );
      }

      // Pick a random image URL from the array
      const randomImage = data.data[Math.floor(Math.random() * data.data.length)];

      // Send the image as an attachment with a message
      await api.sendMessage(
        {
          body: "🎉 Here's a random image for you!",
          attachment: await global.utils.getStream(randomImage) // autobot-vrn utility to fetch stream from URL
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error("Error in picrandom command:", error);
      api.sendMessage(
        `❌ Failed to fetch image.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};
