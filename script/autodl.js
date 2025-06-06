const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "autodl",
    version: "1.0.0",
    author: "You",
    description: "Automatically downloads videos from URLs in messages. Toggle with /autodl [on|off] (Admin only).",
    cooldowns: 5,
    dependencies: {
      "axios": "",
      "fs-extra": ""
    }
  },

  onMessage: async function ({ api, event, usersData }) {
    const { threadID, messageID, body, type } = event;

    // Path to config file
    const configPath = path.resolve(__dirname, "../config/autodl_config.json");

    let config = { enabled: true };
    if (fs.existsSync(configPath)) {
      config = await fs.readJson(configPath);
    } else {
      await fs.writeJson(configPath, config);
    }

    if (!config.enabled) return;

    if (type !== "message" && type !== "message_reply") return;

    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = body.match(urlRegex);
    if (!match) return;

    const url = match[0];

    try {
      await api.sendMessage(
        `════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n⏳ Downloading media from URL: ${url}\n\n> Thank you for using our bot`,
        threadID,
        messageID
      );

      const apiUrl = `https://cid-kagenou-api-production.up.railway.app/api/alldl?url=${encodeURIComponent(url)}`;
      const apiResponse = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      const data = apiResponse.data;

      if (!data.status || !data.result || !data.result.data || !data.result.data.high) {
        throw new Error("API did not return a valid video URL.");
      }

      const videoUrl = data.result.data.high;
      const videoTitle = data.result.data.title || "Untitled Video";

      const videoResponse = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream"
      });

      const videoPath = path.resolve(__dirname, "../temp/autodl_video.mp4");
      const videoWriter = fs.createWriteStream(videoPath);
      videoResponse.data.pipe(videoWriter);

      await new Promise((resolve, reject) => {
        videoWriter.on("finish", resolve);
        videoWriter.on("error", reject);
      });

      const videoStats = fs.statSync(videoPath);
      if (videoStats.size === 0) throw new Error("Downloaded video file is empty");

      const videoMessage =
        `════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n` +
        `✅ Video downloaded successfully!\n\n` +
        `📹 Title: ${videoTitle}\n\n` +
        `🎥 Video (MP4) Attachment Below:\n\n` +
        `> Thank you for using our bot`;

      const videoStream = fs.createReadStream(videoPath);
      await api.sendMessage(
        {
          body: videoMessage,
          attachment: videoStream
        },
        threadID,
        messageID
      );

      fs.unlinkSync(videoPath);
    } catch (error) {
      console.error("Error in autodl:", error.message);
      const errorMessage =
        `════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n` +
        `❌ Failed to download media.\n` +
        `Error: ${error.message}\n\n` +
        `> Thank you for using our bot`;

      await api.sendMessage(errorMessage, threadID, messageID);
    }
  },

  run: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;

    // Check if sender is admin
    const isAdmin = usersData.adminIDs?.includes(senderID);
    if (!isAdmin) {
      return api.sendMessage(
        "════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n❌ Only admins can toggle this command.",
        threadID,
        messageID
      );
    }

    const configPath = path.resolve(__dirname, "../config/autodl_config.json");
    let config = { enabled: true };
    if (fs.existsSync(configPath)) {
      config = await fs.readJson(configPath);
    } else {
      await fs.writeJson(configPath, config);
    }

    const toggle = args[0]?.toLowerCase();

    if (toggle === "on") {
      if (config.enabled) {
        return api.sendMessage(
          "════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n✅ Autodl is already enabled.",
          threadID,
          messageID
        );
      }
      config.enabled = true;
      await fs.writeJson(configPath, config);
      return api.sendMessage(
        "════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n✅ Autodl has been enabled.",
        threadID,
        messageID
      );
    }

    if (toggle === "off") {
      if (!config.enabled) {
        return api.sendMessage(
          "════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n✅ Autodl is already disabled.",
          threadID,
          messageID
        );
      }
      config.enabled = false;
      await fs.writeJson(configPath, config);
      return api.sendMessage(
        "════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n✅ Autodl has been disabled.",
        threadID,
        messageID
      );
    }

    return api.sendMessage(
      "════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n📜 Usage: /autodl [on|off]\n\n> Thank you for using our bot",
      threadID,
      messageID
    );
  }
};
