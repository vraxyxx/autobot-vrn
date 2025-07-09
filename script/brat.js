const axios = require("axios");

module.exports.config = {
  name: "brat",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  aliases: ["bratcaption", "brattalk"],
  description: "Generate brat-style caption using input text.",
  category: "text",
  usages: "<text> | <type>",
  cooldown: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  const input = args.join(" ").split("|").map(item => item.trim());
  const text = input[0];
  const type = input[1] || "direct";

  if (!text) {
    return api.sendMessage(
      "⚠️ Please provide text for the brat caption.\n\nUsage:\n/brat <text> | <type>\nTypes: direct, sarcasm, savage, etc.",
      threadID,
      messageID
    );
  }

  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/brat?text=${encodeURIComponent(text)}&type=${encodeURIComponent(type)}`;

  try {
    const { data } = await axios.get(apiUrl);

    if (data.error) {
      return api.sendMessage(`❌ API Error: ${data.error}`, threadID, messageID);
    }

    return api.sendMessage(`💬 Brat says: ${data.result || "No response"}`, threadID, messageID);

  } catch (error) {
    console.error("Brat Caption Error:", error.message);
    return api.sendMessage("❌ Failed to generate brat caption. Please try again later.", threadID, messageID);
  }
};