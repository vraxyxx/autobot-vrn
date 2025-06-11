const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "eventstatus",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Show the status (active/inactive) of all events.",
  usage: "/eventstatus",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

const DATA_PATH = path.join(__dirname, "..", "data", "events.json");

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  // Read JSON data
  let data;
  try {
    data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (err) {
    return api.sendMessage("❌ Could not read events data file.", threadID, messageID);
  }

  let msg = "════『 𝗘𝗩𝗘𝗡𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 』════\n\n";
  for (const [eventName, info] of Object.entries(data)) {
    const state = info.active ? "🟢 Active" : "🔴 Inactive";
    msg += `• ${eventName.charAt(0).toUpperCase() + eventName.slice(1)}: ${state}\n`;
  }
  msg += "\n> All timestamps are UTC.";

  api.sendMessage(msg, threadID, messageID);
};