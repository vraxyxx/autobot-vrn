module.exports.config = {
  name: "vernweather",
  version: "1.0.0",
  credits: "vern",
  description: "Get current weather for any city.",
  commandCategory: "Utility",
  usages: "<city name>",
  cooldowns: 5
};

const axios = require("axios");

module.exports.run = async function({ api, event, args }) {
  if (!args.length) return api.sendMessage("Please specify a city name.", event.threadID);
  const city = args.join(" ");
  try {
    const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
    return api.sendMessage(`🌤 Weather for ${city}:\n${response.data}`, event.threadID);
  } catch {
    return api.sendMessage("Failed to get weather info.", event.threadID);
  }
};
