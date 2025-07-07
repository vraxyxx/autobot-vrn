const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "remini",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  aliases: [],
  usages: "< reply to image >",
  cooldown: 5,
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;
  const tempPath = path.join(__dirname, 'cache', `remini_${Date.now()}.jpg`);

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an image to enhance.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = encodeURIComponent(attachment.url);
  const apiKey = '4fe7e522-70b7-420b-a746-d7a23db49ee5';
  const apiUrl = `https://kaiz-apis.gleeze.com/api/remini?url=${imageUrl}&stream=true&apikey=${apiKey}`;

  try {
    api.sendMessage("⏳ Enhancing image, please wait...", threadID, messageID);

    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: "✅ Image enhanced!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (err) {
    console.error("Remini Error:", err.message);
    api.sendMessage("❌ An error occurred while enhancing the image.", threadID, messageID);
  }
};