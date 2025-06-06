const axios = require("axios");

module.exports = {
  config: {
    name: "text2img",
    version: "1.0.0",
    author: "vern",
    description: "Generate an image from text description.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage(
        "❗ Please provide a text description.\n\nUsage: /text2img [description]",
        threadID,
        messageID
      );
    }

    const text = encodeURIComponent(args.join(" "));

    try {
      const response = await axios.get(`https://api.ferdev.my.id/tools/text2img?text=${text}`);
      const data = response.data;

      if (!data || !data.result) {
        return api.sendMessage(
          "❌ Failed to generate image or invalid text.",
          threadID,
          messageID
        );
      }

      const imageUrl = data.result;

      return api.sendMessage(
        {
          body: "✅ Image generated from text:",
          attachment: await global.utils.getStream(imageUrl)
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error("Error in text2img command:", error);
      api.sendMessage(
        `❌ Failed to generate image.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};
