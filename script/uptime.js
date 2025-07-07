// commands/uptime.js
const fetchUptime = require("../script/uptime");

module.exports = {
  config: {
    name: "uptime",
    version: "1.0",
    author: "Vern",
    countDown: 10,
    role: 0,
    shortDescription: "Fetch bot uptime",
    longDescription: "Shows the uptime of the bot from the uptime API",
    category: "info",
    guide: {"en": "{pn}"}
  },
  
  onStart: async function ({ message }) {
    try {
      const data = await fetchUptime();

      return message.reply(`
🟢 𝗨𝗽𝘁𝗶𝗺𝗲 𝗥𝗲𝗽𝗼𝗿𝘁:
• Bot Name    : ${data.bot_name}
• Uptime      : ${data.uptime}
• Total Secs  : ${data.total_seconds}
• Timestamp   : ${new Date(data.timestamp).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}

🌐 Social Links:
  • Facebook : ${data.social_links.facebook}
  • Instagram: ${data.social_links.instagram}
  • GitHub    : ${data.social_links.github}
      `.trim());
    } catch (error) {
      console.error(error);
      return message.reply("❌ Could not fetch uptime. Try again later.");
    }
  }
};
