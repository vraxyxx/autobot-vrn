const axios = require("axios");

module.exports.config = {
  name: "tiksearch",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["tiktoksearch", "ttsearch"],
  description: "Search TikTok videos by keyword",
  usage: "tiksearch <keyword>",
  credits: "Vern",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const keyword = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!keyword) {
    return api.sendMessage("❌ Please provide a search keyword.\n\nExample: tiksearch multo", threadID, messageID);
  }

  api.sendMessage(`🔍 Searching TikTok for "${keyword}"...`, threadID, async (err, info) => {
    if (err) return;

    try {
      const apikey = "4fe7e522-70b7-420b-a746-d7a23db49ee5";
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/tiksearch?search=${encodeURIComponent(keyword)}&apikey=${apikey}`);
      const videoList = response.data?.data?.videos;

      if (!videoList || videoList.length === 0) {
        return api.editMessage("⚠️ No TikTok videos found for that keyword.", info.messageID);
      }

      const first = videoList[0]; // show top result

      const message = 
        `🎵 𝗧𝗜𝗞𝗧𝗢𝗞 𝗦𝗘𝗔𝗥𝗖𝗛\n━━━━━━━━━━━━━━━━━━\n` +
        `📌 Title: ${first.title}\n` +
        `👤 Author: ${first.author?.nickname || "Unknown"} (@${first.author?.unique_id})\n` +
        `⏱ Duration: ${first.duration} seconds\n` +
        `▶️ Views: ${first.play_count?.toLocaleString()}\n` +
        `💬 Comments: ${first.comment_count?.toLocaleString()}\n` +
        `❤️ Likes: ${first.digg_count?.toLocaleString()}\n` +
        `📤 Shares: ${first.share_count?.toLocaleString()}\n` +
        `🔗 Link: ${first.play}\n` +
        `\n🎶 Music: ${first.music_info?.title || "Unknown"} by ${first.music_info?.author || "?"}\n━━━━━━━━━━━━━━━━━━`;

      api.getUserInfo(senderID, (err, userInfo) => {
        const userName = userInfo?.[senderID]?.name || "Unknown User";
        const timePH = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
        const fullMessage = `${message}\n🔍 Searched by: ${userName}\n🕒 ${timePH}`;

        api.editMessage(fullMessage, info.messageID);
      });

    } catch (err) {
      console.error("[tiksearch.js] Error:", err);
      const errMsg = "❌ Error: " + (err.response?.data?.message || err.message || "Unknown error");
      api.editMessage(errMsg, info.messageID);
    }
  });
};
