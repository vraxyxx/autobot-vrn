const axios = require("axios");

module.exports = {
  config: {
    name: "picrandom",
    version: "1.0.1",
    author: "You",
    description: "Fetches a random image from the API and sends it.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      // Replace this with your actual API that returns an array of image URLs
      const response = await axios.get("https://your-api-url.com/endpoint");
      const data = response.data;

      // Try to handle multiple response formats
      let images = [];
      if (Array.isArray(data)) {
        images = data;
      } else if (Array.isArray(data.data)) {
        images = data.data;
      } else if (Array.isArray(data.images)) {
        images = data.images;
      }

      if (!images.length) {
        return api.sendMessage(
          "❌ API returned no images.",
          threadID,
          messageID
        );
      }

      // Select a random image from the array
      const randomImage = images[Math.floor(Math.random() * images.length)];

      if (!randomImage || typeof randomImage !== "string") {
        return api.sendMessage(
          "❌ Invalid image URL received from the API.",
          threadID,
          messageID
        );
      }

      // Check if global.utils.getStream exists
      if (!global.utils || typeof global.utils.getStream !== "function") {
        return api.sendMessage(
          "❌ Image streaming utility not found. Please make sure 'global.utils.getStream' is available.",
          threadID,
          messageID
        );
      }

      // Send the image as an attachment with a message
      let attachment;
      try {
        attachment = await global.utils.getStream(randomImage);
      } catch (imgErr) {
        return api.sendMessage(
          `❌ Unable to fetch the image from the provided URL.\nError: ${imgErr.message}`,
          threadID,
          messageID
        );
      }

      await api.sendMessage(
        {
          body: "🎉 Here's a random image for you!",
          attachment
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