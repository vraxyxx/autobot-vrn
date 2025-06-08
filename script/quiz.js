const axios = require('axios');

module.exports.config = {
  name: "quiz",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get a random quiz question using the Rapido Zetsu API.",
  usage: "/quiz",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗤𝗨𝗜𝗭 』════\n\n🧩 Fetching a random quiz question...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Rapido Zetsu quiz API
    const apiUrl = "https://rapido.zetsu.xyz/api/quiz";
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗤𝗨𝗜𝗭 』════\n\n`;
    if (response.data) {
      const { question, answer, options, category, difficulty } = response.data;

      if (category) resultMsg += `Category: ${category}\n`;
      if (difficulty) resultMsg += `Difficulty: ${difficulty}\n`;
      if (question) resultMsg += `\n❓ ${question}\n`;

      if (Array.isArray(options) && options.length > 0) {
        resultMsg += `\n🔹 Options:\n`;
        options.forEach((opt, idx) => {
          resultMsg += `  ${idx + 1}. ${opt}\n`;
        });
      }

      resultMsg += `\n💡 Answer: ${answer || "Unknown"}\n`;
      resultMsg += `\n> Powered by Rapido Zetsu`;
    } else {
      resultMsg += "⚠️ Unable to fetch a quiz question at this time.";
    }

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in quiz command:', error.message || error);

    const errorMessage = `════『 𝗤𝗨𝗜𝗭 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch quiz question.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};