const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "ocr",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  aliases: [],
  usages: "<reply to image>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ No attachment detected. Please reply to an image.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const apiUrl = `https://kaiz-apis.gleeze.com/api/ocr?url=${encodeURIComponent(imageUrl)}&apikey=APIKEY_HERE`;

  try {
    api.sendMessage("⌛ Extracting text from the image, please wait...", threadID, messageID);

    const response = await axios.get(apiUrl);
    const extractedText = response?.data?.text;

    if (!extractedText) {
      return api.sendMessage("❌ No text found in the image.", threadID, messageID);
    }

    const message = `✅ Extracted Text:\n\n${extractedText}`;

    api.sendMessage(message, threadID, messageID);

  } catch (error) {
    console.error("❌ Error extracting text from image:", error.response?.data || error.message);
    api.sendMessage("❌ An error occurred while extracting text from the image. Please try again later.", threadID, messageID);
  }
};