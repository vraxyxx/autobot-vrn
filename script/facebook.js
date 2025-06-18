const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "facebook",
  version: "1.0.0",
  role: 0,
  credits: "vraxyxx",
  description: "Download Facebook videos using the Ferdev API.",
  usage: "/facebook <facebook video link>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Downloader"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args.join(' ').trim();
  const prefix = "/"; // Adjust if your bot uses a different prefix

  // No link provided
  if (!link) {
    const usageMessage = `════『 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 』════\n\n` +
      `⚠️ Please provide a Facebook video link to download.\n\n` +
      `📌 Usage: ${prefix}facebook <facebook video link>\n` +
      `💬 Example: ${prefix}facebook https://www.facebook.com/share/r/1Kk3ti7tk5/\n\n` +
      `> Thank you for using Facebook Downloader!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 』════\n\n` +
      `🔗 Downloading Facebook video from: "${link}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Facebook Downloader API
    const apiUrl = "https://api.ferdev.my.id/downloader/facebook";
    const response = await axios.get(apiUrl, {
      params: { link: link }
    });

    const result = response.data?.result;
    if (!result || !result.url) {
      return api.sendMessage("❌ Failed to get download link from the API. The video may be private or unavailable.", threadID, messageID);
    }

    // Download the video to a temp file
    const videoUrl = result.url;
    const tempPath = __dirname + `/cache/facebook_${Date.now()}.mp4`;
    const videoResponse = await axios.get(videoUrl, { responseType: "arraybuffer" });
    await fs.outputFile(tempPath, Buffer.from(videoResponse.data, "binary"));

    // Send the video file
    await api.sendMessage(
      {
        body: "✅ Here is your Facebook video!",
        attachment: fs.createReadStream(tempPath)
      },
      threadID,
      async () => {
        // Delete temp file after sending
        await fs.remove(tempPath);
      },
      messageID
    );
  } catch (error) {
    console.error('❌ Error in facebook command:', error.message || error);

    const errorMessage = `════『 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to download Facebook video.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};