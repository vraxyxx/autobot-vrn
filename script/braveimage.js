const axios = require("axios");

module.exports.config = {
  name: "braveimage",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Search images using Brave Search API",
  usage: "/braveimage <search term> - <limit (optional)>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Image"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if using dynamic prefix

  if (!args || args.length === 0) {
    const usageMsg = `════『 𝗕𝗥𝗔𝗩𝗘 𝗜𝗠𝗔𝗚𝗘 』════\n\n` +
      `🖼️ Please provide a search term.\n\n` +
      `📌 Usage: ${prefix}braveimage <search term> - <limit (1–20)>\n` +
      `💬 Example: ${prefix}braveimage cat - 5`;
    return api.sendMessage(usageMsg, threadID, messageID);
  }

  try {
    const query = args.join(" ");
    const [searchTerm, countInput] = query.split(" - ");
    const limit = parseInt(countInput) || 5;

    if (limit < 1 || limit > 20) {
      return api.sendMessage("❌ Limit must be between 1 and 20 images.", threadID, messageID);
    }

    const loadingMsg = `🔎 Searching Brave Images for: "${searchTerm}"\n📸 Limit: ${limit}`;
    await api.sendMessage(loadingMsg, threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/brave-image?search=${encodeURIComponent(searchTerm)}&limit=${limit}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;
    const { data } = await axios.get(apiUrl);

    const imageList = data?.data;

    if (!imageList || imageList.length === 0) {
      return api.sendMessage(`❌ No images found for "${searchTerm}".`, threadID, messageID);
    }

    for (const url of imageList.slice(0, limit)) {
      await api.sendMessage({
        attachment: await global.utils.getStreamFromURL(url)
      }, threadID);
    }

  } catch (error) {
    console.error("❌ Brave Image Error:", error.message || error);

    const errorMsg = `════『 𝗕𝗥𝗔𝗩𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch images.\nReason: ${error.message || "Unknown error"}\n\n` +
      `> Please try again later.`;
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
