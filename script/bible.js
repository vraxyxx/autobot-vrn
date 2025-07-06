// modules/commands/bible.js

const axios = require("axios");

module.exports.config = {
  name: "bible",
  version: "1.0.0",
  credits: "Vern",
  description: "Get a random Bible verse.",
  commandCategory: "religion",
  usages: "bible",
  cooldowns: 5,
  role: 0,
  hasPrefix: true,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    const res = await axios.get("https://kaiz-apis.gleeze.com/api/bible?apikey=0ff49fce-1537-4798-9d90-69db487be671");

    const verse = res.data.verse?.[0];
    if (!verse) {
      return api.sendMessage("⚠️ Unable to fetch Bible verse at the moment.", threadID, messageID);
    }

    const message = 
`📖 𝗕𝗜𝗕𝗟𝗘 𝗩𝗘𝗥𝗦𝗘 𝗢𝗙 𝗧𝗛𝗘 𝗗𝗔𝗬

• 🕊️ Book: ${verse.book_name}
• 📖 Reference: ${res.data.reference}
• ✨ Verse: ${verse.text.trim()}

— ${res.data.author}`;

    return api.sendMessage(message, threadID, messageID);
  } catch (error) {
    console.error("[bible.js] API Error:", error.response?.data || error.message);
    return api.sendMessage("❌ An error occurred while fetching the verse. Please try again later.", threadID, messageID);
  }
};
