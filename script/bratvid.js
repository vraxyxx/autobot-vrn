const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "bratvid",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["brat", "bratdance"],
  description: "Generate a Bratz video with your custom text",
  usage: "bratvid [text]",
  credits: "Vern",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const text = args.join(" ").trim();
  const { threadID, messageID } = event;

  if (!text) return api.sendMessage("❌ Please enter text to generate the video.\n\nExample: bratvid dance", threadID, messageID);

  const msgLoading = `🎀 Generating Bratz video for: "${text}"...\nPlease wait.`;
  api.sendMessage(msgLoading, threadID, async () => {
    try {
      const apiUrl = `https://api.ferdev.my.id/maker/bratvid?text=${encodeURIComponent(text)}`;
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      const videoPath = path.join(__dirname, "..", "cache", `bratvid-${Date.now()}.mp4`);
      fs.writeFileSync(videoPath, Buffer.from(res.data));

      const caption = `🎬 Here's your Bratz video for: "${text}" ✨`;

      return api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(videoPath)
      }, threadID, () => fs.unlinkSync(videoPath));

    } catch (error) {
      console.error("❌ Error generating Bratz video:", error.message || error);
      return api.sendMessage("❌ Failed to generate Bratz video. Try again later.", threadID, messageID);
    }
  });
};
