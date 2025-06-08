const axios = require('axios');

module.exports.config = {
  name: "manga",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Get latest manga updates using the Ace API.",
  usage: "/manga [page]",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Anime"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const page = args[0] && !isNaN(args[0]) && Number(args[0]) > 0 ? Number(args[0]) : 1;
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  try {
    // Send loading message first
    const waitMsg = `════『 𝗠𝗔𝗡𝗚𝗔 𝗨𝗣𝗗𝗔𝗧𝗘𝗦 』════\n\n` +
      `🔄 Fetching latest manga updates (Page ${page})...\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Ace Manga API
    const apiUrl = `https://ace-rest-api.onrender.com/api/manga?page=${page}&order=update`;
    const response = await axios.get(apiUrl);

    // Try to parse the data
    const mangas = response.data?.result || response.data?.manga || response.data;

    let resultMsg = `════『 𝗠𝗔𝗡𝗚𝗔 𝗨𝗣𝗗𝗔𝗧𝗘𝗦 』════\n\n`;

    if (Array.isArray(mangas) && mangas.length > 0) {
      mangas.slice(0, 8).forEach((manga, idx) => {
        resultMsg += `#${(page-1)*8+idx+1}\n`;
        if (manga.title) resultMsg += `• Title: ${manga.title}\n`;
        if (manga.chapter) resultMsg += `• Chapter: ${manga.chapter}\n`;
        if (manga.updated) resultMsg += `• Updated: ${manga.updated}\n`;
        if (manga.url) resultMsg += `• URL: ${manga.url}\n`;
        resultMsg += `\n`;
      });
      resultMsg += `Page: ${page}\nUse "${prefix}manga ${page+1}" for next page.`;
    } else {
      resultMsg += "⚠️ No manga updates found.";
    }

    resultMsg += `\n> Powered by Ace Manga API`;

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in manga command:', error.message || error);

    const errorMessage = `════『 𝗠𝗔𝗡𝗚𝗔 𝗨𝗣𝗗𝗔𝗧𝗘𝗦 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch manga updates.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};