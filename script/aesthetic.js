const axios = require("axios");

module.exports.config = {
  name: "aesthetic",
  version: "1.0.1",
  role: 0,
  credits: "Vern",
  aliases: ["aestpic", "aestimg"],
  description: "Fetch a random aesthetic image.",
  category: "image",
  usages: "",
  cooldown: 3
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID } = event;

  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/aesthetic/random`;

  try {
    const imgStream = await global.utils.getStreamFromURL(apiUrl);

    return api.sendMessage({
      body: "✨ Here's a random aesthetic image:",
      attachment: imgStream
    }, threadID, messageID);
  } catch (err) {
    console.error("Random Aesthetic Error:", err.message);
    return api.sendMessage("❌ Failed to fetch aesthetic image. Please try again later.", threadID, messageID);
  }
};