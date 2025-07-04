const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
  name: "remini",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Vern",
  description: "Enhance image using Remini API",
  commandCategory: "tools",
  usages: "[ reply a photo ]",
  cooldowns: 0,
};

module.exports.run = async function ({ api, event, args }) {
  const messageReply = event.messageReply;

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0 || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("Please reply to a photo to use this command.", event.threadID, event.messageID);
  }

  const photoUrl = messageReply.attachments[0].url;

  try {
    const response = await axios.get(`https://0f7723e0-abf0-46c4-9c17-a40a166dc99c-00-20552yypoemja.sisko.replit.dev/api/remini?input=${encodeURIComponent(photoUrl)}`, { responseType: "arraybuffer"});
    const img = response.data;


    const photoPath = path.join(__dirname, 'cache', 'enhanced.jpg');

    fs.writeFileSync(photoPath, Buffer.from(img), 'binary');

    api.sendMessage({ body: "✨ Image Enhance successfully", attachment: fs.createReadStream(photoPath) }, event.threadID, event.messageID);
  } catch (error) {
    console.error("Error calling Remini API:", error);
    api.sendMessage(`An error occurred while processing the image. Please try again later.\n${error}`, event.threadID, event.messageID);
  }
};