const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "vern",
    description: "Upload an image to Imgur and get the link.",
    commandCategory: "utility",
    usages: "[reply or image URL]",
    prefix: true,
    cooldowns: 5,
    dependencies: {
      axios: ""
    }
  },

  run: async function({ api, event, args }) {
    let linkanh = null;
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0] && event.messageReply.attachments[0].url) {
      linkanh = event.messageReply.attachments[0].url;
    } else if (args.length > 0) {
      linkanh = args[0];
    }

    if (!linkanh) {
      return api.sendMessage(
        "❗ Please reply to an image or provide a direct image URL.\nUsage: /imgur [image_url or reply to image]",
        event.threadID,
        event.messageID
      );
    }

    try {
      const res = await axios.get(`https://imgur-api-by-koja.xx0xkoja.repl.co/imgur?link=${encodeURIComponent(linkanh)}`);
      const img = res?.data?.uploaded?.image;
      if (!img) {
        return api.sendMessage("❌ Failed to upload image to Imgur.", event.threadID, event.messageID);
      }
      return api.sendMessage(`✅ Imgur link: ${img}`, event.threadID, event.messageID);
    } catch (err) {
      console.error("Error in imgur command:", err);
      return api.sendMessage(
        `❌ Failed to upload image to Imgur.\nError: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};