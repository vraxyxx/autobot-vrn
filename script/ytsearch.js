const axios = require("axios");

module.exports.config = {
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
};

module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage("🔍 Please provide a search query.\n\nExample: ytsearch night changes", threadID, messageID);
  }

  api.sendMessage(`🔎 Searching YouTube for: "${query}"...`, threadID, async (err, info) => {
    if (err) return;

    try {
      const res = await axios.get(`https://urangkapolka.vercel.app/api/ytsearch?query=${encodeURIComponent(query)}`);
      const results = res.data?.data;

      if (!Array.isArray(results) || results.length === 0) {
        return api.editMessage("❌ No results found.", info.messageID);
      }

      const list = results.slice(0, 5).map((video, i) => {
        return `🎬 ${i + 1}. ${video.title}\n📺 Views: ${video.views}\n⏱ Duration: ${video.duration}\n🔗 ${video.url}\n`;
      }).join("\n");

      api.getUserInfo(senderID, (err, userInfo) => {
        const userName = userInfo?.[senderID]?.name || "User";
        const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });

        const msg = `🔍 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗦𝗘𝗔𝗥𝗖𝗛\n━━━━━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━━━━━\n🔎 𝗤𝘂𝗲𝗿𝘆: ${query}\n👤 𝗨𝘀𝗲𝗿: ${userName}\n🕒 𝗧𝗶𝗺𝗲: ${timestamp}`;

        return api.editMessage(msg, info.messageID);
      });

    } catch (e) {
      console.error("[ytsearch.js] Error:", e.message || e);
      return api.editMessage("⚠️ Error fetching results. Please try again later.", info.messageID);
    }
  });
};
