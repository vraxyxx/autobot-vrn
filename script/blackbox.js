const axios = require("axios");

module.exports.config = {
  name: "blackbox",
  version: "1.0.0",
  author: "vern",
  description: "Ask BlackBox AI a question and get an answer.",
  prefix: true,
  cooldowns: 5,
  commandCategory: "ai",
  dependencies: {
    axios: ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const question = args.join(" ").trim();

  if (!question) {
    return api.sendMessage(
      "💬 Please provide a question for BlackBox AI.\n\nUsage: /blackbox [your question]\nExample: /blackbox what is love",
      threadID,
      messageID
    );
  }

  try {
    // Send loading message
    await api.sendMessage("🤖 Asking BlackBox AI, please wait...", threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/blackbox`;
    const response = await axios.get(apiUrl, {
      params: {
        ask: question,
        uid: senderID,
        webSearch: "google",
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    const result = response.data?.result || response.data?.answer || "";

    if (!result) {
      return api.sendMessage(
        "❌ No answer received from BlackBox AI.",
        threadID,
        messageID
      );
    }

    return api.sendMessage(`🤖 BlackBox AI says:\n\n${result}`, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in blackbox command:", error.message || error);
    return api.sendMessage(
      `❌ Failed to get an answer from BlackBox AI.\nError: ${error.response?.data?.message || error.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};