const axios = require("axios");

module.exports.config = {
  name: "aesthetic",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  aliases: ["aestext"],
  countDown: 3,
  description: "Generate aesthetic text image with your custom input.",
  category: "text",
  usages: "<text> | <author> | <color>",
  cooldown: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  const input = args.join(" ").split("|").map(item => item.trim());
  const text = input[0];
  const author = input[1] || "anonymous";
  const color = input[2] || "white";

  if (!text) {
    return api.sendMessage(
      "⚠️ Please provide some text.\n\nUsage:\naesthetic <text> | <author> | <color>\n\nExample:\naesthetic Hello World | cc | white",
      threadID,
      messageID
    );
  }

  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/aesthetic?text=${encodeURIComponent(text)}&author=${encodeURIComponent(author)}&color=${encodeURIComponent(color)}`;

  try {
    const imageStream = await global.utils.getStreamFromURL(apiUrl);

    return api.sendMessage({
      body: "✨ Aesthetic image generated:",
      attachment: imageStream
    }, threadID, messageID);
  } catch (err) {
    console.error("Aesthetic API Error:", err.message);
    return api.sendMessage("❌ Failed to generate aesthetic image. Please check your input or try again later.", threadID, messageID);
  }
};