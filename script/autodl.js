const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "autodl",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Download video/media from a URL using Haji Mix API.",
  usage: "/autodl <url>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const userUrl = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No URL provided
  if (!userUrl) {
    const usageMessage = `════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n` +
      `⚠️ Please provide a URL to download media from.\n\n` +
      `📌 Usage: ${prefix}autodl <url>\n` +
      `💬 Example: ${prefix}autodl https://www.facebook.com/share/v/19Cm5JLfPU/\n\n` +
      `> Thank you for using AutoDL!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n` +
      `⏬ Downloading media from: ${userUrl}\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Haji Mix AutoDL API
    const apiUrl = "https://haji-mix.up.railway.app/api/autodl";
    const response = await axios.get(apiUrl, {
      params: {
        url: userUrl,
        stream: true
      }
    });

    // The API should return a direct download link or file URL in result, url, or link
    let mediaUrl = "";
    if (response.data) {
      if (typeof response.data === "string" && response.data.startsWith("http")) {
        mediaUrl = response.data;
      } else if (response.data.url) {
        mediaUrl = response.data.url;
      } else if (response.data.result) {
        mediaUrl = response.data.result;
      } else if (response.data.link) {
        mediaUrl = response.data.link;
      }
    }

    if (!mediaUrl) {
      return api.sendMessage(
        `⚠️ Unable to fetch download link for this URL.`, threadID, messageID
      );
    }

    // Download the media file as a stream
    const tempPath = path.join(__dirname, `temp_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(tempPath);

    const mediaRes = await axios.get(mediaUrl, { responseType: "stream" });
    mediaRes.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Send the video as an attachment
    await api.sendMessage({
      body: `════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\nHere's your downloaded media!`,
      attachment: fs.createReadStream(tempPath)
    }, threadID, messageID);

    // Remove the temp file after sending
    fs.unlink(tempPath, () => {});

  } catch (error) {
    console.error('❌ Error in autodl command:', error.message || error);

    const errorMessage = `════『 𝗔𝗨𝗧𝗢𝗗𝗟 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to download media.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};