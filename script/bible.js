const axios = require("axios");

module.exports.config = {
  name: "bible",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Vern",
  description: "Get a random Bible verse.",
  commandCategory: "religious",
  usages: "bible",
  cooldowns: 5,
  role: 0,
  hasPrefix: true
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    const res = await axios.get("https://kaiz-apis.gleeze.com/api/bible?apikey=0ff49fce-1537-4798-9d90-69db487be671");

    const verseData = res.data?.verse?.[0];
    const reference = res.data?.reference || "Unknown Reference";

    if (!verseData || !verseData.text) {
      return api.sendMessage("❌ Couldn't fetch a Bible verse at the moment. Please try again later.", threadID, messageID);
    }

    const msg = `📖 𝗕𝗜𝗕𝗟𝗘 𝗩𝗘𝗥𝗦𝗘\n\n"${verseData.text.trim()}"\n\n— 📌 ${reference}`;
    return api.sendMessage(msg, threadID, messageID);

  } catch (err) {
    console.error("📛 [bible.js] API Error:", err.message || err);
    return api.sendMessage("🚫 Error: Unable to connect to Bible API. Try again later.", threadID, messageID);
  }
};
