const axios = require('axios');

module.exports.config = {
  name: "pinterest",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Search and fetch images from Pinterest using the Kaiz API.",
  usage: "/pinterest <search query>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Images"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ').trim();
  const prefix = "/"; // Change if your bot uses a dynamic prefix

  // No query given
  if (!query) {
    const usageMessage = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n` +
      `⚠️ Please provide a search term for Pinterest images.\n\n` +
      `📌 Usage: ${prefix}pinterest <search query>\n` +
      `🖼️ Example: ${prefix}pinterest aesthetic icon\n\n` +
      `> Thank you for using the Pinterest image search!`;

    return api.sendMessage(usageMessage, threadID, messageID);
  }

  try {
    // Send loading message first
    const waitMsg = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n` +
      `🔎 Searching images for: "${query}"\nPlease wait a moment...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    // Call the Pinterest Search API
    const apiUrl = "https://kaiz-apis.gleeze.com/api/pinterest";
    const response = await axios.get(apiUrl, {
      params: {
        search: query,
        apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
      }
    });

    // Format results
    const images = response.data?.data || [];
    if (!images.length) {
      return api.sendMessage(
        `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n❌ No results found for "${query}".`,
        threadID,
        messageID
      );
    }

    let resultsMsg = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 』════\n\n` +
      `🖼️ Images for: "${query}"\n\n` +
      `> Powered by Kaiz Pinterest API`;

    // Send first image as preview, rest as links (limit to 5 for demonstration)
    const attachments = [];
    for (let i = 0; i < Math.min(images.length, 5); i++) {
      const image = images[i];
      attachments.push(image); // For api.sendMessage({ attachment: ... })
    }

    return api.sendMessage(
      {
        body: resultsMsg,
        attachment: attachments
      },
      threadID,
      messageID
    );

  } catch (error) {
    console.error('❌ Error in pinterest command:', error.message || error);

    const errorMessage = `════『 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗘𝗥𝗥𝗢𝗥 』════\n\n` +
      `🚫 Failed to search Pinterest.\nReason: ${error.response?.data?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID, messageID);
  }
};