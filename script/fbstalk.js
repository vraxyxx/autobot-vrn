const axios = require("axios");

module.exports.config = {
  name: "fbstalk",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  description: "Get information about a Facebook user by UID",
  usage: "[uid]",
  cooldown: 5,
  hasPrefix: true,
  aliases: ["stalk", "fbinfo"]
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const uid = args[0];

  if (!uid || isNaN(uid)) {
    return api.sendMessage("❌ Please provide a valid Facebook UID.\n\nExample:\n/fbstalk 1000123456789", threadID, messageID);
  }

  try {
    const res = await axios.get(`https://hiroshi-api.onrender.com/fbtool/stalk?uid=${uid}`);
    const info = res.data;

    if (!info || !info.name) {
      return api.sendMessage("❌ Could not retrieve user information.", threadID, messageID);
    }

    const msg = `👤 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗨𝘀𝗲𝗿 𝗜𝗻𝗳𝗼\n━━━━━━━━━━━━━━\n` +
      `• 🧑 Name: ${info.name}\n` +
      `• 🆔 UID: ${info.uid}\n` +
      (info.followers ? `• 👥 Followers: ${info.followers}\n` : "") +
      (info.created ? `• 📆 Account Created: ${info.created}\n` : "") +
      (info.link ? `• 🔗 Profile: ${info.link}` : "");

    return api.sendMessage(msg, threadID, messageID);
  } catch (error) {
    console.error("❌ fbstalk error:", error.message || error);
    return api.sendMessage("❌ Error fetching Facebook data.\nPlease make sure the UID is public and valid.", threadID, messageID);
  }
};
