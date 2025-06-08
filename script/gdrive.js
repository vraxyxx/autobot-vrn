const axios = require('axios');

module.exports.config = {
  name: "gdrive",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get Google Drive direct download links using the Jonell01 GDrive API.",
  usage: "/gdrive <google_drive_url>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if your bot uses a different prefix

  if (args.length < 1) {
    const usageMessage = `════『 𝗚𝗢𝗢𝗚𝗟𝗘 𝗗𝗥𝗜𝗩𝗘 』════\n\n` +
      `⚠️ Please provide a Google Drive URL.\n\n` +
      `📌 Usage: ${prefix}gdrive <google_drive_url>\n` +
      `💬 Example: ${prefix}gdrive https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I/view?usp=sharing\n\n` +
      `> Powered by Jonell01 GDrive API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const url = args[0];

  try {
    // Loading message
    const waitMsg = `════『 𝗚𝗢𝗢𝗚𝗟𝗘 𝗗𝗥𝗜𝗩𝗘 』════\n\n🔗 Fetching direct download link...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the GDrive API
    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/gdrive?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗚𝗢𝗢𝗚𝗟𝗘 𝗗𝗥𝗜𝗩𝗘 』════\n\n`;

    if (response.data && response.data.result) {
      resultMsg += `Here is your Google Drive direct download link:\n${response.data.result}`;
    } else if (typeof response.data === "string") {
      resultMsg += response.data;
    } else {
      resultMsg += "⚠️ No direct link received from the GDrive API.";
    }

    resultMsg += `\n\n> Powered by Jonell01 GDrive API`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in gdrive command:', error.message || error);

    const errorMessage = `════『 𝗚𝗢𝗢𝗚𝗟𝗘 𝗗𝗥𝗜𝗩𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to process your request.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};