const axios = require("axios");

module.exports = {
  config: {
    name: "removebg",
    version: "1.0.1",
    author: "vern",
    description: "Remove background from an image URL.",
    prefix: true,
    cooldowns: 5,
    commandCategory: "image",
    dependencies: {
      axios: ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage(
        "❗ Please provide an image URL.\n\nUsage: /removebg [image_url]",
        threadID,
        messageID
      );
    }

    const imageUrl = args[0];
    if (!/^https?:\/\//.test(imageUrl)) {
      return api.sendMessage(
        "❌ Invalid image URL. Please provide a valid URL starting with http:// or https://",
        threadID,
        messageID
      );
    }

    try {
      const response = await axios.get(`https://api.ferdev.my.id/tools/removebg?link=${encodeURIComponent(imageUrl)}`);
      const data = response.data;

      if (!data || !data.result) {
        return api.sendMessage(
          "❌ Failed to remove background or invalid image URL.",
          threadID,
          messageID
        );
      }

      const resultImageUrl = data.result;

      if (typeof global.utils?.getStream !== "function") {
        return api.sendMessage(
          "❌ Image streaming utility not available.",
          threadID,
          messageID
        );
      }

      let attachment;
      try {
        attachment = await global.utils.getStream(resultImageUrl);
      } catch (imgErr) {
        return api.sendMessage(
          `❌ Unable to fetch processed image.\nError: ${imgErr.message}`,
          threadID,
          messageID
        );
      }

      return api.sendMessage(
        {
          body: "✅ Background removed successfully. See the image below:",
          attachment
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error("Error in removebg command:", error);
      api.sendMessage(
        `❌ Failed to remove background.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};