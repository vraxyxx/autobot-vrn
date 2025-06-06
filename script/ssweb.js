const axios = require("axios");

module.exports = {
  config: {
    name: "ssweb",
    version: "1.0.0",
    author: "vern",
    description: "Take a screenshot of a website from a URL.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage(
        "❗ Please provide a website URL.\n\nUsage: /ssweb [url]",
        threadID,
        messageID
      );
    }

    const targetUrl = encodeURIComponent(args[0]);

    try {
      const response = await axios.get(`https://api.ferdev.my.id/tools/ssweb?url=${targetUrl}`);
      const data = response.data;

      if (!data || !data.result) {
        return api.sendMessage(
          "❌ Failed to take screenshot or invalid URL.",
          threadID,
          messageID
        );
      }

      const screenshotUrl = data.result;

      return api.sendMessage(
        {
          body: "✅ Website screenshot:",
          attachment: await global.utils.getStream(screenshotUrl)
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error("Error in ssweb command:", error);
      api.sendMessage(
        `❌ Failed to take screenshot.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};
