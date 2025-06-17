const axios = require('axios');

module.exports.config = {
  name: "imagine",
  version: "1.0",
  credits: "developer", // DO NOT CHANGE
  description: "Generate AI art based on prompt",
  usage: "[prompt]",
  cooldown: 5,
  permissions: [0], // 0 = everyone
  commandCategory: "image",
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!args || args.length === 0) {
    return api.sendMessage("🖼️ Please provide your prompt to generate an image.", threadID, messageID);
  }

  const prompt = args.join(' ');
  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/generate-art?prompt=${encodeURIComponent(prompt)}`;

  try {
    api.sendMessage("🧠 Generating image based on your prompt, please wait...", threadID);

    await api.sendMessage({
      body: `✨ Here's your image for prompt: "${prompt}"`,
      attachment: await global.utils.getStreamFromURL(apiUrl)
    }, threadID, messageID);

  } catch (error) {
    console.error("Imagine command error:", error);
    return api.sendMessage("❌ Error: Could not generate image. Try again later.", threadID, messageID);
  }
};
