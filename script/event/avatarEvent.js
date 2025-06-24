const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "avatarAuto",
  version: "1.0.0",
  description: "Auto generate avatar card using API",
  credits: "Vern",
};

// Cooldown to prevent spam (5 min per user)
const cooldown = new Map();

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body } = event;

  // Trigger condition: contains "make avatar"
  if (!body || !body.toLowerCase().includes("make avatar")) return;

  // Cooldown check
  const now = Date.now();
  if (cooldown.has(senderID) && now - cooldown.get(senderID) < 5 * 60 * 1000) return;
  cooldown.set(senderID, now);

  try {
    const userInfo = await api.getUserInfo(senderID);
    const name = userInfo[senderID]?.name || "User";

    const avatar = `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;
    const bgtext = "VRN Squad";
    const signature = name;
    const color = "cyan"; // or any CSS color

    const url = `https://ace-rest-api.onrender.com/api/avatar` +
      `?id=${encodeURIComponent(avatar)}` +
      `&bgtext=${encodeURIComponent(bgtext)}` +
      `&signature=${encodeURIComponent(signature)}` +
      `&color=${encodeURIComponent(color)}`;

    const response = await axios.get(url, { responseType: "arraybuffer" });

    const filePath = path.join(__dirname, "..", "cache", `avatar-${senderID}.jpg`);
    fs.writeFileSync(filePath, Buffer.from(response.data));

    await api.sendMessage({
      body: `🪪 Avatar card generated for ${name}`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath));

  } catch (err) {
    console.error("❌ Avatar error:", err.message || err);
    api.sendMessage("❌ Failed to generate avatar. Try again later.", threadID);
  }
};
