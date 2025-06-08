const axios = require('axios');

module.exports.config = {
  name: "pinterest",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Search Pinterest images using the Kaiz API.",
  usage: "/pinterest <search term>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Image"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Adjust if your bot uses dynamic prefix

  if (!query) {
    const usageMessage = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n` +
      `⚠️ Please provide a search term.\n\n` +
      `📌 Usage: ${prefix}pinterest <search term>\n` +
      `💬 Example: ${prefix}pinterest flowers\n\n` +
      `> Powered by Kaiz API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Loading message
    const waitMsg = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n` +
      `🔍 Searching Pinterest for: "${query}"\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Kaiz Pinterest API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/pinterest";
    const apikey = "4fe7e522-70b7-420b-a746-d7a23db49ee5";
    const response = await axios.get(apiUrl, {
      params: { search: query, apikey }
    });

    let resultMsg = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n`;

    if (response.data && Array.isArray(response.data.result) && response.data.result.length > 0) {
      // Pick a random image from the results
      const imgUrl = response.data.result[Math.floor(Math.random() * response.data.result.length)];
      resultMsg += `Here's a Pinterest image for "${query}":\n${imgUrl}\n\n> Powered by Kaiz API`;
      // Optionally send as image attachment, uncomment below if bot supports sending image attachment:
      // const imgRes = await axios.get(imgUrl, { responseType: "stream" });
      // return api.sendMessage({ body: resultMsg, attachment: imgRes.data }, threadID, messageID);
      return api.sendMessage(resultMsg, threadID, messageID);
    } else {
      resultMsg += "⚠️ No images found for your search term.";
    }

    resultMsg += `\n> Powered by Kaiz API`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in pinterest command:', error.message || error);

    const errorMessage = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to search Pinterest.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};