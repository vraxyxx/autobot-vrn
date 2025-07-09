const axios = require("axios");

module.exports.config = {
  name: "shorturl",
  version: "1.0.0",
  role: 0,
  credits: "Vern",
  aliases: ["shorten", "tinyurl"],
  countDown: 3,
  description: "Shorten a long URL using an API.",
  category: "tools",
  usages: "<long_url>",
  cooldown: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const longUrl = args[0];

  if (!longUrl || !longUrl.startsWith("http")) {
    return api.sendMessage(
      "🔗 Please provide a valid URL.\n\nExample:\n/shorturl https://example.com",
      threadID,
      messageID
    );
  }

  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/shorturl?url=${encodeURIComponent(longUrl)}`;

  try {
    const { data } = await axios.get(apiUrl);

    if (data.error) {
      return api.sendMessage(`❌ Error: ${data.error}`, threadID, messageID);
    }

    return api.sendMessage(
      `✅ URL shortened:\n🔗 Original: ${data.originalUrl}\n✂️ Short: ${data.shortenedUrl}`,
      threadID,
      messageID
    );

  } catch (err) {
    console.error("ShortURL Error:", err.message);
    return api.sendMessage("❌ Failed to shorten the URL. Please try again later.", threadID, messageID);
  }
};