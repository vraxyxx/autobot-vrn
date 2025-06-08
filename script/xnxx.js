const axios = require('axios');

module.exports.config = {
  name: "xnxx",
  version: "1.0.0",
  role: 2, // 2 = Admin only
  credits: "vern",
  description: "Download videos from XNXX using the Ferdev API. (Admin only!)",
  usage: "/xnxx <xnxx_video_url>",
  prefix: true,
  cooldowns: 10,
  commandCategory: "Downloader"
};

module.exports.run = async function ({ api, event, args, permssion }) {
  const { threadID, messageID, senderID } = event;
  const prefix = "/"; // Adjust if your bot uses a different prefix

  // Admin check (strong enforcement)
  if (permssion < 2) {
    return api.sendMessage(
      "❌ This command is restricted to group admins only.",
      threadID,
      messageID
    );
  }

  const url = args.join(" ").trim();

  if (!url || !url.startsWith("http")) {
    const usageMessage = `════『 𝗫𝗡𝗫𝗫 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 』════\n\n` +
      `⚠️ Please provide a valid XNXX video URL.\n\n` +
      `📌 Usage: ${prefix}xnxx <xnxx_video_url>\n` +
      `💬 Example: ${prefix}xnxx https://www.xnxx.com/video-xxxxxx/title_of_video\n\n` +
      `> Thank you for using XNXX Downloader!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Inform user that the download is in progress
    await api.sendMessage("🔄 Downloading XNXX video, please wait...", threadID, messageID);

    // Call the Ferdev XNXX Downloader API
    const apiUrl = `https://api.ferdev.my.id/downloader/xnxx?link=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    const data = response.data?.result || response.data;
    if (!data || !data.url) {
      return api.sendMessage(
        `⚠️ Couldn't fetch the video. Please ensure the URL is correct and try again.`, threadID, messageID
      );
    }

    // Download the video as a stream
    const videoStream = await axios.get(data.url, { responseType: 'stream' });

    return api.sendMessage({
      body: `════『 𝗫𝗡𝗫𝗫 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 』════\n\nHere is your XNXX video!\n\n> Powered by Ferdev XNXX Downloader API`,
      attachment: videoStream.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in xnxx command:', error.message || error);

    const errorMessage = `════『 𝗫𝗡𝗫𝗫 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to download XNXX video.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};