const axios = require('axios');

module.exports.config = {
  name: "alldl",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Download video/audio from multiple platforms using Kagenou API.",
  usage: "/alldl <url>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if your bot uses a different prefix

  if (args.length < 1) {
    const usageMessage = 
      `════『 𝗔𝗟𝗟𝗗𝗟 』════\n\n` +
      `⚠️ Please provide a valid media URL to download.\n\n` +
      `📌 Usage: ${prefix}alldl <url>\n` +
      `💬 Example: ${prefix}alldl https://www.youtube.com/watch?v=example\n\n` +
      `> Powered by Kagenou API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const url = args[0];
  const apiUrl = `https://cid-kagenou-api-production.up.railway.app/api/alldl?url=${encodeURIComponent(url)}`;

  try {
    // Loading message
    const waitMsg = `════『 𝗔𝗟𝗟𝗗𝗟 』════\n\n🔗 Fetching download links...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the API
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗔𝗟𝗟𝗗𝗟 』════\n\n`;
    if (response.data && response.data.status && response.data.result) {
      resultMsg += `✅ Download links for your media:\n`;
      if (Array.isArray(response.data.result)) {
        response.data.result.forEach((item, idx) => {
          resultMsg += `\n${idx + 1}. ${item.url || item.link}`;
        });
      } else if (typeof response.data.result === "object" && response.data.result.url) {
        resultMsg += `\n${response.data.result.url}`;
      } else {
        resultMsg += `\n${JSON.stringify(response.data.result, null, 2)}`;
      }
    } else if (response.data && response.data.message) {
      resultMsg += response.data.message;
    } else {
      resultMsg += "⚠️ No media links found or unsupported URL.";
    }
    resultMsg += `\n\n> Powered by Kagenou API`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in alldl command:', error.message || error);

    const errorMessage = 
      `════『 𝗔𝗟𝗟𝗗𝗟 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to process your request.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};