const axios = require('axios');

module.exports.config = {
  name: "tinyurl",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Shorten URLs using the Jonell01 TinyURL API.",
  usage: "/tinyurl <url>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if your bot uses a different prefix

  if (args.length < 1) {
    const usageMessage = `════『 𝗧𝗜𝗡𝗬𝗨𝗥𝗟 』════\n\n` +
      `⚠️ Please provide a URL to shorten.\n\n` +
      `📌 Usage: ${prefix}tinyurl <url>\n` +
      `💬 Example: ${prefix}tinyurl https://example.com\n\n` +
      `> Powered by Jonell01 TinyURL API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const url = args[0];

  try {
    // Loading message
    const waitMsg = `════『 𝗧𝗜𝗡𝗬𝗨𝗥𝗟 』════\n\n🔗 Shortening your URL...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the TinyURL API
    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/tinyurl?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗧𝗜𝗡𝗬𝗨𝗥𝗟 』════\n\n`;

    if (response.data && response.data.result) {
      resultMsg += `Original: ${url}\nShortened: ${response.data.result}`;
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else {
      resultMsg += "⚠️ No clear response from the TinyURL API.";
    }

    resultMsg += `\n\n> Powered by Jonell01 TinyURL API`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in tinyurl command:', error.message || error);

    const errorMessage = `════『 𝗧𝗜𝗡𝗬𝗨𝗥𝗟 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to shorten your URL.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};