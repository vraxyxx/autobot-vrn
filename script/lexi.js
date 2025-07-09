const axios = require("axios");

module.exports.config = {
  name: "lexi",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  aliases: ["lexireply", "lexitalk"],
  countDown: 3,
  description: "Generate a Lexi-style caption based on your input.",
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
      "⚠️ Please provide text for Lexi.\n\nUsage:\nlexi <text> | <type>\n\nTypes: direct, savage, cute, etc.",
      threadID,
      messageID
    );
  }

  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/lexi?text=${encodeURIComponent(text)}&type=${encodeURIComponent(type)}`;

  try {
    const { data } = await axios.get(apiUrl);

    if (data.error) {
      return api.sendMessage(`❌ API Error: ${data.error}`, threadID, messageID);
    }

    return api.sendMessage(`🗣️ Lexi says: ${data.result || "No response"}`, threadID, messageID);
  } catch (err) {
    console.error("Lexi API Error:", err.message);
    return api.sendMessage("❌ Failed to generate Lexi caption. Please try again later.", threadID, messageID);
  }
};