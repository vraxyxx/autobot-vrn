const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "carbon",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["codeimg", "carbonimg"],
  description: "Generate a Carbon code image from text",
  usage: "carbon [your code]",
  credits: "Vern",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const code = args.join(" ").trim();
  const { threadID, messageID } = event;

  if (!code) {
    return api.sendMessage("❌ Please provide code or text to convert.\n\nExample: carbon console.log('Hello World')", threadID, messageID);
  }

  const msgLoading = `🖼️ Generating Carbon code image for:\n\`\`\`\n${code}\n\`\`\`\nPlease wait...`;
  api.sendMessage(msgLoading, threadID, async () => {
    try {
      const apiUrl = `https://api.ferdev.my.id/maker/carbon?text=${encodeURIComponent(code)}`;
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      const imgPath = path.join(__dirname, "..", "cache", `carbon-${Date.now()}.png`);
      fs.writeFileSync(imgPath, Buffer.from(res.data));

      const caption = `✅ Here's your Carbon code image for:\n"${code}"`;

      return api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => fs.unlinkSync(imgPath));

    } catch (error) {
      console.error("❌ Error generating Carbon image:", error.message || error);
      return api.sendMessage("❌ Failed to generate image. Please try again later.", threadID, messageID);
    }
  });
};
