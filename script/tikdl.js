const axios = require('axios');

module.exports.config = {
  name: "tikdl",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Download TikTok videos using the Ace API.",
  usage: "/tikdl <tiktok_video_url>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Downloader"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if your bot uses a different prefix

  const url = args.join(" ").trim();

  if (!url || !url.startsWith("http")) {
    const usageMessage = `════『 𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 』════\n\n` +
      `⚠️ Please provide a valid TikTok video URL.\n\n` +
      `📌 Usage: ${prefix}tikdl <tiktok_video_url>\n` +
      `💬 Example: ${prefix}tikdl https://www.tiktok.com/@username/video/1234567890\n\n` +
      `> Thank you for using TikTok Downloader!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Inform user that the download is in progress
    await api.sendMessage("🔄 Downloading TikTok video, please wait...", threadID, messageID);

    // Call the Ace TikTok Downloader API
    const apiUrl = `https://ace-rest-api.onrender.com/api/tikdl?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    const data = response.data?.result || response.data;
    if (!data || !data.video) {
      return api.sendMessage(
        `⚠️ Couldn't fetch the video. Please ensure the URL is correct and try again.`, threadID, messageID
      );
    }

    // Download the video as a stream
    const videoStream = await axios.get(data.video, { responseType: 'stream' });

    return api.sendMessage({
      body: `════『 𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 』════\n\nHere is your TikTok video!\n\n> Powered by Ace TikTok Downloader API`,
      attachment: videoStream.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in tikdl command:', error.message || error);

    const errorMessage = `════『 𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to download TikTok video.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};