const axios = require("axios");

module.exports.config = {
  name: "summarize",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["summary", "sumtext"],
  description: "Summarize long text using AI",
  usage: "summarize <your text>",
  credits: "Vern",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const inputText = args.join(" ").trim();
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  if (!inputText) {
    return api.sendMessage("❌ Please provide a paragraph or long text to summarize.\n\nExample:\nsummarize ChatGPT is a powerful AI language model...", threadID, messageID);
  }

  api.sendMessage("📄 Summarizing your text, please wait...", threadID, async (err, info) => {
    if (err) return;

    try {
      const apiKey = "4fe7e522-70b7-420b-a746-d7a23db49ee5";
      const apiURL = `https://kaiz-apis.gleeze.com/api/summarizer?text=${encodeURIComponent(inputText)}&apikey=${apiKey}`;

      const res = await axios.get(apiURL);
      const { summary, keywords } = res.data;

      const userName = await getUserName(api, senderID);
      const timePH = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

      const replyMessage = `📝 𝗧𝗘𝗫𝗧 𝗦𝗨𝗠𝗠𝗔𝗥𝗬\n━━━━━━━━━━━━━━━━━━\n${summary}\n━━━━━━━━━━━━━━━━━━\n🔑 𝗞𝗲𝘆𝘄𝗼𝗿𝗱𝘀: ${keywords.join(", ")}\n🗣 𝗕𝘆: ${userName}\n⏰ ${timePH}`;

      api.editMessage(replyMessage, info.messageID);
    } catch (err) {
      console.error("[summarize.js] Error:", err.message);
      const msg = err.response?.data?.message || err.message || "Unknown error";
      api.editMessage("❌ Failed to summarize text:\n" + msg, info.messageID);
    }
  });
};

async function getUserName(api, userID) {
  try {
    const info = await api.getUserInfo(userID);
    return info?.[userID]?.name || "Unknown User";
  } catch {
    return "Unknown User";
  }
}
