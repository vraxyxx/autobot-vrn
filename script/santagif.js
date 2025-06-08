const axios = require("axios");

module.exports.config = {
  name: "santagif",
  version: "1.0.0",
  author: "vern",
  description: "Generate a Santa-themed GIF from an image URL.",
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
      "🎅 Please provide an image URL.\n\nUsage: /santagif [image_url]\nExample: /santagif https://files.catbox.moe/91e6rp.jpg",
      threadID,
      messageID
    );
  }

  try {
    // Send loading message
    await api.sendMessage("🎅 Generating Santa GIF, please wait...", threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/santa-gif?imageUrl=${encodeURIComponent(imageUrl)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;

    // Get the Santa GIF as a stream
    const response = await axios.get(apiUrl, { responseType: "stream" });

    // Send the GIF back as an attachment
    return api.sendMessage({
      body: "🎅 Here is your Santa GIF!",
      attachment: response.data
    }, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in santagif command:", error.message || error);
    return api.sendMessage(
      `❌ Failed to generate Santa GIF.\nError: ${error.response?.data?.message || error.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};