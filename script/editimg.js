const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "editimg",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["filterimg", "effectimg"],
  description: "Apply image effects like grayscale, brightness, etc.",
  usage: "reply to an image with: editimg [effect] [brightness]",
  credits: "Vern",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { messageReply, threadID, messageID } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("❌ Please reply to an image to apply effects.", threadID, messageID);
  }

  const imageUrl = messageReply.attachments[0].url;
  const effect = args[0]?.toLowerCase() || "grayscale";
  const brightness = parseFloat(args[1]) || 1.0;

  const apiUrl = `https://haji-mix.up.railway.app/api/editimg?url=${encodeURIComponent(imageUrl)}&effect=${effect}&brightness=${brightness}&crop_x=0&crop_y=0&crop_width=0&crop_height=0&api_key=f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0`;

  api.sendMessage(`🛠️ Applying **${effect}** effect to your image...`, threadID, messageID);

  try {
    const response = await axios.get(apiUrl);
    const resultUrl = response.data?.result;

    if (!resultUrl) {
      return api.sendMessage("❌ No image returned from API.", threadID, messageID);
    }

    const filePath = path.join(__dirname, "cache", `effect_${Date.now()}.jpg`);
    const writer = fs.createWriteStream(filePath);

    const imageStream = await axios({
      url: resultUrl,
      method: "GET",
      responseType: "stream"
    });

    imageStream.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `✅ Done! Effect: ${effect} | Brightness: ${brightness}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", (err) => {
      console.error("[editimg] Write error:", err);
      api.sendMessage("❌ Failed to save edited image.", threadID, messageID);
    });
  } catch (error) {
    console.error("[editimg] API Error:", error.message || error.response?.data);
    return api.sendMessage("🚫 Error while applying image effect. Please try again later.", threadID, messageID);
  }
};
