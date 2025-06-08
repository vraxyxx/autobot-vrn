const axios = require('axios');

module.exports.config = {
  name: "pin",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Fetch Pinterest images using the Jonell01 API.",
  usage: "/pin <search term> [count]",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Image"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if your bot uses a different prefix

  if (args.length < 1) {
    const usageMessage = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗝𝗢𝗡𝗘𝗟𝗟 』════\n\n` +
      `⚠️ Please provide a search term.\n\n` +
      `📌 Usage: ${prefix}pin <search term> [count]\n` +
      `💬 Example: ${prefix}pin wallpaper 10\n\n` +
      `> Powered by Jonell01 Pinterest API`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  // Extract count (optional)
  let count = 1;
  if (!isNaN(args[args.length - 1])) {
    count = Math.max(1, Math.min(20, parseInt(args.pop(), 10))); // Limit count between 1 and 20
  }
  const searchTerm = args.join(" ");

  try {
    // Loading message
    const waitMsg = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗝𝗢𝗡𝗘𝗟𝗟 』════\n\n` +
      `🔍 Searching Pinterest for: "${searchTerm}" (${count} images)\nPlease wait a moment.`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Jonell01 Pinterest API
    const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/pin?title=${encodeURIComponent(searchTerm)}&count=${count}`;
    const response = await axios.get(apiUrl);

    let resultMsg = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗝𝗢𝗡𝗘𝗟𝗟 』════\n\n`;

    if (response.data && Array.isArray(response.data.result) && response.data.result.length > 0) {
      // Send images as attachments
      const imgUrls = response.data.result.slice(0, count);
      const attachments = [];
      for (const url of imgUrls) {
        try {
          const imgRes = await axios.get(url, { responseType: "stream" });
          attachments.push(imgRes.data);
        } catch {
          // skip broken images
        }
      }
      resultMsg += `Here are ${attachments.length} Pinterest image(s) for "${searchTerm}".\n\n> Powered by Jonell01 Pinterest API`;
      return api.sendMessage({ body: resultMsg, attachment: attachments }, threadID, messageID);
    } else {
      resultMsg += "⚠️ No images found for your search term.";
    }

    resultMsg += `\n> Powered by Jonell01 Pinterest API`;
    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in pin command:', error.message || error);

    const errorMessage = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to fetch images.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};