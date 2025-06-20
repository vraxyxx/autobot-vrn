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
    const loadingMsg = "🔄 Fetching uptime status... please wait...";
    await api.sendMessage(loadingMsg, threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/uptime?instag=vernesg&ghub=https%3A%2F%2Fgithub.com%2Fvernesg&fb=https%3A%2F%2Fwww.facebook.com%2Fvern.23x&hours=24&minutes=60&seconds=60&botname=vernx&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;

    const { data } = await axios.get(apiUrl);

    if (!data?.result) {
      return api.sendMessage("❌ Unable to fetch uptime info.", threadID, messageID);
    }

    const message = `════『 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 』════\n\n🟢 Vernx Bot Status:\n${data.result}`;
    return api.sendMessage(message, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in uptime command:", error.message || error);

    const errorMsg = `════『 𝗨𝗣𝗧𝗜𝗠𝗘 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to retrieve uptime info.\nReason: ${error.message || "Unknown error"}\n\n` +
      `> Please try again later.`;
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
