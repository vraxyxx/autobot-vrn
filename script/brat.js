const axios = require("axios");

module.exports = {
  config: {
    name: "brat",
    version: "1.0.0",
    author: "vern",
    description: "Generate brat style text image.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage(
        "❗ Please provide text to generate.\n\nUsage: /brat [text]",
        threadID,
        messageID
      );
    }

    const text = encodeURIComponent(args.join(" "));

    try {
      const response = await axios.get(`https://api.ferdev.my.id/maker/brat?text=${text}`);
      const data = response.data;

      if (!data || !data.result) {
        return api.sendMessage(
          "❌ Failed to generate brat text image.",
          threadID,
          messageID
        );
      }

      const imageUrl = data.result;

      return api.sendMessage(
        {
          body: "✅ Brat text image generated:",
          attachment: await global.utils.getStream(imageUrl)
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error("Error in brat command:", error);
      api.sendMessage(
        `❌ Failed to generate brat text image.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};
