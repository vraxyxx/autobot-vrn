const axios = require('axios');

module.exports.config = {
  name: "chatgpt",
  version: "1.0.0",
  role: 0,
  credits: "vraxyxx",
  description: "Ask ChatGPT any question using the Ferdev API.",
  usage: "/chatgpt <your question>",
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
    const usageMessage = `════『 𝗖𝗛𝗔𝗧𝗚𝗣𝗧 』════\n\n` +
      `⚠️ Please provide a question or prompt for ChatGPT.\n\n` +
      `📌 Usage: ${prefix}chatgpt <your question>\n` +
      `💬 Example: ${prefix}chatgpt 1+1\n\n` +
      `> Thank you for using ChatGPT!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗖𝗛𝗔𝗧𝗚𝗣𝗧 』════\n\n` +
      `🤖 Thinking about: "${prompt}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the ChatGPT API
    const apiUrl = "https://api.ferdev.my.id/ai/chatgpt";
    const response = await axios.get(apiUrl, {
      params: { prompt: prompt }
    });

    // Prefer result field, fallback to other common fields or stringify
    const answer = response.data?.result || response.data?.response || response.data?.answer || JSON.stringify(response.data);

    let resultMsg = `════『 𝗖𝗛𝗔𝗧𝗚𝗣𝗧 』════\n\n`;
    resultMsg += `❓ Prompt: ${prompt}\n`;
    resultMsg += `💬 Answer: ${answer}\n\n`;
    resultMsg += `> Powered by Ferdev API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in chatgpt command:', error.message || error);

    const errorMessage = `════『 𝗖𝗛𝗔𝗧𝗚𝗣𝗧 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to get answer from ChatGPT.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};