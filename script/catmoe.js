const axios = require("axios");

module.exports.config = {
  name: "catmoe",
  version: "1.0",
  role: 0,
  author: "Vern",
  credits: "Favinna",
  aliases: ["moefy", "animefilter"],
  countDown: 5,
  longDescription: "Apply anime-style filter to an image.",
  category: "image",
  usages: "< reply to an image >",
  cooldown: 5
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;

  // Check for a replied image
  if (!messageReply || !messageReply.attachments || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("❌ Please reply to an image to apply the anime-style filter.", threadID, messageID);
  }

  const imageUrl = encodeURIComponent(messageReply.attachments[0].url);
  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/catmoe?url=${imageUrl}`;

  try {
    api.sendMessage("🎨 Applying anime filter... please wait.", threadID, messageID);

    const response = await axios.get(apiUrl);
    const outputImage = response.data.output;

    if (!outputImage) {
      return api.sendMessage("❌ Failed to retrieve filtered image from the API.", threadID, messageID);
    }

    const imageStream = await global.utils.getStreamFromURL(outputImage);

    return api.sendMessage({
      body: "✅ Here's your anime-styled image!",
      attachment: imageStream
    }, threadID, messageID);

  } catch (err) {
    console.error("catmoe error:", err.message);
    return api.sendMessage("❌ An error occurred while processing the image.", threadID, messageID);
  }
};