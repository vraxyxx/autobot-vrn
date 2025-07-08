const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "upscale",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["enhance"],
  description: "Upscale a replied image using Kaiz API",
  usage: "reply to an image with: upscale",
  credits: "Vern",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, messageID, senderID } = event;

  // Validate
  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("❌ Please reply to an image to upscale it.", threadID, messageID);
  }

  const imageUrl = messageReply.attachments[0].url;
  const apiUrl = `https://kaiz-apis.gleeze.com/api/upscale?imageUrl=${encodeURIComponent(imageUrl)}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;

  // Notify
  api.sendMessage("📤 Upscaling your image, please wait...", threadID, messageID);

  try {
    // Fetch response from API
    const response = await axios.get(apiUrl);
    const imageResultUrl = response.data?.result;

    if (!imageResultUrl) {
      return api.sendMessage("❌ No image returned from API.", threadID, messageID);
    }

    // Download enhanced image
    const filePath = path.join(__dirname, "cache", `upscaled_${Date.now()}.jpg`);
    const writer = fs.createWriteStream(filePath);

    const imageStream = await axios({
      url: imageResultUrl,
      method: "GET",
      responseType: "stream"
    });

    imageStream.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: "✅ Here’s your enhanced image!",
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", (err) => {
      console.error("[upscale] Save error:", err);
      api.sendMessage("❌ Failed to download the upscaled image.", threadID, messageID);
    });

  } catch (error) {
    console.error("[upscale] API Error:", error);
    return api.sendMessage("🚫 Error while upscaling. Please try again later.", threadID, messageID);
  }
};
