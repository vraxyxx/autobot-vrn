const axios = require("axios");

module.exports.config = {
  name: "gdrive",
  version: "1.0",
  role: 0,
  author: "Jonell01",
  credits: "Jonell01",
  aliases: ["driveinfo", "gdrivedl"],
  countDown: 5,
  longDescription: "Extract Google Drive file information or direct download link.",
  category: "tools",
  usages: "< reply to Google Drive link >",
  cooldown: 5
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;

  // Validate reply and URL
  if (
    !messageReply ||
    !messageReply.body ||
    !messageReply.body.includes("drive.google.com")
  ) {
    return api.sendMessage("❌ Please reply to a valid Google Drive link.", threadID, messageID);
  }

  const driveUrl = encodeURIComponent(messageReply.body.trim());
  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/gdrive?url=${driveUrl}`;

  try {
    api.sendMessage("🔍 Fetching Google Drive file info...", threadID, messageID);

    const res = await axios.get(apiUrl);
    const data = res.data;

    if (data.error) {
      return api.sendMessage(`❌ Error: ${data.error}`, threadID, messageID);
    }

    let replyMsg = `📂 Google Drive File Info:\n`;
    if (data.name) replyMsg += `📄 Name: ${data.name}\n`;
    if (data.size) replyMsg += `📦 Size: ${data.size}\n`;
    if (data.mimeType) replyMsg += `📁 Type: ${data.mimeType}\n`;
    if (data.downloadUrl) replyMsg += `🔗 Direct Link: ${data.downloadUrl}`;

    return api.sendMessage(replyMsg, threadID, messageID);
  } catch (err) {
    console.error("gdrive error:", err.message);
    return api.sendMessage("❌ Failed to fetch Drive file info. Please check the link or try again later.", threadID, messageID);
  }
};