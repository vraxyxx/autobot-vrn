const axios = require("axios");

module.exports = {
  config: {
    name: "quiz",
    version: "1.0.0",
    aliases: ["trivia", "question"],
    description: "Get a random quiz question",
    usage: "quiz",
    commandCategory: "fun",
    role: 0,
    hasPrefix: true,
    credits: "Vern",
    cooldown: 3
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      const res = await axios.get("https://rapido.zetsu.xyz/api/quiz");
      const { question, options, correct_answer } = res.data;

      const formattedOptions = options.map((opt, i) => `${i + 1}. ${opt}`).join("\n");

      return api.sendMessage(
        `🧠 𝗤𝗨𝗜𝗭 𝗧𝗜𝗠𝗘\n\n❓ Question: ${question}\n\n${formattedOptions}\n\n✅ Answer: ${correct_answer}`,
        threadID,
        messageID
      );
    } catch (err) {
      console.error("[quiz.js] API Error:", err.message);
      return api.sendMessage("❌ Failed to fetch quiz question. Please try again later.", threadID, messageID);
    }
  }
};
