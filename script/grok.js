const axios = require('axios');

module.exports.config = {
  name: "grok",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Ask Grok AI any question using the Rapido API.",
  usage: "/grok <your question>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No query provided
  if (!query) {
    const usageMessage = `════『 𝗚𝗥𝗢𝗞 』════\n\n` +
      `⚠️ Please provide a question for Grok AI.\n\n` +
      `📌 Usage: ${prefix}grok <your question>\n` +
      `💬 Example: ${prefix}grok what is love?\n\n` +
      `> Thank you for using Grok AI!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗚𝗥𝗢𝗞 』════\n\n` +
      `🤖 Thinking about: "${query}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Grok API
    const apiUrl = "https://rapido.zetsu.xyz/api/grok";
    const response = await axios.get(apiUrl, {
      params: {
        query: query
      }
    });

    // Prefer common answer fields, fallback to full response as string
    const answer = response.data?.result || response.data?.response || response.data?.answer || JSON.stringify(response.data);

    let resultMsg = `════『 𝗚𝗥𝗢𝗞 』════\n\n`;
    resultMsg += `❓ Question: ${query}\n`;
    resultMsg += `💬 Answer: ${answer}\n\n`;
    resultMsg += `> Powered by Rapido Grok API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in grok command:', error.message || error);

    const errorMessage = `════『 𝗚𝗥𝗢𝗞 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to get answer from Grok AI.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};