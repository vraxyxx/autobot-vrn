const axios = require("axios");

module.exports = {
  config: {
    name: "fbreport",
    version: "1.0.0",
    author: "vernex",
    description: "Get report about Facebook accounts created via API",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      await api.sendMessage("⏳ Fetching Facebook account report...", threadID, messageID);

      const res = await axios.get("https://haji-mix.up.railway.app/api/fbreport");
      const data = res.data;

      if (!data.status || !data.result) {
        return api.sendMessage("❌ Failed to retrieve Facebook report.", threadID, messageID);
      }

      const result = data.result;

      const reportMessage = `
════『 𝗙𝗕 𝗥𝗘𝗣𝗢𝗥𝗧 』════

📅 Created Today: ${result.today}
📦 Total Accounts: ${result.total}
💾 Stored on Server: ${result.server}
📤 Sent to Email: ${result.email}
🕓 Last Updated: ${result.updated}

> Thank you for using our system
      `.trim();

      return api.sendMessage(reportMessage, threadID, messageID);
    } catch (err) {
      console.error("❌ Error in /fbreport:", err.message);
      return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
  }
};
