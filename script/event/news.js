const axios = require("axios");

module.exports.config = {
  name: "news",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["trending", "headlines"],
  description: "Get the latest trending news headlines",
  usage: "news",
  credits: "Vern",
  cooldown: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  try {
    const res = await axios.get("https://ace-rest-api.onrender.com/api/news");
    const articles = res.data?.result;

    if (!Array.isArray(articles) || articles.length === 0) {
      return api.sendMessage("❌ Failed to fetch news. Please try again later.", threadID, messageID);
    }

    let msg = "📰 𝗧𝗢𝗣 𝗧𝗥𝗘𝗡𝗗𝗜𝗡𝗚 𝗡𝗘𝗪𝗦\n━━━━━━━━━━━━━━\n";

    // Limit to 5 news items for brevity
    articles.slice(0, 5).forEach((article, index) => {
      msg += `📍 ${index + 1}. ${article.title}\n🔗 ${article.url}\n\n`;
    });

    msg += "━━━━━━━━━━━━━━\n📌 Source: Ace REST API";

    return api.sendMessage(msg, threadID, messageID);
  } catch (error) {
    console.error("❌ News command error:", error.message || error);
    return api.sendMessage("❌ An error occurred while fetching the news.", threadID, messageID);
  }
};
