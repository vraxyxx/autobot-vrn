const axios = require('axios');

module.exports.config = {
  name: "pinterest",
  version: "1.0.0",
  role: 0,
  credits: "vraxyxx",
  description: "Search Pinterest images using the Ferdev API.",
  usage: "/pinterest <search term>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Search"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Adjust if your bot uses a different prefix

  // No query provided
  if (!query) {
    const usageMessage = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n` +
      `⚠️ Please provide a search term for Pinterest.\n\n` +
      `📌 Usage: ${prefix}pinterest <search term>\n` +
      `💬 Example: ${prefix}pinterest cat\n\n` +
      `> Thank you for using Pinterest Search!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n` +
      `🔎 Searching Pinterest for: "${query}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Pinterest Search API
    const apiUrl = "https://api.ferdev.my.id/search/pinterest";
    const response = await axios.get(apiUrl, {
      params: {
        query: query
      }
    });

    const results = response.data?.result || [];
    if (!Array.isArray(results) || results.length === 0) {
      return api.sendMessage("❌ No results found for your search.", threadID, messageID);
    }

    // Send up to 5 image links (or adjust as desired)
    let resultMsg = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n`;
    resultMsg += `🔎 Results for: ${query}\n\n`;
    results.slice(0, 5).forEach((img, idx) => {
      resultMsg += `${idx + 1}. ${img}\n`;
    });
    resultMsg += `\n> Thanks for using vern-site!`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in pinterest command:', error.message || error);

    const errorMessage = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to search Pinterest.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};