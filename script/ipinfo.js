const axios = require("axios");

module.exports = {
  config: {
    name: "ipinfo",
    version: "1.0.0",
    author: "You",
    description: "Get detailed info about an IP address.",
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage(
        "❗ Please provide an IP address.\n\nUsage: /ipinfo [ip_address]",
        threadID,
        messageID
      );
    }

    const ip = args[0];

    try {
      const response = await axios.get(`https://api.ferdev.my.id/internet/infoip?ip=${encodeURIComponent(ip)}`);
      const data = response.data;

      if (!data || data.status === "fail") {
        return api.sendMessage(
          `❌ Failed to retrieve info for IP: ${ip}`,
          threadID,
          messageID
        );
      }

      // Prepare info message, adapt based on available data
      let msg = `🌐 IP Information for: ${ip}\n\n`;
      msg += `📍 Country: ${data.country || "N/A"}\n`;
      msg += `🏙️ Region: ${data.regionName || "N/A"}\n`;
      msg += `🏢 City: ${data.city || "N/A"}\n`;
      msg += `📡 ISP: ${data.isp || "N/A"}\n`;
      msg += `🕒 Timezone: ${data.timezone || "N/A"}\n`;
      msg += `🔢 ZIP Code: ${data.zip || "N/A"}\n`;
      msg += `🔧 AS: ${data.as || "N/A"}`;

      return api.sendMessage(msg, threadID, messageID);

    } catch (error) {
      console.error("Error in ipinfo command:", error);
      api.sendMessage(
        `❌ Failed to retrieve IP info.\nError: ${error.message}`,
        threadID,
        messageID
      );
    }
  }
};
