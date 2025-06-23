const axios = require("axios");

module.exports.config = {
  name: "uptime",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Check Vernx Bot uptime status",
  usage: "/uptime",
  prefix: true,
  cooldowns: 3,
  commandCategory: "System"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    // Send loading message
    await api.sendMessage("🔄 Fetching uptime status... please wait...", threadID);

    const apiUrl = `https://ace-rest-api.onrender.com/api/uptime?instag=vernesg&ghub=vraxyxx&fb=ver%20Cochangco&hours=1&minutes=23&seconds=45&botname=xexi`;

    const res = await axios.get(apiUrl);
    const result = res?.data?.result;

    if (!result) {
      return api.sendMessage("❌ Unable to fetch uptime info.", threadID, messageID);
    }

    const msg = `════『 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 』════\n\n🟢 Vernx Bot Status:\n${result}`;
    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in uptime command:", error.message || error);

    const errorMsg = `════『 𝗨𝗣𝗧𝗜𝗠𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n🚫 Failed to retrieve uptime info.\nReason: ${error.message || "Unknown error"}\n\n> Please try again later.`;

    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
