const axios = require('axios');

module.exports.config = {
  name: "pinterest",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Search for Pinterest images using the Hiroshi API.",
  usage: "/pinterest <search term>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Image"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No search term provided
  if (!query) {
    const usageMessage = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n` +
      `⚠️ Please provide a search term for Pinterest images.\n\n` +
      `📌 Usage: ${prefix}pinterest <search term>\n` +
      `💬 Example: ${prefix}pinterest edogawa ranpo\n\n` +
      `> Thank you for using Pinterest Image Search!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n` +
      `🔎 Searching Pinterest for: "${query}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Hiroshi Pinterest Image API
    const apiUrl = "https://hiroshi-api.onrender.com/image/pinterest";
    const response = await axios.get(apiUrl, {
      params: {
        search: query
      }
    });

    // Pinterest API may return an object or an array of image URLs
    let images = [];
    if (Array.isArray(response.data)) {
      images = response.data;
    } else if (typeof response.data === "object" && response.data.result) {
      images = Array.isArray(response.data.result) ? response.data.result : [response.data.result];
    } else if (typeof response.data === "string" && response.data.startsWith("http")) {
      images = [response.data];
    }

    if (!images.length) {
      return api.sendMessage(
        `⚠️ No Pinterest images found for "${query}".`, threadID, messageID
      );
    }

    // Limit to 1-5 images (prevent spam) and get images as streams
    const imageStreams = await Promise.all(
      images.slice(0, 3).map(async (url) => {
        try {
          const res = await axios.get(url, { responseType: "stream" });
          return res.data;
        } catch {
          return null;
        }
      })
    );

    // Filter out any failed downloads
    const attachments = imageStreams.filter(Boolean);

    if (attachments.length === 0) {
      return api.sendMessage(
        `⚠️ Failed to fetch Pinterest images for "${query}".`, threadID, messageID
      );
    }

    return api.sendMessage({
      body: `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\nHere ${attachments.length > 1 ? "are" : "is"} your Pinterest image${attachments.length > 1 ? "s" : ""} for "${query}"!\n\n> Powered by Hiroshi API`,
      attachment: attachments
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in pinterest command:', error.message || error);

    const errorMessage = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch Pinterest images.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};