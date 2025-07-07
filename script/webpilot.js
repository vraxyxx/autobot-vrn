const axios = require("axios");

module.exports = {
  config: {
    name: "webpilot",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Vern",
    description: "Ask anything and get detailed answer using WebPilot AI.",
    commandCategory: "ai",
    usages: "[question]",
    cooldowns: 5,
    role: 0,
    hasPrefix: true
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("❓ Please provide a question to ask.\n\nExample: webpilot what is 1+1", threadID, messageID);
    }

    try {
      const res = await axios.get(`https://urangkapolka.vercel.app/api/webpilot?prompt=${encodeURIComponent(prompt)}`);
      const result = res.data?.response;

      if (!result) {
        return api.sendMessage("❌ No response received from WebPilot API.", threadID, messageID);
      }

      // Trim the result if it's too long
      const maxLength = 2000;
      const output = result.length > maxLength ? result.slice(0, maxLength) + "...\n\n✂️ (response trimmed)" : result;

      return api.sendMessage(`🤖 𝗪𝗲𝗯𝗣𝗶𝗹𝗼𝘁 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲\n\n${output}`, threadID, messageID);
    } catch (error) {
      console.error("[webpilot.js] API Error:", error.message || error);
      return api.sendMessage("🚫 Failed to fetch response. Try again later.", threadID, messageID);
    }
  }
};
