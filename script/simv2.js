const axios = require("axios");

let simSimiEnabled = true; // Auto-enabled by default

module.exports.config = {
  name: "simv2",
  version: "2.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Auto Simsimi reply via Simsimi.vn API",
  usage: "(auto replies when enabled)",
  commandCategory: "fun",
  credits: "Vern",
  cooldown: 2
};

module.exports.handleEvent = async function ({ api, event }) {
  if (
    !simSimiEnabled ||
    event.type !== "message" ||
    event.senderID === api.getCurrentUserID() ||
    !event.body
  ) return;

  try {
    const res = await axios.post(
      "https://api.simsimi.vn/v2/simtalk",
      null,
      {
        params: {
          text: event.body,
          lc: "ph",
          version: "v2",
          key: process.env.SIMSIMI_KEY || "3f722ddc86104152a7f6c9aa951e6136b94cf0fd"
        }
      }
    );

    const reply = res.data.message || "🤖 Walang sagot si Simsimi.";
    return api.sendMessage(reply, event.threadID);
  } catch (error) {
    console.error("[Simsimi Error]", error?.response?.data || error.message);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const arg = args[0]?.toLowerCase();

  if (arg === "on") {
    simSimiEnabled = true;
    return api.sendMessage("✅ Simsimi auto-reply is now ON.", threadID, messageID);
  }

  if (arg === "off") {
    simSimiEnabled = false;
    return api.sendMessage("❌ Simsimi auto-reply is now OFF.", threadID, messageID);
  }

  return api.sendMessage(
    `ℹ️ Usage: simv2 on | simv2 off\nCurrent status: ${simSimiEnabled ? "ON" : "OFF"}`,
    threadID,
    messageID
  );
};
