const axios = require('axios');

module.exports.config = {
  name: "tikstalk",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get TikTok user stats using the Kaiz API.",
  usage: "/tikstalk <tiktok username>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const username = args.join('').trim().replace(/^@/, '');
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No username provided
  if (!username) {
    const usageMessage = `════『 𝗧𝗜𝗞𝗦𝗧𝗔𝗟𝗞 』════\n\n` +
      `⚠️ Please provide a TikTok username.\n\n` +
      `📌 Usage: ${prefix}tikstalk <tiktok username>\n` +
      `💬 Example: ${prefix}tikstalk vern2\n\n` +
      `> Thank you for using Tikstalk!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗧𝗜𝗞𝗦𝗧𝗔𝗟𝗞 』════\n\n` +
      `🔍 Fetching TikTok stats for: @${username}\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Tikstalk API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/tikstalk";
    const response = await axios.get(apiUrl, {
      params: {
        username: username,
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    const data = response.data;
    let resultMsg = `════『 𝗧𝗜𝗞𝗦𝗧𝗔𝗟𝗞 』════\n\n`;

    if (data && typeof data === "object") {
      for (const [key, value] of Object.entries(data)) {
        resultMsg += `• ${key}: ${value}\n`;
      }
    } else {
      resultMsg += "⚠️ Unable to parse TikTok user data.";
    }

    resultMsg += `\n> Powered by Kaiz Tikstalk API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in tikstalk command:', error.message || error);

    const errorMessage = `════『 𝗧𝗜𝗞𝗦𝗧𝗔𝗟𝗞 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch TikTok stats.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};