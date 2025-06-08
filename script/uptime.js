const axios = require('axios');

module.exports.config = {
  name: "blackbox",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Ask Blackbox AI any question using the Kaiz API.",
  usage: "/blackbox <your question>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const question = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No question provided
  if (!question) {
    const usageMessage = `════『 𝗕𝗟𝗔𝗖𝗞𝗕𝗢𝗫 』════\n\n` +
      `⚠️ Please provide a question for Blackbox AI.\n\n` +
      `📌 Usage: ${prefix}blackbox <your question>\n` +
      `💬 Example: ${prefix}blackbox what is 1+1?\n\n` +
      `> Thank you for using the Blackbox AI!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗕𝗟𝗔𝗖𝗞𝗕𝗢𝗫 』════\n\n` +
      `💡 Thinking about: "${question}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Blackbox API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/blackbox";
    const response = await axios.get(apiUrl, {
      params: {
        ask: question,
        uid: senderID,
        webSearch: "chrome",
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    // Prefer common answer fields, fallback to full response as string
    const answer = response.data?.answer || response.data?.result || response.data?.response || JSON.stringify(response.data);

    let resultMsg = `════『 𝗕𝗟𝗔𝗖𝗞𝗕𝗢𝗫 』════\n\n`;
    resultMsg += `❓ Question: ${question}\n`;
    resultMsg += `💬 Answer: ${answer}\n\n`;
    resultMsg += `> Powered by Kaiz Blackbox API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in blackbox command:', error.message || error);

    const errorMessage = `════『 𝗕𝗟𝗔𝗖𝗞𝗕𝗢𝗫 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to get answer from Blackbox AI.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};