const axios = require("axios");

module.exports.config = {
  name: "ailab",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Generate an AI image using Haji-Mix AILab",
  usage: "/ailab <your prompt>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ").trim();
  const prefix = "/"; // Adjust if you use a dynamic prefix

  if (!prompt) {
    const usageMsg = `════『 𝗔𝗜𝗟𝗔𝗕 』════\n\n` +
      `❌ Please provide a prompt to generate an AI image.\n\n` +
      `📌 Usage: ${prefix}ailab <prompt>\n` +
      `💬 Example: ${prefix}ailab cat twerking\n\n` +
      `> Powered by Vern-Autobot`;
    return api.sendMessage(usageMsg, threadID, messageID);
  }

  try {
    // Sending loading message
    const waitMsg = `════『 𝗔𝗜𝗟𝗔𝗕 』════\n\n⌛ Generating artwork for:\n"${prompt}"\nPlease wait...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    const apiUrl = `https://haji-mix.up.railway.app/api/ailab?prompt=${encodeURIComponent(prompt)}&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;
    const response = await axios.get(apiUrl);
    const imageUrl = response?.data?.result;

    if (!imageUrl) {
      throw new Error("No result returned from API.");
    }

    // Send generated image
    await api.sendMessage({
      attachment: await global.utils.getStreamFromURL(imageUrl)
    }, threadID, messageID);

  } catch (err) {
    console.error("❌ AILab error:", err.message || err);

    const errorMsg = `════『 𝗔𝗜𝗟𝗔𝗕 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to generate image.\nReason: ${err.message || "Unknown error"}\n\n` +
      `> Please try again later.`;
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
