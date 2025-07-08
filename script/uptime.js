const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "uptime",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["botinfo", "vernbot"],
  description: "Displays bot uptime and information",
  usage: "uptime",
  credits: "Vern",
  cooldown: 3,
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  const loading = await api.sendMessage("⏳ Fetching uptime info...", threadID);

  try {
    const { data } = await axios.get("https://kaiz-apis.gleeze.com/api/uptime", {
      params: {
        instag: "vernesg",
        ghub: "https://github.com/vernesg",
        fb: "https://www.facebook.com/profile.php?id=61577888681051",
        hours: 24,
        minutes: 60,
        seconds: 60,
        botname: "vernx",
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    const { botname, uptime, hours, minutes, seconds, avatar, github, fb, instagram, logo } = data;

    const infoText = `🤖 ${botname} Uptime Info\n━━━━━━━━━━━━━━━━━━\n` +
      `🕒 Uptime: ${uptime} (${hours}h ${minutes}m ${seconds}s)\n\n` +
      `🌐 GitHub: ${github}\n📷 IG: ${instagram}\n📘 FB: ${fb}\n━━━━━━━━━━━━━━━━━━\n⚡ Created by: Vern`;

    // Download logo and avatar
    const imgPaths = [];

    const download = async (url, filename) => {
      const res = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `${filename}.jpg`);
      fs.writeFileSync(filePath, res.data);
      imgPaths.push(fs.createReadStream(filePath));
    };

    await download(logo, "bot_logo");
    await download(avatar, "bot_avatar");

    // Send message with image
    api.sendMessage({
      body: infoText,
      attachment: imgPaths
    }, threadID, () => {
      imgPaths.forEach(file => fs.unlinkSync(file.path));
    }, messageID);

    api.unsendMessage(loading.messageID);

  } catch (err) {
    console.error("❌ Error in uptime command:", err.message);
    api.editMessage(`❌ Failed to get uptime info.\nError: ${err.message}`, loading.messageID);
  }
};
