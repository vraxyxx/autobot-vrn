const axios = require('axios');

module.exports.config = {
  name: "flux",
  version: "3.0.1",
  role: 0,
  credits: "vern",
  description: "Generate an image using the Flux AI model.",
  usage: "/flux <prompt>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "AI"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No prompt given
  if (!prompt) {
    const usageMessage = `════『 𝗙𝗟𝗨𝗫 』════\n\n` +
      `⚠️ Please provide a prompt to generate an image.\n\n` +
      `📌 Usage: ${prefix}flux <prompt>\n` +
      `📸 Example: ${prefix}flux A futuristic robot flying over Tokyo\n\n` +
      `> Thank you for using the Flux image generator!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗙𝗟𝗨𝗫 』════\n\n` +
      `🖌️ Generating image for: "${prompt}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Flux AI API (fix: use prompt param, not hardcoded)
    const apiUrl = "https://kaiz-apis.gleeze.com/api/flux";
    const response = await axios.get(apiUrl, {
      responseType: 'stream',
      params: {
        prompt,
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    // Success
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