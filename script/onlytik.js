const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "onlytik",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  credits: "Vern",
  description: "Fetch a random TikTok video.",
  usage: "/onlytik",
  prefix: true,
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Inform the user that the video is loading
    const waitMsg = `════『 𝗢𝗡𝗟𝗬𝗧𝗜𝗞 』════\n\n📽️ Fetching a TikTok video...\nPlease wait...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Request the TikTok video
    const apiUrl = `https://haji-mix.up.railway.app/api/onlytik?stream=true&api_key=f810244328efffe65edb02e899789cdc1b5303156dd950a644a6f2637ce564f0`;
    const response = await axios.get(apiUrl);

    const videoUrl = response?.data?.url;

    if (!videoUrl) {
      return api.sendMessage(`❌ No video found. Please try again.`, threadID, messageID);
    }

    // Send video as attachment
    await api.sendMessage({
      attachment: await global.utils.getStreamFromURL(videoUrl)
    }, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in onlytik command:", error.message || error);

    const errorMsg = `════『 𝗢𝗡𝗟𝗬𝗧𝗜𝗞 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch TikTok video.\nReason: ${error.message || "Unknown error"}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMsg, threadID, messageID);
  }
};