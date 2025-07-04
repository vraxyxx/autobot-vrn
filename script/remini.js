const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports.config = {
  name: "remini",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Vern",
  description: "Enhance image using Remini API",
  commandCategory: "tools",
  usages: "[reply a photo]",
  cooldowns: 0
};

module.exports.run = async function ({ api, event }) {
  const messageReply = event.messageReply;

  if (
    !messageReply ||
    !messageReply.attachments ||
    messageReply.attachments.length === 0 ||
    messageReply.attachments[0].type !== "photo"
  ) {
    return api.sendMessage("📷 Please reply to a photo to enhance it using Remini.", event.threadID, event.messageID);
  }

  const inputUrl = messageReply.attachments[0].url;
  const API_KEY = "0ff49fce-1537-4798-9d90-69db487be671";
  const apiUrl = `https://kaiz-apis.gleeze.com/api/remini?input=${encodeURIComponent(inputUrl)}&apikey=${API_KEY}`;

  try {
    const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
    const enhancedImg = res.data;

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir); // Make sure cache folder exists

    const filePath = path.join(cacheDir, `enhanced_${Date.now()}.jpg`);
    await fs.writeFile(filePath, enhancedImg);

    api.sendMessage(
      {
        body: "✅ Image enhanced successfully!",
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      async () => {
        // Clean up file after sending
        await fs.unlink(filePath);
      },
      event.messageID
    );

  } catch (error) {
    console.error("❌ Remini API error:", error.response?.data || error.message);
    return api.sendMessage("🚫 Failed to enhance the image. Please try again later.", event.threadID, event.messageID);
  }
};