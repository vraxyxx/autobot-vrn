const axios = require("axios");

module.exports = {
  config: {
    name: "removebg",
    version: "1.0.0",
    author: "vern",
    description: "Remove background from an image URL.",
    cooldowns: 5,
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

    const imageUrl = encodeURIComponent(args[0]);

    try {
      const response = await axios.get(`https://api.ferdev.my.id/tools/removebg?link=${imageUrl}`);
      const data = response.data;

      if (!data || !data.result) {
        return api.sendMessage(
          "❌ Failed to remove background or invalid image URL.",
          threadID,
          messageID
        );
      }

      const resultImageUrl = data.result;

      return api.sendMessage(
        {
          body: "✅ Background removed successfully. See the image below:",
          attachment: await global.utils.getStream(resultImageUrl)
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
