const axios = require("axios");

module.exports = {
  config: {
    name: "fbcreate",
    version: "1.0.0",
    author: "vernex",
    description: "Create fake Facebook accounts via API",
    cooldowns: 10,
    dependencies: {
      axios: ""
    }
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    // Input: /fbcreate <amount> <email>
    const [amountRaw, email] = args;
    const amount = parseInt(amountRaw);

    if (!amount || !email || isNaN(amount)) {
      return api.sendMessage(
        "❌ Invalid usage.\n\nUsage: /fbcreate <amount> <email>\nExample: /fbcreate 1 veaxdev36@gmail.com",
        threadID,
        messageID
      );
    }

    try {
      await api.sendMessage(`⏳ Creating ${amount} FB account(s) for: ${email}...`, threadID, messageID);

      const res = await axios.get(`https://haji-mix.up.railway.app/api/fbcreate?amount=${amount}&email=${encodeURIComponent(email)}`);
      const data = res.data;

      if (!data.status || !data.result || data.result.length === 0) {
        return api.sendMessage("❌ Failed to create Facebook accounts. Try again later.", threadID, messageID);
      }

      let reply = "✅ Successfully created Facebook account(s):\n\n";

      data.result.forEach((acc, index) => {
        reply += `📍 Account ${index + 1}:\n`;
        reply += `• Name: ${acc.name}\n`;
        reply += `• UID: ${acc.uid}\n`;
        reply += `• Password: ${acc.password}\n`;
        reply += `• Email: ${acc.email}\n\n`;
      });

      return api.sendMessage(reply.trim(), threadID, messageID);
    } catch (err) {
      console.error("❌ Error in /fbcreate:", err.message);
      return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
  }
};
