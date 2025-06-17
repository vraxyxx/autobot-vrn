const axios = require('axios');

module.exports.config = {
  name: "imgbb",
  version: "1.0",
  credits: "vern", // DO NOT CHANGE
  description: "Upload an image to ImgBB and get the link.",
  usage: "Reply to an image and type: imgbb",
  cooldown: 5,
  permissions: [0],
  commandCategory: "tools",
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, messageID } = event;

  // Validate: must be a reply with attachment
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("📸 Please reply to an image to upload it to ImgBB.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];

  if (attachment.type !== "photo") {
    return api.sendMessage("❌ Only image uploads are supported at the moment.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const apiKey = "YOUR_APIKEY"; // 🔐 Replace this with your actual API key

  api.sendMessage("⏳ Uploading image to ImgBB, please wait...", threadID, messageID);

  try {
    const res = await axios.get(`https://kaiz-apis.gleeze.com/api/imgbb?url=${encodeURIComponent(imageUrl)}&apikey=${apiKey}`);
    const imgbbLink = res?.data?.link;

    if (!imgbbLink) {
      throw new Error("No link returned from API");
    }

    return api.sendMessage(`✅ Image uploaded successfully:\n\n${imgbbLink}`, threadID, messageID);
  } catch (err) {
    console.error("ImgBB Error:", err.response?.data || err.message);
    return api.sendMessage("❌ Failed to upload image to ImgBB. Try again later.", threadID, messageID);
  }
};
