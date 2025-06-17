const axios = require('axios');

module.exports.config = {
  name: "pinterest",
  version: "1.0",
  credits: "vern", // DO NOT CHANGE
  description: "Search images from Pinterest",
  usage: "pinterest <search term> - <number of images>",
  cooldown: 5,
  permissions: [0],
  commandCategory: "image",
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args || args.length === 0) {
    return api.sendMessage(
      "🖼️ | Invalid format!\n\nUse:\npinterest <search term> - <number of images>\nExample: pinterest cat - 5",
      threadID,
      messageID
    );
  }

  const input = args.join(" ");
  const [searchTerm, count] = input.split(" - ");

  if (!searchTerm || !count) {
    return api.sendMessage(
      "🖼️ | Invalid format!\n\nUse:\npinterest <search term> - <number of images>\nExample: pinterest cat - 5",
      threadID,
      messageID
    );
  }

  const numOfImages = parseInt(count.trim());

  if (isNaN(numOfImages) || numOfImages < 1 || numOfImages > 10) {
    return api.sendMessage(
      "⚠️ | Please specify a valid number of images between 1 and 10.",
      threadID,
      messageID
    );
  }

  try {
    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/pin?title=${encodeURIComponent(searchTerm)}&count=${numOfImages}`;
    const response = await axios.get(apiUrl);
    const imageUrls = response.data?.data?.slice(0, numOfImages) || [];

    if (imageUrls.length === 0) {
      return api.sendMessage(
        `❌ | No results found for: "${searchTerm}"`,
        threadID,
        messageID
      );
    }

    for (const url of imageUrls) {
      await api.sendMessage({
        body: "",
        attachment: await global.utils.getStreamFromURL(url)
      }, threadID);
    }

  } catch (err) {
    console.error("Pinterest API Error:", err);
    return api.sendMessage(
      "❌ | Failed to fetch images. Please try again later.",
      threadID,
      messageID
    );
  }
};
