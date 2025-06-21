const axios = require('axios');

module.exports.config = {
  name: "aria",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Ask Aria AI any question using the Rapido API.",
  usage: "/aria <your question>",
  prefix: false,
  cooldowns: 3,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No prompt provided
  if (!prompt) {
    const usageMessage = `════『 𝗔𝗥𝗜𝗔 』════\n\n` +
      `⚠️ Please provide a question or prompt for Aria AI.\n\n` +
      `📌 Usage: ${prefix}aria <your question>\n` +
      `💬 Example: ${prefix}aria 1+1\n\n` +
      `> Thank you for using Aria AI!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗔𝗥𝗜𝗔 』════\n\n` +
      `🤖 Thinking about: "${prompt}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Aria API
    const apiUrl = "https://rapido.zetsu.xyz/api/aria";
    const response = await axios.get(apiUrl, {
      params: {
        prompt: prompt
      }
    });

    // Prefer common answer fields, fallback to full response as string
    const answer = response.data?.result || response.data?.response || response.data?.answer || JSON.stringify(response.data);

    let resultMsg = `════『 𝗔𝗥𝗜𝗔 』════\n\n`;
    resultMsg += `❓ Prompt: ${prompt}\n`;
    resultMsg += `💬 Answer: ${answer}\n\n`;
    resultMsg += `> Thanks for using Vern-Autobot site`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in aria command:', error.message || error);

    const errorMessage = `════『 𝗔𝗥𝗜𝗔 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to get answer from Aria AI.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};