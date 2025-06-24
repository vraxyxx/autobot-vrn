const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "rankcard",
  version: "1.0.0",
  credits: "Vern",
  description: "Auto-send a rank card when a user sends a message",
  dependencies: {
    axios: "",
    "fs-extra": ""
  }
};

// 🧠 Example XP/Level tracker (static example only; dynamic requires DB)
const userProgress = {
  level: 102,
  rank: 563,
  xp: 71032,
  requiredXP: 95195
};

module.exports.handleEvent = async function ({ api, event }) {
  const { senderID, threadID } = event;

  try {
    const userInfo = await api.getUserInfo(senderID);
    const name = userInfo[senderID]?.name || "User";

    const avatarURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;

    const apiUrl = `https://ace-rest-api.onrender.com/api/rank` +
      `?level=${userProgress.level}` +
      `&rank=${userProgress.rank}` +
      `&xp=${userProgress.xp}` +
      `&requiredXP=${userProgress.requiredXP}` +
      `&nickname=${encodeURIComponent(name)}` +
      `&status=online` +
      `&avatar=${encodeURIComponent(avatarURL)}`;

    const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

    const imgPath = path.join(__dirname, "..", "cache", `rank-${senderID}.png`);
    fs.writeFileSync(imgPath, Buffer.from(res.data));

    await api.sendMessage({
      body: `🎖️ Rank card for ${name}`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => fs.unlinkSync(imgPath));

  } catch (error) {
    console.error("❌ Rank card error:", error.message || error);
  }
};
