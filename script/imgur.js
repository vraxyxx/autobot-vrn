const axios = require("axios");

module.exports.config = {
  name: "imgur",
  version: "1.0.0",
  author: "vern",
  description: "Process an image via the Imgur API endpoint.",
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
      "🖼️ Please provide an image URL.\n\nUsage: /imgur [image_url]\nExample: /imgur https://i.imgur.com/Zu15xb4.jpeg",
      threadID,
      messageID
    );
  }

  try {
    // Send loading message
    await api.sendMessage("🖼️ Processing your image, please wait...", threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/imgur?url=${encodeURIComponent(imageUrl)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;

    // Get the processed image as a stream
    const response = await axios.get(apiUrl, { responseType: "stream" });

    // Send the image back as an attachment
    return api.sendMessage({
      body: "🖼️ Here is your processed image!",
      attachment: response.data
    }, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in imgur command:", error.message || error);
    return api.sendMessage(
      `❌ Failed to process image.\nError: ${error.response?.data?.message || error.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};