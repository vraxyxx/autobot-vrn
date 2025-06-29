const axios = require("axios");

module.exports.config = {
  name: "shield",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["fbshield"],
  description: "Toggle Facebook Profile Shield using access token.",
  usage: "fbshield <token> | <on/off>",
  credits: "burat",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const input = args.join(" ").split("|").map(i => i.trim());

  if (input.length < 2) {
    return api.sendMessage(
      `❗ Usage:\nfbshield <token> | <on/off>\n\nExample:\nfbshield EAA...ZDZD | on`,
      threadID,
      messageID
    );
  }

  const [token, toggle] = input;
  const enable = toggle.toLowerCase() === "on" ? "true" : toggle.toLowerCase() === "off" ? "false" : null;

  if (!enable) {
    return api.sendMessage("❌ Invalid toggle value. Use `on` or `off`.", threadID, messageID);
  }

  const url = `https://wrapped-rest-apis.vercel.app/api/guard?token=${encodeURIComponent(token)}&enable=${enable}`;

  try {
    const res = await axios.get(url);
    const { operator, result } = res.data;

    if (result?.success) {
      return api.sendMessage(
        `🛡️ Profile Shield ${enable === "true" ? "enabled" : "disabled"} successfully.`,
        threadID,
        messageID
      );
    } else {
      return api.sendMessage("❌ Failed to update profile shield. Make sure the token is valid.", threadID, messageID);
    }
  } catch (err) {
    console.error("fbshield error:", err.message);
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
};