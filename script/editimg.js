const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "editimg",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["filterimg", "effectimg"],
  description: "Apply filter/effect to a replied image using Haji-Mix API",
  usage: "reply to an image with: editimg [effect] [brightness]",
  credits: "Vern",
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { messageReply, threadID, messageID, senderID } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("❌ Please reply to an image to apply an effect.", threadID, messageID);
  }

  const imageUrl = messageReply.attachments[0].url;
  const effect = args[0]?.toLowerCase() || "grayscale";
  const brightness = parseFloat(args[1]) || 1.0;

  const apiUrl = `https://haji-mix.up.railway.app/api/editimg?url=${encodeURIComponent(imageUrl)}&effect=${effect}&brightness=${brightness}&crop_x=0&crop_y=0&crop_width=0&crop_height=0&api_key=f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0`;

  api.sendMessage(`🎨 𝗔𝗣𝗣𝗟𝗬𝗜𝗡𝗚 𝗘𝗙𝗙𝗘𝗖𝗧: ${effect.toUpperCase()} (Brightness: ${brightness})...\nPlease wait...`, threadID, async (err, info) => {
    if (err) return;

    try {
      const response = await axios.get(apiUrl);
      const resultUrl = response.data?.result;

      if (!resultUrl) {
        return api.editMessage("❌ No image returned from API.", info.messageID);
      }

      const filePath = path.join(__dirname, "cache", `edited_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(filePath);

      const imageStream = await axios({
        url: resultUrl,
        method: "GET",
        responseType: "stream"
      });

      imageStream.data.pipe(writer);

      writer.on("finish", () => {
        api.getUserInfo(senderID, (e, u) => {
          const name = u?.[senderID]?.name || "Unknown";
          const time = new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });

          api.sendMessage({
            body: `✅ 𝗘𝗙𝗙𝗘𝗖𝗧 𝗔𝗣𝗣𝗟𝗜𝗘𝗗\n━━━━━━━━━━━━━━━\n🖼️ Effect: ${effect}\n💡 Brightness: ${brightness}\n📤 Requested by: ${name}\n🕰️ Time: ${time}`,
            attachment: fs.createReadStream(filePath)
          }, threadID, () => fs.unlinkSync(filePath), messageID);
        });
      });

      writer.on("error", () => {
        api.editMessage("❌ Failed to save the image.", info.messageID);
      });
    } catch (error) {
      console.error("[editimg] Error:", error.message);
      api.editMessage("❌ Failed to apply the effect. Please try again later.", info.messageID);
    }
  });
};
