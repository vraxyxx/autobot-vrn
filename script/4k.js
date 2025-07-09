const axios = require("axios");

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale"],
    version: "1.1",
    role: 0,
    author: "Vern",
    countDown: 5,
    longDescription: "Upscale images to 4K resolution.",
    category: "image",
    guide: {
      en: "${pn} reply to an image to upscale it to 4K resolution."
    }
  },
  onStart: async function ({ message, event }) {
    const replyAttachment = event.messageReply?.attachments?.[0];

    if (!replyAttachment) {
      return message.reply("❌ Please reply to an image to upscale it.");
    }

    if (replyAttachment.type !== "photo") {
      return message.reply("❌ The replied message must be a photo.");
    }

    const imageUrl = encodeURIComponent(replyAttachment.url);
    const endpointDomain = "xyz"; // Set your domain here
    const upscaleApiUrl = `https://smfahim.${endpointDomain}/4k?url=${imageUrl}`;

    message.reply("🔄 Processing... Please wait a moment.", async (err, info) => {
      try {
        const {
          data: { image }
        } = await axios.get(upscaleApiUrl);

        const attachmentStream = await global.utils.getStreamFromURL(image, "4k-upscaled.png");

        message.reply({
          body: "✅ Here is your 4K upscaled image:",
          attachment: attachmentStream
        });

        const msgID = info?.messageID;
        if (msgID) message.unsend(msgID);

      } catch (error) {
        console.error("4K Upscale Error:", error);
        message.reply("❌ There was an error upscaling your image.");
      }
    });
  }
};