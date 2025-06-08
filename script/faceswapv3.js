const axios = require("axios");

module.exports.config = {
  name: "faceswapv3",
  version: "1.0.0",
  author: "vern",
  description: "Swap faces between two images using FaceSwap V3 API.",
  prefix: true,
  cooldowns: 5,
  commandCategory: "image",
  dependencies: {
    axios: ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // Expect two image URLs as arguments
  const image1 = args[0];
  const image2 = args[1];

  if (!image1 || !image2) {
    return api.sendMessage(
      "🔄 Please provide two image URLs.\n\nUsage: /faceswapv3 [image_url_1] [image_url_2]\nExample: /faceswapv3 https://files.catbox.moe/91e6rp.jpg https://files.catbox.moe/91e6rp.jpg",
      threadID,
      messageID
    );
  }

  try {
    // Send loading message
    await api.sendMessage("🔄 Swapping faces, please wait...", threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/faceswap-v3?image1=${encodeURIComponent(image1)}&image2=${encodeURIComponent(image2)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;

    // Get the faceswapped image as a stream
    const response = await axios.get(apiUrl, { responseType: "stream" });

    // Send the image back as an attachment
    return api.sendMessage({
      body: "🔄 Here is your face-swapped image (V3)!",
      attachment: response.data
    }, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in faceswapv3 command:", error.message || error);
    return api.sendMessage(
      `❌ Failed to generate face swap image.\nError: ${error.response?.data?.message || error.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};