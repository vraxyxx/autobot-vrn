module.exports.config = {
  name: "vina",
  version: "1.2.6",
  permission: 0,
  credits: "Vern",
  description: "Ask AI with or without an image using Kaiz Gemini Vision API.",
  prefix: false,
  premium: false,
  category: "without prefix",
  usage: "ai <question> | reply to image with or without a question",
  cooldowns: 3,
  dependency: {
    "axios": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const { threadID, messageID, messageReply } = event;

  const API_ENDPOINT = "https://kaiz-apis.gleeze.com/api/gemini-vision";
  const API_KEY = ""; // Your own Kaiz Api
  const UID = Math.floor(Math.random() * 1000000).toString(); // Random UID

  try {
    const question = args.join(" ");
    let imageUrl = null;

    if (messageReply && messageReply.attachments.length > 0) {
      const attachment = messageReply.attachments[0];
      if (attachment.type === "photo" && attachment.url) {
        imageUrl = attachment.url;
      } else {
        return api.sendMessage("❌ Please reply to a valid photo.", threadID, messageID);
      }
    }

    if (!question && !imageUrl) {
      return api.sendMessage(
        "🧠 Homer AI Bot\n\n❌ Please provide a question or reply to an image.",
        threadID,
        messageID
      );
    }

    const queryParams = new URLSearchParams({
      q: question || "",
      uid: UID,
      imageUrl: imageUrl || "",
      apikey: API_KEY
    });

    const fullUrl = `${API_ENDPOINT}?${queryParams.toString()}`;
    const res = await axios.get(fullUrl);
    const result = res?.data?.response;

    if (!result) {
      return api.sendMessage("⚠️ No response received from the AI API.", threadID, messageID);
    }

    return api.sendMessage(
      `•| 𝙷𝙾𝙼𝙴𝚁 𝙰𝙸 𝙱𝙾𝚃 |•\n\n${result}\n\n•| 𝙾𝚆𝙽𝙴𝚁 : 𝙷𝙾𝙼𝙴𝚁 𝚁𝙴𝙱𝙰𝚃𝙸𝚂 |•`,
      threadID,
      messageID
    );

  } catch (error) {
    console.error("❌ AI Error:", error?.response?.data || error.message || error);
    return api.sendMessage("❌ An error occurred while processing your request. Please try again later.", threadID, messageID);
  }
};