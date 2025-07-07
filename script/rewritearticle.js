const axios = require("axios");

module.exports.config = {
  name: "rewritearticle",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Vern",
  description: "Rewrite your text into a polished article using Gemini AI.",
  commandCategory: "ai",
  usages: "rewritearticle [text]",
  cooldowns: 5,
  role: 0,
  hasPrefix: true
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const text = args.join(" ");
  
  if (!text) {
    return api.sendMessage(
      "❓ Please provide the text you want rewritten.\n\nUsage: rewritearticle Your paragraph here...",
      threadID,
      messageID
    );
  }
  
  try {
    // Call the rewrite-article API
    const res = await axios.get("https://urangkapolka.vercel.app/api/rewrite-article", {
      params: { text }
    });
    
    const rewritten = res.data?.response || res.data?.rewritten || null;
    if (!rewritten) {
      return api.sendMessage(
        "⚠️ No rewritten text received. Please try again later.",
        threadID,
        messageID
      );
    }
    
    // Trim to avoid exceeding message limit
    const maxLen = 2000;
    const output = rewritten.length > maxLen
      ? rewritten.slice(0, maxLen) + "\n\n✂️ (output trimmed)"
      : rewritten;
    
    return api.sendMessage(
      `✍️ 𝗥𝗲𝘄𝗿𝗶𝘁𝘁𝗲𝗻 𝗔𝗿𝘁𝗶𝗰𝗹𝗲:\n\n${output}`,
      threadID,
      messageID
    );
  } catch (err) {
    console.error("[rewrite-article.js] API Error:", err.response?.data || err.message);
    return api.sendMessage(
      "🚫 Failed to rewrite the article. Please try again later.",
      threadID,
      messageID
    );
  }
};
