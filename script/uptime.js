const axios = require("axios");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["botuptime", "status"],
    version: "1.0",
    author: "Vern",
    countDown: 5,
    role: 0,
    shortDescription: "Get bot uptime and social links",
    longDescription: "Shows how long the bot has been running with links",
    category: "info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get(`https://urangkapolka.vercel.app/api/uptime?instag=vern&ghub=vernesg&fb=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61576677958957&hours=24+hours&minutes=60+minutes&seconds=60+seconds&botname=vernx`);
      const data = res.data.result;

      const reply = `🟢 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲 𝗥𝗲𝗽𝗼𝗿𝘁

🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${data.bot_name}
⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲: ${data.uptime}
📆 𝗧𝗶𝗺𝗲𝘀𝘁𝗮𝗺𝗽: ${new Date(data.timestamp).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}

🌐 𝗦𝗼𝗰𝗶𝗮𝗹 𝗟𝗶𝗻𝗸𝘀:
📘 Facebook: ${data.social_links.facebook}
📸 Instagram: https://instagram.com/${data.social_links.instagram || "vern"}
💻 GitHub: https://github.com/${data.social_links.github || "vernesg"}`;

      message.reply(reply);
    } catch (err) {
      console.error("Error fetching uptime data:", err);
      message.reply("❌ Failed to fetch uptime data. Try again later.");
    }
  }
};
