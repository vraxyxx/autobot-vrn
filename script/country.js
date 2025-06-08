const axios = require('axios');

module.exports.config = {
  name: "country",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get information about a country using the Rapido API.",
  usage: "/country <country name>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const name = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No country name provided
  if (!name) {
    const usageMessage = `════『 𝗖𝗢𝗨𝗡𝗧𝗥𝗬 』════\n\n` +
      `⚠️ Please provide a country name.\n\n` +
      `📌 Usage: ${prefix}country <country name>\n` +
      `💬 Example: ${prefix}country Philippines\n\n` +
      `> Thank you for using the Country Info command!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗖𝗢𝗨𝗡𝗧𝗥𝗬 』════\n\n` +
      `🌍 Fetching information for: "${name}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Rapido Country API
    const apiUrl = "https://rapido.zetsu.xyz/api/country";
    const response = await axios.get(apiUrl, {
      params: {
        name: name
      }
    });

    const data = response.data;
    let resultMsg = `════『 𝗖𝗢𝗨𝗡𝗧𝗥𝗬 』════\n\n`;

    if (typeof data === "object" && (data.country || data.name)) {
      resultMsg += `• Country: ${data.country || data.name}\n`;
      if (data.capital) resultMsg += `• Capital: ${data.capital}\n`;
      if (data.region) resultMsg += `• Region: ${data.region}\n`;
      if (data.subregion) resultMsg += `• Subregion: ${data.subregion}\n`;
      if (data.population) resultMsg += `• Population: ${data.population}\n`;
      if (data.area) resultMsg += `• Area: ${data.area} km²\n`;
      if (data.currency) resultMsg += `• Currency: ${data.currency}\n`;
      if (data.languages) resultMsg += `• Languages: ${data.languages}\n`;
      if (data.flag) resultMsg += `• Flag: ${data.flag}\n`;
      if (data.timezone) resultMsg += `• Timezone: ${data.timezone}\n`;
    } else {
      resultMsg += "⚠️ No data found for this country.";
    }

    resultMsg += `\n> Powered by Rapido Country API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in country command:', error.message || error);

    const errorMessage = `════『 𝗖𝗢𝗨𝗡𝗧𝗥𝗬 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch the country info.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};