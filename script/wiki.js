const axios = require("axios");

module.exports.config = {
  name: "wiki",
  version: "1.0",
  role: 0,
  author: "Vern",
  credits: "favinna",
  aliases: ["wikipedia", "wikifetch"],
  countDown: 3,
  longDescription: "Get Wikipedia summary for a given topic.",
  category: "info",
  usages: "< your query >",
  cooldown: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage("❌ Please enter a topic to search on Wikipedia.", threadID, messageID);
  }

  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/wiki?q=${encodeURIComponent(query)}`;

  try {
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.extract) {
      return api.sendMessage("❌ No information found for the given query.", threadID, messageID);
    }

    const image = data.thumbnail?.source || null;
    const title = data.title || "Wikipedia";
    const description = data.description || "No short description available.";
    const pageUrl = data.content_urls?.desktop?.page || "";

    let messageBody = `📚 Title: ${title}\n📝 Description: ${description}\n🌐 Read more: ${pageUrl}\n\n${data.extract}`;

    if (image) {
      const imageStream = await global.utils.getStreamFromURL(image);
      return api.sendMessage({
        body: messageBody,
        attachment: imageStream
      }, threadID, messageID);
    } else {
      return api.sendMessage(messageBody, threadID, messageID);
    }

  } catch (error) {
    console.error("wiki error:", error.message);
    return api.sendMessage("❌ An error occurred while fetching data from Wikipedia.", threadID, messageID);
  }
};