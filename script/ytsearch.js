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

    try {
      const res = await axios.get(`https://urangkapolka.vercel.app/api/ytsearch?query=${encodeURIComponent(query)}`);
      const results = res.data?.data;

      if (!Array.isArray(results) || results.length === 0) {
        return api.sendMessage("❌ No results found for your query.", threadID, messageID);
      }

      let text = `🎬 𝗧𝗢𝗣 𝗬𝗧 𝗥𝗘𝗦𝗨𝗟𝗧𝗦\n\n`;

      results.slice(0, 5).forEach((item, i) => {
        text += `${i + 1}. 📺 ${item.title}\n🔗 ${item.url}\n⏱ Duration: ${item.duration} | 👁️ ${item.views}\n\n`;
      });

      api.getUserInfo(senderID, (err, info) => {
        const userName = info?.[senderID]?.name || "Unknown User";
        const timePH = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

        text += `━━━━━━━━━━━━━━━━━━\n🔎 𝗤𝘂𝗲𝗿𝘆: ${query}\n👤 𝗨𝘀𝗲𝗿: ${userName}\n🕒 𝗧𝗶𝗺𝗲: ${timePH}`;
        return api.sendMessage(text.trim(), threadID, messageID);
      });

    } catch (err) {
      console.error("[ytsearch.js] API Error:", err.message || err);
      return api.sendMessage("🚫 Failed to fetch YouTube results. Please try again later.", threadID, messageID);
    }
  }
};
