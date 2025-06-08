const axios = require("axios");

module.exports = {
  config: {
    name: "ssweb",
    version: "1.0.1",
    author: "vern",
    description: "Take a screenshot of a website from a URL.",
    prefix: true,
    cooldowns: 5,
    commandCategory: "utility",
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

    const rawUrl = args[0];
    // Basic validation for URL input
    if (!/^https?:\/\//.test(rawUrl)) {
      return api.sendMessage(
        "❌ Invalid URL format. Please include http:// or https://",
        threadID,
        messageID
      );
    }

    const targetUrl = encodeURIComponent(rawUrl);

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

      if (typeof global.utils?.getStream !== "function") {
        return api.sendMessage(
          "❌ Image streaming utility not available.",
          threadID,
          messageID
        );
      }

      let attachment;
      try {
        attachment = await global.utils.getStream(screenshotUrl);
      } catch (imgErr) {
        return api.sendMessage(
          `❌ Unable to fetch screenshot image.\nError: ${imgErr.message}`,
          threadID,
          messageID
        );
      }

      return api.sendMessage(
        {
          body: "✅ Website screenshot:",
          attachment
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