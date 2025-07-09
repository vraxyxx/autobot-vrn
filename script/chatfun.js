const axios = require("axios");

module.exports.config = {
  name: "chatfun",
  version: "1.0",
  role: 0,
  author: "Vern",
  credits: "Vina",
  aliases: ["gptfun"],
  countDown: 3,
  longDescription: "Chat with a fun GPT-powered bot.",
  category: "ai",
  usages: "< your message >",
  cooldown: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const userPrompt = args.join(" ");

  if (!userPrompt) {
    return api.sendMessage("❌ Please enter a message to send to GPT Fun.", threadID, messageID);
  }

  const apiUrl = `https://smfahim.xyz/chatfun?question=${encodeURIComponent(userPrompt)}`;

  try {
    const response = await axios.get(apiUrl);
    const replyText = response.data.gptfun || "❌ No response received from the AI.";

    api.sendMessage(replyText, threadID, messageID);

  } catch (error) {
    console.error("chatfun error:", error.message);
    api.sendMessage("❌ An error occurred while contacting GPT Fun.", threadID, messageID);
  }
};