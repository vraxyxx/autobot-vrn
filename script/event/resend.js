const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "resend",
  version: "1.0.0",
  credits: "Vern",
  description: "Auto resend deleted messages or media",
};

const msgData = {};

module.exports.handleEvent = async function ({ api, event }) {
  const { messageID, senderID, type, threadID, body, attachments } = event;

  if (type === "message") {
    msgData[messageID] = {
      body: body || "📌 [No Text]",
      attachments
    };
  }

  if (type === "message_unsend" && msgData.hasOwnProperty(messageID)) {
    try {
      const info = await api.getUserInfo(senderID);
      const name = info[senderID]?.name || "Unknown User";

      const cachePath = path.join(__dirname, "..", "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

      const savedMsg = msgData[messageID];

      // 📝 TEXT ONLY
      if (!savedMsg.attachments || savedMsg.attachments.length === 0) {
        return api.sendMessage(`${name} unsent a message:\n\n🗒️ ${savedMsg.body}`, threadID);
      }

      // 🖼️ PHOTO(S)
      if (savedMsg.attachments[0].type === "photo") {
        const photos = [];
        const toDelete = [];

        for (const item of savedMsg.attachments) {
          const imgRes = await axios.get(item.url, { responseType: "arraybuffer" });
          const imgPath = path.join(cachePath, `${item.filename}.jpg`);
          fs.writeFileSync(imgPath, imgRes.data);
          photos.push(fs.createReadStream(imgPath));
          toDelete.push(imgPath);
        }

        return api.sendMessage({
          body: `${name} unsent this photo:\n📝 ${savedMsg.body}`,
          attachment: photos
        }, threadID, () => {
          for (const file of toDelete) fs.unlinkSync(file);
        });
      }

      // 🔊 AUDIO/VOICE
      if (savedMsg.attachments[0].type === "audio") {
        const audioUrl = savedMsg.attachments[0].url;
        const audioPath = path.join(cachePath, `audio_${senderID}.mp3`);
        const audioRes = await axios.get(audioUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(audioPath, audioRes.data);

        return api.sendMessage({
          body: `${name} deleted a voice message:\n📝 ${savedMsg.body}`,
          attachment: fs.createReadStream(audioPath)
        }, threadID, () => fs.unlinkSync(audioPath));
      }

      // 🎞️ ANIMATED IMAGE (GIF)
      if (savedMsg.attachments[0].type === "animated_image") {
        const gifUrl = savedMsg.attachments[0].previewUrl;
        const gifPath = path.join(cachePath, `gif_${senderID}.gif`);
        const gifRes = await axios.get(gifUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(gifPath, gifRes.data);

        return api.sendMessage({
          body: `${name} tried to hide this GIF:\n📝 ${savedMsg.body}`,
          attachment: fs.createReadStream(gifPath)
        }, threadID, () => fs.unlinkSync(gifPath));
      }

      // 📎 OTHER TYPES
      return api.sendMessage(`${name} unsent a message, but type not supported.`, threadID);

    } catch (err) {
      console.error("❌ Resend error:", err.message || err);
    }
  }
};
