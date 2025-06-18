const axios = require('axios');

module.exports.config = {
  name: "gemini",
  version: "1.0.0",
  role: 0,
  credits: "vraxyxx",
  description: "Ask Gemini AI any question using the Ferdev API.",
  usage: "/gemini <your question>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(' ').trim();
  const prefix = "/"; // Adjust if your bot uses a different prefix

  // No prompt provided
  if (!prompt) {
    const usageMessage = `════『 𝗚𝗘𝗠𝗜𝗡𝗜 』════\n\n` +
      `⚠️ Please provide a question or prompt for Gemini AI.\n\n` +
      `📌 Usage: ${prefix}gemini <your question>\n` +
      `💬 Example: ${prefix}gemini 1+1\n\n` +
      `> Thank you for using Gemini AI!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗚𝗘𝗠𝗜𝗡𝗜 』════\n\n` +
      `🤖 Thinking about: "${prompt}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Gemini API
    const apiUrl = "https://api.ferdev.my.id/ai/gemini";
    const response = await axios.get(apiUrl, {
      params: {
        prompt: prompt
      }
    });

    // Prefer result, fallback to other common fields or stringify
    const answer = response.data?.result || response.data?.response || response.data?.answer || JSON.stringify(response.data);

    let resultMsg = `════『 𝗚𝗘𝗠𝗜𝗡𝗜 』════\n\n`;
    resultMsg += `❓ Prompt: ${prompt}\n`;
    resultMsg += `💬 Answer: ${answer}\n\n`;
    resultMsg += `> Thanks for using vern-bot-site`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in gemini command:', error.message || error);

    const errorMessage = `════『 𝗚𝗘𝗠𝗜𝗡𝗜 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to get answer from Gemini API.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};