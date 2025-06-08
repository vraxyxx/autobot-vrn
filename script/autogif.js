const axios = require("axios");

module.exports.config = {
  name: "autogif",
  version: "1.0.0",
  author: "vern",
  description: "Auto-sends a random 'kiss' GIF to the chat as an event command.",
  event: true,
  cooldowns: 0,
  commandCategory: "event",
  dependencies: {
    axios: ""
  }
};

// This function will auto-trigger on each event, not by command!
module.exports.run = async function ({ api, event }) {
  const { threadID } = event;

  try {
    const apiUrl = "https://kaiz-apis.gleeze.com/api/gif-tenor?search=kiss&limit=20&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5";
    const response = await axios.get(apiUrl);

    // The API usually returns an array of GIF URLs in result or urls
    let gifs = [];
    if (Array.isArray(response.data?.result)) {
      gifs = response.data.result;
    } else if (Array.isArray(response.data?.urls)) {
      gifs = response.data.urls;
    }

    if (!gifs.length) return;

    // Pick a random gif
    const gifUrl = gifs[Math.floor(Math.random() * gifs.length)];

    // Stream the GIF
    const gifStream = await axios.get(gifUrl, { responseType: "stream" });

    // Send as a gif to the thread
    return api.sendMessage({
      body: "💝 Here’s a sweet kiss GIF for you all! 💝",
      attachment: gifStream.data
    }, threadID);

  } catch (error) {
    // Errors are silenced for auto event commands
    console.error("❌ AutoGif event error:", error.message || error);
    return;
  }
};