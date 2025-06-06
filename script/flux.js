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

  const prefix = "/"; // You may dynamically fetch this if needed

  if (!prompt) {
    const usageMessage = `====『 𝗙𝗟𝗨𝗫 』====\n\n` +
      `  ╭─╮\n` +
      `  | 『 𝗜𝗡𝗙𝗢 』 Please provide a prompt.\n` +
      `  | ✅ Usage: ${prefix}flux <prompt>\n` +
      `  | 📜 Example: ${prefix}flux A futuristic city at sunset\n` +
      `  ╰─────────────ꔪ\n\n` +
      `> 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 our bot\n> Contact: veaxdev36@gmail.com`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    const waitMsg = `====『 𝗙𝗟𝗨𝗫 』====\n\n` +
      `  ╭─╮\n` +
      `  | 『 𝗜𝗡𝗙𝗢 』 Generating image for "${prompt}", please wait...\n` +
      `  ╰─────────────ꔪ\n\n> Thank you for using this bot.`;

    api.sendMessage(waitMsg, threadID);

    const response = await axios.get("https://kaiz-apis.gleeze.com/api/flux", {
      responseType: 'stream',
      params: { prompt }
    });

    const successMessage = `====『 𝗙𝗟𝗨𝗫 』====\n\n` +
      `  ╭─╮\n` +
      `  | 『 𝗦𝗨𝗖𝗖𝗘𝗦𝗦 』 Generated image for: "${prompt}"\n` +
      `  ╰─────────────ꔪ\n\n> 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 for using our bot\n> Contact: korisawaumuzaki@gmail.com`;

    return api.sendMessage({
      body: successMessage,
      attachment: response.data
    }, threadID, messageID);

  } catch (error) {
    console.error('❌ Error in flux command:', error);
    const errorMessage = `====『 𝗙𝗟𝗨𝗫 𝗘𝗥𝗥𝗢𝗥 』====\n\n` +
      `  ╭─╮\n` +
      `  | 『 𝗜𝗡𝗙𝗢 』 Failed to generate image. Please try again later.\n` +
      `  ╰─────────────ꔪ\n\n> Thank you for using our bot\n> Contact: korisawaumuzaki@gmail.com`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};
