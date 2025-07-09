const axios = require("axios");

module.exports.config = {
  name: "simbrand",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  aliases: [],
  countDown: 5,
  description: "Check mobile number's SIM card brand.",
  category: "tools",
  usages: "<mobile_number>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const number = args[0];

  if (!number) {
    return api.sendMessage(
      "📱 Please provide a mobile number.\n\nExample:\nsimbrand 09123456789",
      threadID,
      messageID
    );
  }

  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/simbrand?number=${encodeURIComponent(number)}`;

  try {
    const { data } = await axios.get(apiUrl);

    if (data.error) {
      return api.sendMessage(`❌ Error: ${data.error}`, threadID, messageID);
    }

    const result = `
📱 Mobile Number: ${number}
🏷 Brand: ${data.brand || "Unknown"}
📍 Location: ${data.location || "Not Available"}
    `.trim();

    api.sendMessage(result, threadID, messageID);
  } catch (err) {
    console.error("SIM Brand API Error:", err.message);
    api.sendMessage("❌ Failed to fetch SIM brand. Please try again later.", threadID, messageID);
  }
};