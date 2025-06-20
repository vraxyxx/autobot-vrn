const axios = require("axios");

module.exports.config = {
  name: "cosplaytele",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Fetch multiple cosplay images based on a search term",
  usage: "/cosplaytele <search_term>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Image"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ").trim() || "hentai"; // default fallback
  const prefix = "/"; // Change if using dynamic prefix

  try {
    const loadingMsg = `📥 Fetching cosplay images for: "${query}"...`;
    await api.sendMessage(loadingMsg, threadID, messageID);

    const apiUrl = `https://haji-mix.up.railway.app/api/cosplaytele?search=${encodeURIComponent(query)}&stream=true&limit=10&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;
    const response = await axios.get(apiUrl);

    const results = response.data?.data || response.data?.result || [];

    if (!results.length) {
      return api.sendMessage(`❌ No cosplay results found for "${query}".`, threadID, messageID);
    }

    for (const url of results) {
      await api.sendMessage({
        attachment: await global.utils.getStreamFromURL(url)
      }, threadID);

      // Optional delay to avoid spamming or rate limits
      await new Promise(res => setTimeout(res, 400));
    }

  } catch (error) {
    console.error("❌ Error in cosplaytele command:", error.message || error);
    const errorMsg = `════『 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `❌ Failed to fetch cosplay images.\nReason: ${error.message || "Unknown error"}`;
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
