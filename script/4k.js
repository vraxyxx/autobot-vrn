const axios = require("axios");

module.exports.config = {
  name: "4k",
  version: "1.1",
  role: 0,
  author: "Vern",
  credits: "Vern",
  aliases: ["upscale"],
  countDown: 5,
  longDescription: "Upscale images to 4K resolution.",
  category: "image",
  usages: "< reply to image >",
  cooldown: 5,
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || !messageReply.attachments[0]) {
    return api.sendMessage("❌ Please reply to an image to upscale it to 4K.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = encodeURIComponent(attachment.url);
  const domain = "xyz"; // Replace with real domain if needed
  const upscaleUrl = `https://smfahim.${domain}/4k?url=${imageUrl}`;

  api.sendMessage("🔄 Upscaling image to 4K, please wait...", threadID, async (err, info) => {
    try {
      const { data } = await axios.get(upscaleUrl);
      const stream = await global.utils.getStreamFromURL(data.image, "upscaled-4k.png");

      api.sendMessage({
        body: "✅ Here is your 4K upscaled image:",
        attachment: stream
      }, threadID, () => {
        if (info?.messageID) api.unsendMessage(info.messageID);
      }, messageID);

    } catch (error) {
      console.error("4K Upscale Error:", error.message);
      api.sendMessage("❌ An error occurred while upscaling the image.", threadID, messageID);
    }
  });
};