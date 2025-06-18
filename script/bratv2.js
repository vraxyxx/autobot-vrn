const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "bratv2",
  version: "1.0.0",
  role: 0,
  credits: "vraxyxx",
  description: "Generate a BratV2 style image using the Ferdev API.",
  usage: "/bratv2 <text>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Maker"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const text = args.join(' ').trim();
  const prefix = "/"; // Adjust if your bot uses a different prefix

  // No text provided
  if (!text) {
    const usageMessage = `════『 𝗕𝗥𝗔𝗧𝗩𝟮 』════\n\n` +
      `⚠️ Please provide text to generate a BratV2 style image.\n\n` +
      `📌 Usage: ${prefix}bratv2 <text>\n` +
      `💬 Example: ${prefix}bratv2 cat\n\n` +
      `> Thank you for using BratV2 Maker!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗕𝗥𝗔𝗧𝗩𝟮 』════\n\n` +
      `🎨 Generating image for: "${text}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the BratV2 Maker API
    const apiUrl = "https://api.ferdev.my.id/maker/bratv2";
    const response = await axios.get(apiUrl, {
      params: { text: text },
      responseType: 'arraybuffer'
    });

    // Save the image to a temporary file
    const tempPath = __dirname + `/cache/bratv2_${Date.now()}.jpg`;
    await fs.outputFile(tempPath, Buffer.from(response.data, "binary"));

    // Send the resulting image
    await api.sendMessage(
      {
        body: "✅ Here is your BratV2 image!",
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
    console.error('❌ Error in bratv2 command:', error.message || error);

    const errorMessage = `════『 𝗕𝗥𝗔𝗧𝗩𝟮 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to generate BratV2 image.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};