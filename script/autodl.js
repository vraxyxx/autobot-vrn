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
      axios: "",
      "fs-extra": ""
    }
  },

  onMessage: async function ({ api, event, usersData }) {
    const { threadID, messageID, body, type } = event;

    // Ensure body exists
    if (!body) return;

    // Path to config file
    const configPath = path.resolve(__dirname, "../config/autodl_config.json");

    let config = { enabled: true };
    try {
      if (fs.existsSync(configPath)) {
        config = await fs.readJson(configPath);
      } else {
        await fs.writeJson(configPath, config);
      }
    } catch (err) {
      console.error("Error reading/writing config:", err);
      return;
    }

    if (!config.enabled) return;

    // Only proceed for normal messages or replies
    if (type !== "message" && type !== "message_reply") return;

    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = body.match(urlRegex);
    if (!match) return;

    const url = match[0];

    try {
      await api.sendMessage(
        `════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n⏳ Downloading media from URL: ${url}`,
        threadID,
        messageID
      );

      const apiUrl = `https://cid-kagenou-api-production.up.railway.app/api/alldl?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      if (!data?.status || !data?.result?.data?.high) {
        throw new Error("API did not return a valid video URL.");
      }

      const videoUrl = data.result.data.high;
      const title = data.result.data.title || "Untitled Video";

      const videoPath = path.resolve(__dirname, `../temp/autodl_${Date.now()}.mp4`);

      const writer = fs.createWriteStream(videoPath);
      const response = await axios({ url: videoUrl, method: "GET", responseType: "stream" });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const stats = fs.statSync(videoPath);
      if (stats.size === 0) throw new Error("Downloaded video is empty.");

      await api.sendMessage(
        {
          body: `════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n✅ Video downloaded!\n📹 Title: ${title}`,
          attachment: fs.createReadStream(videoPath)
        },
        threadID,
        messageID
      );

      fs.unlinkSync(videoPath);
    } catch (err) {
      console.error("AutoDL Error:", err.message);
      await api.sendMessage(
        `════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n❌ Failed to download media.\nError: ${err.message}`,
        threadID,
        messageID
      );
    }
  },

  run: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;

    // Admin check
    const isAdmin = usersData?.adminIDs?.includes(senderID);
    if (!isAdmin) {
      return api.sendMessage(
        "❌ Only admins can toggle AutoDL.",
        threadID,
        messageID
      );
    }

    const configPath = path.resolve(__dirname, "../config/autodl_config.json");

    let config = { enabled: true };
    try {
      if (fs.existsSync(configPath)) {
        config = await fs.readJson(configPath);
      } else {
        await fs.writeJson(configPath, config);
      }
    } catch (err) {
      return api.sendMessage(`Error reading config: ${err.message}`, threadID, messageID);
    }

    const toggle = args[0]?.toLowerCase();

    if (toggle === "on") {
      if (config.enabled) {
        return api.sendMessage("✅ AutoDL is already enabled.", threadID, messageID);
      }
      config.enabled = true;
      await fs.writeJson(configPath, config);
      return api.sendMessage("✅ AutoDL has been enabled.", threadID, messageID);
    }

    if (toggle === "off") {
      if (!config.enabled) {
        return api.sendMessage("✅ AutoDL is already disabled.", threadID, messageID);
      }
      config.enabled = false;
      await fs.writeJson(configPath, config);
      return api.sendMessage("✅ AutoDL has been disabled.", threadID, messageID);
    }

    return api.sendMessage("📜 Usage: /autodl [on|off]", threadID, messageID);
  }
};
