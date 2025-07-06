const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
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
  },

  run: async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;

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
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      const outputPath = path.join(__dirname, "cache", `vampire_${Date.now()}.jpg`);
      await fs.ensureDir(path.join(__dirname, "cache"));
      fs.writeFileSync(outputPath, Buffer.from(res.data, "binary"));

      return api.sendMessage({
        body: "🧛 Here's your vampire transformation!",
        attachment: fs.createReadStream(outputPath)
      }, threadID, () => fs.unlinkSync(outputPath), messageID);

    } catch (error) {
      console.error("[vampire.js] API Error:", error.message || error);
      return api.sendMessage("🚫 Error: Couldn't fetch vampire image. Try again later.", threadID, messageID);
    }
  }
};
