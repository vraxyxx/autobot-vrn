const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "vampire",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Vern",
  description: "Convert an image to vampire style using API",
  commandCategory: "image",
  usages: "Reply to an image",
  cooldowns: 5,
  role: 0,
  hasPrefix: true
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, messageID } = event;

  if (
    !messageReply ||
    !messageReply.attachments ||
    messageReply.attachments.length === 0 ||
    messageReply.attachments[0].type !== "photo"
  ) {
    return api.sendMessage("🖼 Please reply to an image to transform it into vampire style.", threadID, messageID);
  }

  const imageUrl = encodeURIComponent(messageReply.attachments[0].url);
  const apiUrl = `https://kaiz-apis.gleeze.com/api/vampire?imageUrl=${imageUrl}&apikey=0ff49fce-1537-4798-9d90-69db487be671`;

  try {
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    const imgPath = path.join(__dirname, "cache", `vampire_${threadID}.jpg`);
    fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

    return api.sendMessage({
      body: "🧛 Here's your vampire version!",
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => fs.unlinkSync(imgPath), messageID);

  } catch (err) {
    console.error("❌ Vampire API Error:", err.message || err);
    return api.sendMessage("🚫 Failed to transform image. Please try again later.", threadID, messageID);
  }
};
