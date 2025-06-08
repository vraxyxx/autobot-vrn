const axios = require('axios');

module.exports.config = {
  name: "searchai",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Ask Search AI any question using the Kaiz API.",
  usage: "/searchai <your question>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const question = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No question provided
  if (!question) {
    const usageMessage = `════『 𝗦𝗘𝗔𝗥𝗖𝗛 𝗔𝗜 』════\n\n` +
      `⚠️ Please provide a question for Search AI.\n\n` +
      `📌 Usage: ${prefix}searchai <your question>\n` +
      `💬 Example: ${prefix}searchai what is love?\n\n` +
      `> Thank you for using Search AI!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗦𝗘𝗔𝗥𝗖𝗛 𝗔𝗜 』════\n\n` +
      `🤖 Searching for: "${question}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Search AI API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/search-ai";
    const response = await axios.get(apiUrl, {
      params: {
        ask: question,
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    // Prefer common answer fields, fallback to full response as string
    const answer = response.data?.answer || response.data?.result || response.data?.response || JSON.stringify(response.data);

    let resultMsg = `════『 𝗦𝗘𝗔𝗥𝗖𝗛 𝗔𝗜 』════\n\n`;
    resultMsg += `❓ Question: ${question}\n`;
    resultMsg += `💬 Answer: ${answer}\n\n`;
    resultMsg += `> Powered by Kaiz Search AI API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in searchai command:', error.message || error);

    const errorMessage = `════『 𝗦𝗘𝗔𝗥𝗖𝗛 𝗔𝗜 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to get answer from Search AI.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};