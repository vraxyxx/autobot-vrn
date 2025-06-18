const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "removebg",
  version: "1.0.0",
  role: 0,
  credits: "vraxyxx",
  description: "Remove image background using the Ferdev API.",
  usage: "/removebg <image link>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Tools"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args.join(' ').trim();
  const prefix = "/"; // Adjust if your bot uses a different prefix

  // No link provided
  if (!link) {
    const usageMessage = `════『 𝗥𝗘𝗠𝗢𝗩𝗘𝗕𝗚 』════\n\n` +
      `⚠️ Please provide an image link to remove its background.\n\n` +
      `📌 Usage: ${prefix}removebg <image link>\n` +
      `💬 Example: ${prefix}removebg https://files.catbox.moe/91e6rp.jpg\n\n` +
      `> Thank you for using RemoveBG!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗥𝗘𝗠𝗢𝗩𝗘𝗕𝗚 』════\n\n` +
      `🖼️ Removing background from: "${link}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the RemoveBG API
    const apiUrl = "https://api.ferdev.my.id/tools/removebg";
    const response = await axios.get(apiUrl, {
      params: {
        link: link
      },
      responseType: 'arraybuffer'
    });

    // Save the image to a temporary file
    const tempPath = __dirname + `/cache/removebg_${Date.now()}.png`;
    await fs.outputFile(tempPath, Buffer.from(response.data, "binary"));

    // Send the resulting image
    await api.sendMessage(
      {
        body: "✅ Here is your image with the background removed!",
        attachment: fs.createReadStream(tempPath)
      },
      threadID,
      async () => {
        // Delete the temp file after sending
        await fs.remove(tempPath);
      },
      messageID
    );
  } catch (error) {
    console.error('❌ Error in removebg command:', error.message || error);

    const errorMessage = `════『 𝗥𝗘𝗠𝗢𝗩𝗘𝗕𝗚 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to remove background from image.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};