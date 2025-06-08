const axios = require('axios');

module.exports.config = {
  name: "recipe",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get a random recipe using the Rapido Zetsu API.",
  usage: "/recipe",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Fun"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message first
    const waitMsg = `════『 𝗥𝗘𝗖𝗜𝗣𝗘 』════\n\n🍳 Fetching a random recipe...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Rapido Zetsu recipe API
    const apiUrl = "https://rapido.zetsu.xyz/api/recipe";
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗥𝗘𝗖𝗜𝗣𝗘 』════\n\n`;
    if (response.data) {
      // Build recipe message based on possible response structure
      if (response.data.title) resultMsg += `🍽️ ${response.data.title}\n\n`;
      if (response.data.category) resultMsg += `Category: ${response.data.category}\n`;
      if (response.data.area) resultMsg += `Origin: ${response.data.area}\n`;
      if (response.data.ingredients) {
        resultMsg += `\n📝 Ingredients:\n`;
        if (Array.isArray(response.data.ingredients)) {
          resultMsg += response.data.ingredients.map(i => `- ${i}`).join('\n');
        } else {
          resultMsg += response.data.ingredients;
        }
      }
      if (response.data.instructions) {
        resultMsg += `\n\n🍳 Instructions:\n${response.data.instructions}`;
      }
      if (response.data.source) {
        resultMsg += `\n\n🔗 Source: ${response.data.source}`;
      }
      if (response.data.image) {
        // Send with image attachment
        const imgRes = await axios.get(response.data.image, { responseType: "stream" });
        return api.sendMessage({
          body: resultMsg + `\n\n> Powered by Rapido Zetsu`,
          attachment: imgRes.data
        }, threadID, messageID);
      }
    } else {
      resultMsg += "⚠️ Unable to fetch a recipe at this time.";
    }

    resultMsg += `\n\n> Powered by Rapido Zetsu`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in recipe command:', error.message || error);

    const errorMessage = `════『 𝗥𝗘𝗖𝗜𝗣𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch recipe.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};