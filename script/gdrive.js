const axios = require('axios');

module.exports.config = {
  name: "gdrive",
  version: "1.0.1",
  role: 0,
  credits: "vern",
  description: "Get direct download link from a Google Drive link or image reply.",
  usage: "Reply to GDrive link or image, then type gdrive",
  prefix: true,
  cooldowns: 3,
  commandCategory: "utility"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  // Check if user replied to a message
  if (!messageReply) {
    return api.sendMessage("❌ | Please reply to a Google Drive link or image containing the link.", threadID, messageID);
  }

  // Try to extract URL from replied message
  let url = null;

  // From text
  if (messageReply.body && messageReply.body.includes("drive.google.com")) {
    url = messageReply.body.trim();
  }

  // From image caption or alt
  if (!url && messageReply.attachments && messageReply.attachments.length > 0) {
    const imgAttachment = messageReply.attachments.find(att => att.type === "photo");
    if (imgAttachment?.url && imgAttachment.url.includes("drive.google.com")) {
      url = imgAttachment.url;
    }
  }

  if (!url) {
    return api.sendMessage("❌ | No valid Google Drive link found in the reply. Please try again.", threadID, messageID);
  }

  // Send loading message
  await api.sendMessage("⏳ | Fetching Google Drive direct link...", threadID, messageID);

  try {
    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/gdrive?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗚𝗢𝗢𝗚𝗟𝗘 𝗗𝗥𝗜𝗩𝗘 』════\n\n`;

    if (response.data?.result) {
      resultMsg += `✅ | Direct Download Link:\n${response.data.result}`;
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else {
      resultMsg += "⚠️ | No direct link returned by API.";
    }

    resultMsg += `\n\n> Powered by Jonell01 GDrive API`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in gdrive command:", error);
    return api.sendMessage(
      `❌ | Failed to generate download link.\nReason: ${error.response?.data?.message || error.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};
