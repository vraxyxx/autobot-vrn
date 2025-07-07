const axios = require("axios");

module.exports.config = {
  name: 'quote',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['inspire', 'motivate'],
  description: "Get a random inspirational quote.",
  usage: "quote",
  credits: 'Vern',
  cooldown: 3
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  api.sendMessage("💭 Fetching an inspirational quote for you...", threadID, async (err, info) => {
    if (err) return;

    try {
      const res = await axios.get("https://rapido.zetsu.xyz/api/quote");
      const { quote, author } = res.data;

      if (!quote || !author) {
        return api.editMessage("⚠️ No quote data received.", info.messageID);
      }

      const timePH = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";

        const reply = `💬 𝗤𝗨𝗢𝗧𝗘 𝗢𝗙 𝗧𝗛𝗘 𝗗𝗔𝗬
━━━━━━━━━━━━━━━━━━
"${quote}"
— ${author}
━━━━━━━━━━━━━━━━━━
👤 Requested by: ${userName}
🕰 Time: ${timePH}`;

        api.editMessage(reply, info.messageID);
      });

    } catch (error) {
      console.error("[quote.js] API Error:", error.message || error);
      api.editMessage("❌ Couldn't fetch a quote at the moment. Please try again later.", info.messageID);
    }
  });
};
