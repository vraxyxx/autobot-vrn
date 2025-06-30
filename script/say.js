const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "say",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["sabihin-mo"],
  description: "Convert text to speech",
  usage: "say [text]",
  credits: "Vern",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  const query = args.join(" ").trim();

  if (!query) {
    return api.sendMessage(
      "⚠️ Please provide text to convert to speech.\n\nUsage: say [text]",
      threadID,
      messageID
    );
  }

  const ttsUrl = `https://apis-rho-nine.vercel.app/tts?text=${encodeURIComponent(query)}`;
  const audioPath = path.join(__dirname, "cache", `tts_${senderID}.mp3`);

  try {
    await api.sendMessage(`🗣️ Saying: "${query}"`, threadID, messageID);

    const res = await axios.get(ttsUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(audioPath, res.data);

    api.sendMessage(
      {
        attachment: fs.createReadStream(audioPath)
      },
      threadID,
      () => fs.unlinkSync(audioPath)
    );
  } catch (error) {
    console.error("❌ TTS error:", error.message);
    return api.sendMessage(
      `⚠️ Could not generate speech audio.\nError: ${error.message}`,
      threadID,
      messageID
    );
  }
};