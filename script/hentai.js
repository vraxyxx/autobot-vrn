const axios = require("axios");

module.exports.config = {
  name: "hentai",
  version: "1.0.0",
  author: "vern",
  description: "Get a random NSFW hentai image (or multiple images).",
  prefix: true,
  cooldowns: 5,
  commandCategory: "nsfw",
  dependencies: {
    axios: ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  // Optional: allow user to specify a limit, default to 1
  let limit = 1;
  if (args[0] && !isNaN(Number(args[0]))) {
    limit = Math.max(1, Math.min(20, Number(args[0])));
  }

  try {
    // Send loading message
    await api.sendMessage("🔞 Fetching random hentai image(s), please wait...", threadID, messageID);

    const apiUrl = `https://kaiz-apis.gleeze.com/api/hentai?limit=${limit}&apikey=4fe7e522-70b7-420b-a746-d7a23db49ee5`;
    const response = await axios.get(apiUrl);

    let images = [];
    // API might return {result: [array of urls]} or {url: ...}
    if (Array.isArray(response.data?.result)) {
      images = response.data.result;
    } else if (Array.isArray(response.data?.urls)) {
      images = response.data.urls;
    } else if (typeof response.data?.url === "string") {
      images = [response.data.url];
    }

    if (images.length === 0) {
      return api.sendMessage("❌ No hentai images found.", threadID, messageID);
    }

    // Prepare attachments (stream each image)
    const attachments = [];
    for (const imgUrl of images) {
      try {
        const imgStream = await axios.get(imgUrl, { responseType: "stream" });
        attachments.push(imgStream.data);
      } catch (e) {
        // Ignore and skip broken images
      }
    }

    if (attachments.length === 0) {
      return api.sendMessage("❌ Failed to fetch hentai image(s).", threadID, messageID);
    }

    return api.sendMessage({
      body: `🔞 Here ${attachments.length > 1 ? "are your hentai images" : "is your hentai image"}!`,
      attachment: attachments
    }, threadID, messageID);

  } catch (error) {
    console.error("❌ Error in hentai command:", error.message || error);
    return api.sendMessage(
      `❌ Failed to fetch hentai image(s).\nError: ${error.response?.data?.message || error.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};