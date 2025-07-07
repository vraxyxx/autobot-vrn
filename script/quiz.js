const axios = require("axios");

module.exports.config = {
  name: 'quiz',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['trivia', 'question'],
  description: "Get a random quiz question",
  usage: "quiz",
  credits: 'Vern',
  cooldown: 3
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  api.sendMessage("🧠 Fetching a random quiz question for you...", threadID, async (err, info) => {
    if (err) return;

    try {
      const res = await axios.get("https://rapido.zetsu.xyz/api/quiz");
      const { question, options, correct_answer } = res.data;

      if (!question || !Array.isArray(options) || options.length === 0 || !correct_answer) {
        return api.editMessage("⚠️ Invalid quiz data received from the API.", info.messageID);
      }

      const formattedOptions = options.map((opt, index) => `${index + 1}. ${opt}`).join("\n");
      const timePH = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";

        const reply = `🧠 𝗤𝗨𝗜𝗭 𝗧𝗜𝗠𝗘
━━━━━━━━━━━━━━━━━━
❓ Question: ${question}

${formattedOptions}

✅ Correct Answer: ${correct_answer}
━━━━━━━━━━━━━━━━━━
👤 Requested by: ${userName}
🕰 Time: ${timePH}`;

        api.editMessage(reply, info.messageID);
      });

    } catch (error) {
      console.error("[quiz] API Error:", error.message || error);
      api.editMessage("❌ Failed to fetch quiz. Try again later.", info.messageID);
    }
  });
};
