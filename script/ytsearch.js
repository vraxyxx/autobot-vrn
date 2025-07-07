const axios = require("axios");

module.exports = {
  config: {
    name: "ytsearch",
    version: "1.0.0",
    aliases: ["yts", "ytfind"],
    description: "Search YouTube videos by keyword.",
    usage: "ytsearch <query>",
    commandCategory: "media",
    role: 0,
    hasPrefix: true,
    credits: "Vern",
    cooldown: 3
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("🔍 Please provide a YouTube search query.\n\nExample: ytsearch night changes", threadID, messageID);
    }

    api.sendMessage(`🔎 Searching YouTube for: "${query}"...`, threadID, async (err, info) => {
      if (err) return;

      try {
        const res = await axios.get(`https://urangkapolka.vercel.app/api/ytsearch?query=${encodeURIComponent(query)}`);
        const results = res.data?.data;

        if (!Array.isArray(results) || results.length === 0) {
          return api.editMessage("❌ No results found for your query.", info.messageID);
        }

        let text = `🎬 𝗧𝗢𝗣 𝗬𝗧 𝗥𝗘𝗦𝗨𝗟𝗧𝗦\n\n`;

        results.slice(0, 5).forEach((item, i) => {
          text += `${i + 1}. 📺 ${item.title}\n🔗 ${item.url}\n⏱ Duration: ${item.duration} | 👁️ ${item.views}\n\n`;
        });

        api.getUserInfo(senderID, (err, userInfo) => {
          const userName = userInfo?.[senderID]?.name || "Unknown User";
          const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

          text += `━━━━━━━━━━━━━━━━━━\n🔎 Query: ${query}\n👤 User: ${userName}\n🕒 Time: ${timestamp}`;

          return api.editMessage(text.trim(), info.messageID);
        });

      } catch (e) {
        console.error("[ytsearch] API Error:", e.message || e);
        return api.editMessage("🚫 Failed to fetch YouTube results. Please try again later.", info.messageID);
      }
    });
  }
};
