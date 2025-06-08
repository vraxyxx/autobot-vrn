const axios = require("axios");

module.exports.config = {
  name: "zombiev2",
  version: "1.0.0",
  author: "vern",
  description: "Generate a zombie-style image (V2) from a given image URL.",
  prefix: true,
  cooldowns: 5,
  commandCategory: "image",
  dependencies: {
    axios: ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const imageUrl = args[0];

  if (!imageUrl) {
    return api.sendMessage(
      "🧟 Please provide an image URL.\n\nUsage: /zombiev2 [image_url]\nExample: /zombiev2 https://files.catbox.moe/91e6rp.jpg",
      threadID,
      messageID
    );
  }

  try {
    // Send loading message
    await api.sendMessage("🧟‍♂️ Generating zombie image (V2), please wait...", threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/zombie-v2?imageUrl=${encodeURIComponent(imageUrl)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;

    // Get the zombie image as a stream
    const response = await axios.get(apiUrl, { responseType: "stream" });

    // Send the image back as an attachment
    return api.sendMessage({
      body: "🧟 Here is your zombie image (V2)!",
      attachment: response.data
    }, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in zombiev2 command:", error.message || error);
    return api.sendMessage(
      `❌ Failed to generate zombie image (V2).\nError: ${error.response?.data?.message || error.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};