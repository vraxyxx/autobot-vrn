const axios = require('axios');

module.exports = {
  config: {
    name: "manga",
    version: "1.0.0",
    role: 0,
    credits: "vern",
    description: "Get random manga.",
    usage: "manga [page]",
    hasPrefix: true,
    commandCategory: "anime",
    cooldowns: 3
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const page = args[0] && !isNaN(args[0]) && Number(args[0]) > 0 ? Number(args[0]) : 1;
    const prefix = global.config.PREFIX || "/"; // dynamic prefix support

    try {
      await api.sendMessage(`📚 Fetching latest manga updates (Page ${page})...`, threadID, messageID);

      const apiUrl = `https://ace-rest-api.onrender.com/api/manga?page=${page}&order=update`;
      const response = await axios.get(apiUrl);

      const mangas = response.data?.result || [];

      if (!Array.isArray(mangas) || mangas.length === 0) {
        return api.sendMessage("⚠️ No manga updates found.", threadID, messageID);
      }

      let msg = `📖 𝗟𝗔𝗧𝗘𝗦𝗧 𝗠𝗔𝗡𝗚𝗔 𝗨𝗣𝗗𝗔𝗧𝗘𝗦 (Page ${page})\n━━━━━━━━━━━━━━━\n`;

      mangas.slice(0, 8).forEach((manga, index) => {
        msg += `#${(page - 1) * 8 + index + 1}\n`;
        msg += `• 📌 Title: ${manga.title || "Unknown"}\n`;
        if (manga.chapter) msg += `• 📚 Chapter: ${manga.chapter}\n`;
        if (manga.updated) msg += `• 🕒 Updated: ${manga.updated}\n`;
        if (manga.url) msg += `• 🔗 Link: ${manga.url}\n`;
        msg += `\n`;
      });

      msg += `➡️ Use "${prefix}manga ${page + 1}" for more.\n\n`;
      msg += `🔗 Powered by Ace API`;

      return api.sendMessage(msg.trim(), threadID, messageID);

    } catch (err) {
      console.error("❌ [MANGA ERROR]:", err.message || err);
      return api.sendMessage(
        `❌ Error fetching manga updates.\n📛 ${err.response?.data?.message || err.message}`,
        threadID,
        messageID
      );
    }
  }
};
