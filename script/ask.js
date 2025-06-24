const axios = require("axios");

module.exports.config = {
  name: "ask",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Ask a question and get an AI-powered answer using Ace API",
  usage: "/ask <your question>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // Join all arguments as the input prompt
  const query = args.join(" ");
  if (!query) {
    return api.sendMessage("❌ Please provide a question or prompt.\n\nExample:\n/ask What is the capital of France?", threadID, messageID);
  }

  const apiUrl = `https://ace-rest-api.onrender.com/api/openai?text=${encodeURIComponent(query)}`;

  try {
    const res = await axios.get(apiUrl);
    const answer = res.data?.result;

    if (!answer) {
      return api.sendMessage("⚠️ Failed to retrieve a response from the AI.", threadID, messageID);
    }

    const msg = `🤖 𝗔𝗜 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘:\n\n${answer}`;
    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    console.error("❌ AI Command Error:", error.message || error);
    return api.sendMessage("🚫 Error retrieving AI response. Please try again later.", threadID, messageID);
  }
};
