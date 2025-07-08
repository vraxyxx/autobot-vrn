const axios = require("axios");

let simSimiEnabled = false;

module.exports.config = {
  name: "simv2",
  version: "2.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["simsimi", "sim"],
  description: "Toggle Simsimi v2 auto-reply (official API)",
  usage: "simv2 on | simv2 off",
  credits: "Vern",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const action = args[0]?.toLowerCase();

  if (action === "on") {
    simSimiEnabled = true;
    return api.sendMessage("✅ 𝗦𝗶𝗺𝗦𝗶𝗺𝗶 𝗩𝟮 𝗔𝗨𝗧𝗢 𝗥𝗘𝗣𝗟𝗬 𝗘𝗡𝗔𝗕𝗟𝗘𝗗", threadID, messageID);
  } else if (action === "off") {
    simSimiEnabled = false;
    return api.sendMessage("❌ 𝗦𝗶𝗺𝗦𝗶𝗺𝗶 𝗩𝟮 𝗔𝗨𝗧𝗢 𝗥𝗘𝗣𝗟𝗬 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗", threadID, messageID);
  } else {
    return api.sendMessage(`ℹ️ Usage: simv2 on | simv2 off\nCurrent status: ${simSimiEnabled ? "ON" : "OFF"}`, threadID, messageID);
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  if (!simSimiEnabled || event.type !== "message" || event.senderID === api.getCurrentUserID() || !event.body) return;

  const message = event.body.trim();

  try {
    const res = await axios.post("https://api.simsimi.vn/v2/simtalk", null, {
      params: {
        text: message,
        lc: "ph", // Language code
        version: "v2",
        key: process.env.SIMSIMI_KEY || "3f722ddc86104152a7f6c9aa951e6136b94cf0fd"
      }
    });

    const reply = res.data.message || "🤖 Walang sagot si Simsimi.";
    return api.sendMessage(reply, event.threadID);
  } catch (err) {
    console.error("[simv2 error]", err?.response?.data || err.message);
    return api.sendMessage("❌ Error: Hindi makausap si Simsimi ngayon.", event.threadID);
  }
};
