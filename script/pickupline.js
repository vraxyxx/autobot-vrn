// modules/commands/pickupline.js

const axios = require("axios");

module.exports.config = {
  name: "pickupline",
  version: "1.0.0",
  credits: "Vern",
  description: "Get a random pickup line",
  commandCategory: "fun",
  usages: "pickupline",
  cooldowns: 5,
  role: 0,
  hasPrefix: true,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    const res = await axios.get("https://kaiz-apis.gleeze.com/api/pickuplines?apikey=0ff49fce-1537-4798-9d90-69db487be671");

    const pickup = res.data?.pickupline;
    const author = res.data?.author || "Unknown";

    if (!pickup) {
      return api.sendMessage("❌ No pickup line received. Please try again later.", threadID, messageID);
    }

    const message = `💘 𝗥𝗔𝗡𝗗𝗢𝗠 𝗣𝗜𝗖𝗞𝗨𝗣 𝗟𝗜𝗡𝗘\n\n"${pickup}"\n\n— 🧠 ${author}`;
    return api.sendMessage(message, threadID, messageID);
  } catch (err) {
    console.error("[pickupline.js] API Error:", err.message || err);
    return api.sendMessage("🚫 Failed to fetch pickup line. Please try again later.", threadID, messageID);
  }
};
