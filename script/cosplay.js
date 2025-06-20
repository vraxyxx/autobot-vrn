const axios = require("axios");

module.exports.config = {
  name: "cosplay",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Send a random cosplay girl photo",
  usage: "/cosplay",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Image"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    const apiUrl = "https://haji-mix.up.railway.app/api/cosplayv2?api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8";
    const res = await axios.get(apiUrl);
    const imageUrl = res.data?.url || res.data?.result;

    if (!imageUrl) {
      return api.sendMessage("❌ Failed to fetch cosplay image. Please try again later.", threadID, messageID);
    }

    return api.sendMessage({
      attachment: await global.utils.getStreamFromURL(imageUrl)
    }, threadID);

  } catch (error) {
    console.error("❌ Error in cosplay command:", error.message);
    return api.sendMessage(
      `❌ Error fetching cosplay image: ${error.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};
