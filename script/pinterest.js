const axios = require("axios");

module.exports.config = {
  name: "pinterest",
  version: "1.0.3",
  author: "vern",
  description: "Search Pinterest images by query and send a random result.",
  prefix: true,
  cooldowns: 5,
  commandCategory: "image",
  dependencies: {
    axios: ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args.length) {
    return api.sendMessage(
      "❗ Please provide a search query.\n\nUsage: /pinterest [search terms]",
      threadID,
      messageID
    );
  }

  const query = encodeURIComponent(args.join(" "));

  // FIX: Corrected the API URL - the original had two ? and a hardcoded multo search
  // Make sure the API is correct and supports the query parameter
  const apiUrl = `https://kaiz-apis.gleeze.com/api/pinterest?search=${query}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5t`;

  try {
    const response = await axios.get(apiUrl);

    if (!response.data || !Array.isArray(response.data.data)) {
      return api.sendMessage(
        "❌ Unexpected API response format.",
        threadID,
        messageID
      );
    }

    const images = response.data.data;

    if (!images.length) {
      return api.sendMessage(
        `❌ No images found for "${args.join(" ")}".`,
        threadID,
        messageID
      );
    }

    // Select a random image URL
    const randomImage = images[Math.floor(Math.random() * images.length)];

    // Check if global.utils.getStream is available
    if (typeof global.utils?.getStream !== "function") {
      return api.sendMessage(
        "❌ Image streaming utility not available.",
        threadID,
        messageID
      );
    }

    let attachment;
    try {
      attachment = await global.utils.getStream(randomImage);
    } catch (imgErr) {
      return api.sendMessage(
        `❌ Unable to fetch image from Pinterest.\nError: ${imgErr.message}`,
        threadID,
        messageID
      );
    }

    // Send message with image attachment stream
    await api.sendMessage(
      {
        body: `🎉 Pinterest result for: ${args.join(" ")}`,
        attachment
      },
      threadID,
      messageID
    );

  } catch (error) {
    console.error("Error in pinterest command:", error);
    return api.sendMessage(
      `❌ Failed to fetch Pinterest images.\nError: ${error.message}`,
      threadID,
      messageID
    );
  }
};