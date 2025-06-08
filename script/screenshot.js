const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "screenshot",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Take a website screenshot using the HajiMix API.",
  usage: "/screenshot <website url>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No URL provided
  if (!url) {
    const usageMessage = `════『 𝗦𝗖𝗥𝗘𝗘𝗡𝗦𝗛𝗢𝗧 』════\n\n` +
      `⚠️ Please provide a website URL to screenshot.\n\n` +
      `📌 Usage: ${prefix}screenshot <website url>\n` +
      `💬 Example: ${prefix}screenshot https://www.facebook.com/ixn.cloudy\n\n` +
      `> Thank you for using the Screenshot command!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗦𝗖𝗥𝗘𝗘𝗡𝗦𝗛𝗢𝗧 』════\n\n` +
      `🖼️ Taking a screenshot of: ${url}\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the HajiMix Screenshot API
    const apiUrl = "https://haji-mix.up.railway.app/api/screenshot";
    const response = await axios.get(apiUrl, {
      params: { url },
      responseType: "arraybuffer"
    });

    // Save image buffer to a temporary file
    const tempImagePath = __dirname + "/tmp_screenshot.jpg";
    await fs.writeFile(tempImagePath, Buffer.from(response.data, "binary"));

    // Send the screenshot as an attachment
    await api.sendMessage({
      body: `════『 𝗦𝗖𝗥𝗘𝗘𝗡𝗦𝗛𝗢𝗧 』════\n\nHere is the screenshot of:\n${url}\n\n> Powered by HajiMix`,
      attachment: fs.createReadStream(tempImagePath)
    }, threadID, messageID);

    // Clean up temporary file
    setTimeout(() => fs.unlink(tempImagePath), 30000);

  } catch (error) {
    console.error('❌ Error in screenshot command:', error.message || error);

    const errorMessage = `════『 𝗦𝗖𝗥𝗘𝗘𝗡𝗦𝗛𝗢𝗧 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to capture screenshot.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};