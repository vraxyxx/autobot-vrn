const axios = require("axios");

module.exports.config = {
  name: "pickupline",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Vern",
  description: "Get a random pickup line",
  commandCategory: "fun",
  usages: "pickupline",
  cooldowns: 5,
  role: 0,
  hasPrefix: true
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    const res = await axios.get("https://kaiz-apis.gleeze.com/api/pickuplines?apikey=0ff49fce-1537-4798-9d90-69db487be671");

    const pickup = res.data?.pickupline;

    if (!pickup) {
      return api.sendMessage("❌ No pickup line found. Try again later.", threadID, messageID);
    }

    const msg = `🗣️ 𝗥𝗔𝗡𝗗𝗢𝗠 𝗣𝗜𝗖𝗞𝗨𝗣 𝗟𝗜𝗡𝗘\n\n"${pickup}"`;
    return api.sendMessage(msg, threadID, messageID);
  } catch (error) {
    console.error("📛 [pickupline.js] API Error:", error.message || error);
    return api.sendMessage("🚫 Error: Couldn't fetch pickup line. Try again later.", threadID, messageID);
  }
};
