const axios = require("axios");

module.exports.config = {
  name: "xl",
  version: "1.0",
  role: 0,
  author: "Vern",
  credits: "Vina",
  aliases: [],
  countDown: 10,
  longDescription: "Generate an image from text using the SDXL model.",
  category: "image",
  usages: "< prompt > [--ar=2:3]",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      `✨ Please provide a prompt.\nExamples:\n• ${global.GoatBot.config.prefix}xl a cat\n• ${global.GoatBot.config.prefix}xl a girl --ar 2:3`,
      threadID,
      messageID
    );
  }

  let ratio = "1:1";

  // Handle aspect ratio flags
  const ratioArg = args.find(arg => arg.startsWith('--ar='));
  if (ratioArg) {
    ratio = ratioArg.split('=')[1];
    args.splice(args.indexOf(ratioArg), 1);
  } else {
    const idx = args.findIndex(arg => arg === '--ar');
    if (idx !== -1 && args[idx + 1]) {
      ratio = args[idx + 1];
      args.splice(idx, 2);
    }
  }

  const prompt = args.join(" ");
  const apiUrl = `https://smfahim.onrender.com/xl31?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}`;

  api.setMessageReaction("⏳", messageID, () => {}, true);

  const startTime = Date.now();

  try {
    const stream = await global.utils.getStreamFromURL(apiUrl);

    const endTime = Date.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);

    api.sendMessage({
      body: `🖼️ Here is your XL model image!\n⏱️ Time taken: ${seconds} seconds`,
      attachment: stream
    }, threadID, messageID);

    api.setMessageReaction("✅", messageID, () => {}, true);
  } catch (error) {
    console.error("XL Error:", error);
    api.sendMessage("❌ Failed to generate image. Please try again later.", threadID, messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
  }
};