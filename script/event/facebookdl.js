const axios = require("axios");

module.exports.config = {
  name: "facebookdl",
  eventType: ["message"],
  version: "1.0.0",
  credits: "vern",
  description: "Auto-detect Facebook URLs and fetch downloadable media"
};

module.exports.handleEvent = async function ({ event, api }) {
  const { body, threadID, messageID } = event;

  if (!body) return;

  const fbRegex = /https?:\/\/(?:www\.)?facebook\.com\/[^\s]+/gi;
  const fbLinks = body.match(fbRegex);
  if (!fbLinks) return;

  for (const url of fbLinks) {
    try {
      const apiUrl = `https://ace-rest-api.onrender.com/api/facebookv2?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl);

      const result = data.result || data;

      if (!result || (!result.video && !result.image)) {
        await api.sendMessage(`❌ No downloadable media found for the Facebook link.`, threadID, messageID);
        continue;
      }

      let msg = `📥 Facebook Media Found:\n\n`;
      if (result.caption) msg += `📝 Caption: ${result.caption}\n`;
      if (result.video) msg += `🎥 Video: ${result.video}\n`;
      if (result.image) msg += `🖼️ Image: ${result.image}\n`;

      msg += `\n🔗 Original: ${url}`;
      await api.sendMessage(msg, threadID, messageID);

    } catch (error) {
      console.error("❌ FacebookDL Error:", error.message || error);
      await api.sendMessage("⚠️ Error fetching Facebook media. Link may be private or unsupported.", threadID, messageID);
    }
  }
};
