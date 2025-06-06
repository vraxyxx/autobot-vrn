const axios = require("axios");

module.exports = {
  config: {
    name: "aicoding",
    version: "1.0.0",
    author: "vern",
    description: "Ask coding questions or get explanations from AI.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage(
        "❗ Please provide a coding question or prompt.\n\nUsage: /aicoding [your question]",
        threadID,
        messageID
      );
    }

    const prompt = encodeURIComponent(args.join(" "));

    try {
      const response = await axios.get(`https://api.ferdev.my.id/ai/aicoding?prompt=${prompt}`);
      const data = response.data;

      if (!data || !data.result) {
        return api.sendMessage(
          "❌ No response from AI coding API.",
          threadID,
          messageID
        );
      }

      const answer = data.result;

      return api.sendMessage(
        `🤖 AI Coding Response:\n\n${answer}`,
        threadID,
        messageID
      );

    } catch (error) {
      console.error("Error in aicoding command:", error);
      api.sendMessage(
        `❌ Failed to fetch AI response.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};
