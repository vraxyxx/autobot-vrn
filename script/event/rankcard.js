const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "rankcard",
  version: "1.1.0",
  credits: "Vern",
  description: "Auto-send a rank card with level-up logic and cooldown",
  cooldown: 300
};

// Simulated in-memory XP tracker (use a DB for persistence!)
const xpDB = new Map(); // key: senderID => { xp, level, rank }

// Cooldown tracker
const cooldowns = new Map();

module.exports.handleEvent = async function ({ api, event }) {
  const { senderID, threadID } = event;

  // Check 5-minute cooldown
  const now = Date.now();
  const lastUsed = cooldowns.get(senderID);
  if (lastUsed && now - lastUsed < 300000) return;

  cooldowns.set(senderID, now);

  // Fetch or init user XP record
  if (!xpDB.has(senderID)) {
    xpDB.set(senderID, {
      xp: 0,
      level: 1,
      rank: Math.floor(Math.random() * 1000) + 1 // random for demo
    });
  }

  const userData = xpDB.get(senderID);
  const xpGain = Math.floor(Math.random() * 50) + 20; // 20–70 XP per message
  userData.xp += xpGain;

  // XP required per level (e.g. exponential growth)
  const requiredXP = Math.floor(1000 + userData.level * 500);

  let leveledUp = false;
  while (userData.xp >= requiredXP) {
    userData.level++;
    userData.xp -= requiredXP;
    leveledUp = true;
  }

  const userInfo = await api.getUserInfo(senderID);
  const name = userInfo[senderID]?.name || "User";
  const avatarURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;

  // Call rank card API
  const cardURL = `https://ace-rest-api.onrender.com/api/rank` +
    `?level=${userData.level}` +
    `&rank=${userData.rank}` +
    `&xp=${userData.xp}` +
    `&requiredXP=${requiredXP}` +
    `&nickname=${encodeURIComponent(name)}` +
    `&status=online` +
    `&avatar=${encodeURIComponent(avatarURL)}`;

  try {
    const response = await axios.get(cardURL, { responseType: "arraybuffer" });
    const filePath = path.join(__dirname, "..", "cache", `rank-${senderID}.png`);
    fs.writeFileSync(filePath, Buffer.from(response.data));

    let message = `🎖️ Rank card for ${name}\n➕ XP gained: ${xpGain}`;
    if (leveledUp) message += `\n⬆️ Congrats! You've reached Level ${userData.level}! 🎉`;

    await api.sendMessage({
      body: message,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath));
  } catch (err) {
    console.error("❌ Rankcard error:", err.message || err);
  }
};
