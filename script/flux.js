const axios = require('axios');

module.exports.config = {
  name: "flux",
  version: "3.0.0",
  role: 0,
  credits: "vern",
  description: "Generate an image using the Flux AI model.",
  usage: "/flux <prompt>",
  cooldowns: 5,
  category: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(' ').trim();
  const prefix = "/"; // Change this if your bot has a dynamic prefix system

  // 🟡 No prompt given
  if (!prompt) {
    const usageMessage = `════『 𝗙𝗟𝗨𝗫 』════\n\n` +
      `⚠️ Please provide a prompt to generate an image.\n\n` +
      `📌 Usage: ${prefix}flux <prompt>\n` +
      `📸 Example: ${prefix}flux A futuristic robot flying over Tokyo\n\n` +
      `> Thank you for using the Flux image generator!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // 🕒 Send "loading" message first
    const waitMsg = `════『 𝗙𝗟𝗨𝗫 』════\n\n` +
      `🖌️ Generating image for: "${prompt}"\nPlease wait a moment...`;

    api.sendMessage(waitMsg, threadID);

    // 🟢 Call the Flux AI API
    const response = await axios.get("https://kaiz-apis.gleeze.com/api/flux", {
      responseType: 'stream',
      params: { prompt }
    });

    // ✅ Success
    const successMessage = `════『 𝗙𝗟𝗨𝗫 』════\n\n` +
      `✅ Successfully generated image for:\n"${prompt}"\n\n` +
      `> Enjoy your image!`;

    return api.sendMessage({
      body: successMessage,
      attachment: response.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in flux command:', error.message || error);

    const errorMessage = `════『 𝗙𝗟𝗨𝗫 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to generate image.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};
