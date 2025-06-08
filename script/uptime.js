const axios = require("axios");

module.exports.config = {
  name: "uptime",
  version: "1.0.0",
  author: "vern",
  description: "Show the bot's uptime, stats, and related info.",
  prefix: true,
  cooldowns: 5,
  commandCategory: "info",
  dependencies: {
    axios: ""
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  // Customize the parameters as needed or make them dynamic
  const params = {
    instag: "vern",
    ghub: "vernesg",
    fb: "vern",
    hours: 24,
    minutes: 60,
    seconds: 60,
    botname: "vernx",
    apikey: "4fe7e522-70b7-420b-a746-d7a23db49ee5"
  };

  const apiUrl = `https://kaiz-apis.gleeze.com/api/uptime?instag=${encodeURIComponent(params.instag)}&ghub=${encodeURIComponent(params.ghub)}&fb=${encodeURIComponent(params.fb)}&hours=${params.hours}&minutes=${params.minutes}&seconds=${params.seconds}&botname=${encodeURIComponent(params.botname)}&apikey=${params.apikey}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.result) {
      return api.sendMessage(
        "❌ Failed to retrieve uptime information.",
        threadID,
        messageID
      );
    }

    let msg = `🤖 ${params.botname} Uptime Info:\n\n`;

    if (typeof data.result === "string") {
      msg += data.result;
    } else if (typeof data.result === "object") {
      for (const key in data.result) {
        msg += `• ${key}: ${data.result[key]}\n`;
      }
    } else {
      msg += JSON.stringify(data.result, null, 2);
    }

    return api.sendMessage(msg.trim(), threadID, messageID);
  } catch (err) {
    console.error("Error in uptime command:", err.message || err);
    return api.sendMessage(
      `❌ Failed to fetch uptime data.\nError: ${err.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};