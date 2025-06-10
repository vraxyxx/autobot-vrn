const axios = require("axios");

const fs = require("fs-extra");

const path = require("path");

module.exports = {

  name: "autodl",

  handleEvent: true,

  description: "Automatically downloads videos from URLs in messages. Toggle with /autodl [on|off] (Admin only).",

  async handleEvent({ api, event, admins }) {

    const { threadID, messageID, body } = event;

    // Path to store toggle state

    const configPath = path.join(__dirname, "../config/autodl_config.json");

      let config = { enabled: true }; // Default: enabled

    if (fs.existsSync(configPath)) {

      config = await fs.readJson(configPath);

    } else {

      await fs.writeJson(configPath, config);

    }

    // If disabled, exit silently

    if (!config.enabled) {

      return;

    }

    // Only proceed for regular messages or message replies

    if (event.type !== "message" && event.type !== "message_reply") return;

    // Regular expression to match URLs

    const urlRegex = /(https?:\/\/[^\s]+)/;

    const match = body.match(urlRegex);

    // If no URL is found, do nothing

    if (!match) return;

    const url = match[0];

    try {

      // Send a message to indicate the download is starting

      await api.sendMessage(

        `════『 �_A𝗨𝗧𝗢𝗗𝗟 』════\n\n⏳ Downloading media from URL: ${url}\n\n> Thank you for using our Cid Kagenou bot`,

        threadID,

        messageID

      );

      // Fetch the API response (JSON)

      const apiUrl = `https://cid-kagenou-api-production.up.railway.app/api/alldl?url=${encodeURIComponent(url)}`;

      const apiResponse = await axios.get(apiUrl, {

        headers: {

          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",

        },

      });

      const data = apiResponse.data;

      // Check if the API response is successful and contains video

      if (!data.status || !data.result || !data.result.data || !data.result.data.high) {

        throw new Error("API did not return a valid video URL. For TikTok URLs (e.g., vm.tiktok.com), try using the full URL (e.g., https://www.tiktok.com/@username/video/id).");

      }

      const videoUrl = data.result.data.high;

      const videoTitle = data.result.data **(data.result.data.title || "Untitled Video"); // Fallback if title is missing**

      // Download the video

      const videoResponse = await axios({

        url: videoUrl,

        method: "GET",

        responseType: "stream",

      });

      const videoPath = path.join(__dirname, "../temp/autodl_video.mp4");

      const videoWriter = fs.createWriteStream(videoPath);

      videoResponse.data.pipe(videoWriter);

      await new Promise((resolve, reject) => {

        videoWriter.on("finish", resolve);

        videoWriter.on("error", reject);

      });

      // Verify the video file exists and has size

      const videoStats = fs.statSync(videoPath);

      if (videoStats.size === 0) {

        throw new Error("Downloaded video file is empty");

      }

      // Construct the success message for the video

      let videoMessage = `════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n`;

      videoMessage += `✅ Video downloaded successfully!\n\n`;

      videoMessage += `📹 Title: ${videoTitle}\n\n`;

      videoMessage += `🎥 Video (MP4) Attachment Below:\n\n`;

      videoMessage += `> Thank you for using our Cid Kagenou bot`;

      // Send the video attachment

      const videoStream = fs.createReadStream(videoPath);

      await api.sendMessage(

        {

          body: videoMessage,

          attachment: videoStream,

        },

        threadID,

        messageID

      );

      // Clean up the temporary file

      fs.unlinkSync(videoPath);

    } catch (error) {

      console.error("❌ Error in autodl event:", error.message);

      let errorMessage = `════『 𝗔�_U𝗧𝗢𝗗𝗟 』════\n\n`;

      errorMessage += `  ┏━━━━━━━┓\n`;

      errorMessage += `  ┃ 『 𝗜𝗡𝗙𝗢 』 Failed to download media.\n`;

      errorMessage += `  ┃ Error: ${error.message}\n`;

      errorMessage += `  ┗━━━━━━━┛\n\n`;

      errorMessage += `> Thank you for using our Cid Kagenou bot`;

      api.sendMessage(errorMessage, threadID, messageID);

    }

  },

  async run({ api, event, args, admins }) {

    const { threadID, messageID, senderID } = event;

    // Check if the user is an admin

    if (!admins.includes(senderID)) {

      return api.sendMessage(

        "════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n❌ Only admins can toggle this command.",

        threadID,

        messageID

      );

    }

    // Path to store toggle state

    const configPath = path.join(__dirname, "../config/autodl_config.json");

    // Load or initialize config

    let config = { enabled: true }; // Default: enabled

    if (fs.existsSync(configPath)) {

      config = await fs.readJson(configPath);

    } else {

      await fs.writeJson(configPath, config);

    }

    // Handle toggle commands

    if (args[0] && args[0].toLowerCase() === "on") {

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

    if (args[0] && args[0].toLowerCase() === "off") {

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

    // If no valid toggle command, inform usage

    return api.sendMessage(

      "════『 𝗔𝗨𝗧𝗢𝗗𝗟 』════\n\n📜 Usage: /autodl [on|off]\n\n> Thank you for using our Cid Kagenou bot",

      threadID,

      messageID

    );

  },

};