module.exports.config = {
  name: "vernupload",
  version: "1.0.0",
  credits: "vern",
  description: "Auto upload image to Imgur anonymously (no API key needed). Reply to or send an image.",
  commandCategory: "Utility",
  usages: "[reply to image or send image]",
  cooldowns: 10
};

const axios = require("axios");

module.exports.run = async function({ api, event }) {
  try {
    const { threadID, messageID } = event;

    // Extract image URL either from reply or attachments
    let imageUrl = null;

    // Check if message is a reply and has attachments
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length) {
      for (const att of event.messageReply.attachments) {
        if (att.type === "photo" && att.url) {
          imageUrl = att.url;
          break;
        }
      }
    }

    // If no image in reply, check if current message has attachments
    if (!imageUrl && event.attachments && event.attachments.length) {
      for (const att of event.attachments) {
        if (att.type === "photo" && att.url) {
          imageUrl = att.url;
          break;
        }
      }
    }

    if (!imageUrl) {
      return api.sendMessage("❌ Please reply to an image or send an image with this command.", threadID, messageID);
    }

    // Download image data
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(imageResponse.data, "utf-8");

    // Prepare base64 string of image
    const base64Image = imageBuffer.toString("base64");

    // Imgur anonymous upload endpoint
    const IMGUR_CLIENT_ID = "546dcc88c8a1b1f"; // Public demo client ID

    // Form data for Imgur API
    const formData = new URLSearchParams();
    formData.append("image", base64Image);

    // Upload image
    const uploadRes = await axios.post("https://api.imgur.com/3/image", formData.toString(), {
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (uploadRes.data && uploadRes.data.success) {
      const imgurLink = uploadRes.data.data.link;
      return api.sendMessage(`✅ Image uploaded successfully!\n${imgurLink}`, threadID, messageID);
    } else {
      return api.sendMessage("❌ Failed to upload image to Imgur.", threadID, messageID);
    }
  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ An error occurred while uploading.", event.threadID, event.messageID);
  }
};
