const axios = require("axios");

module.exports.config = {
  name: "ytsearch",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["yts", "ytfind"],
  description: "Search YouTube videos by keyword.",
  usage: "ytsearch <query>",
  credits: "Vern",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!query) {
    return api.sendMessage("❌ Please provide a YouTube search keyword.\n\nExample: ytsearch night changes", threadID, messageID);
  }

  api.sendMessage("🔎 Searching YouTube for videos...", threadID, async (err, info) => {
    if (err) return;

    try {
      const res = await axios.get(`https://urangkapolka.vercel.app/api/ytsearch?query=${encodeURIComponent(query)}`);
      const results = res.data?.data;

      if (!Array.isArray(results) || results.length === 0) {
        return api.editMessage("❌ No results found for that keyword.", info.messageID);
      }

      let msg = `🎬 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗥𝗘𝗦𝗨𝗟𝗧𝗦\n━━━━━━━━━━━━━━━━━━\n`;
      results.slice(0, 5).forEach((vid, i) => {
        msg += `${i + 1}. 🎵 ${vid.title}\n⏱ ${vid.duration} | 👁️ ${vid.views}\n🔗 ${vid.url}\n\n`;
      });

      // Optional: Get user's name
      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

        const replyMessage = `${msg.trim()}━━━━━━━━━━━━━━━━━━\n🔍 𝗤𝘂𝗲𝗿𝘆: ${query}\n👤 𝗨𝘀𝗲𝗿: ${userName}\n🕒 𝗧𝗶𝗺𝗲: ${timePH}`;
        api.editMessage(replyMessage, info.messageID);
      });

    } catch (error) {
      console.error("[ytsearch.js] Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Failed to search.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};
