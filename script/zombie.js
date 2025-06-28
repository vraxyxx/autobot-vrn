const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "zombie",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  aliases: [],
  usages: "< reply to image >",
  cooldown: 5,
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;
  const tempPath = path.join(__dirname, "cache", `zombiev2_${Date.now()}.jpg`);

  // Ensure image is replied to
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an image to apply the zombie effect.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = encodeURIComponent(attachment.url);
  const apiUrl = `https://xvi-rest-api.vercel.app/api/zombie?imageUrl=${imageUrl}`;

  try {
    api.sendMessage("🧟 Applying Zombie effect, please wait...", threadID, messageID);

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: "✅ Zombie effect applied successfully!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Zombie Effect Error:", error.message);
    api.sendMessage("❌ An error occurred while applying the effect. Please try again later.", threadID, messageID);
  }
};