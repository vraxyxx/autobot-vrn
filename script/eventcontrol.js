const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "eventcontrol",
  version: "1.0.0",
  role: 1,
  credits: "vern",
  description: "Activate or deactivate an event (e.g. rain, disco, etc).",
  usage: "/eventcontrol <event> <on|off>",
  prefix: true,
  cooldowns: 3,
  commandCategory: "Utility"
};

const DATA_PATH = path.join(__dirname, "..", "data", "events.json");

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/"; // Adjust if your bot uses a different prefix

  if (args.length < 2) {
    const usageMessage =
      `════『 𝗘𝗩𝗘𝗡𝗧 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 』════\n\n` +
      `⚠️ Please provide an event name and "on" or "off".\n\n` +
      `📌 Usage: ${prefix}eventcontrol <event> <on|off>\n` +
      `💬 Example: ${prefix}eventcontrol rain on\n\n` +
      `> Supported events (default): blackhole, bloodnight, disco, frost, jandelstorm, meteorshower, rain, snow, thunderstorm.`;
    return api.sendMessage(usageMessage, threadID, messageID);
  }

  const eventName = args[0].toLowerCase();
  const action = args[1].toLowerCase();

  // Read JSON data
  let data;
  try {
    data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (err) {
    return api.sendMessage("❌ Could not read events data file.", threadID, messageID);
  }

  if (!(eventName in data)) {
    return api.sendMessage(`❌ Unknown event: ${eventName}\nCheck /eventstatus for event names.`, threadID, messageID);
  }

  if (action !== "on" && action !== "off") {
    return api.sendMessage("❌ Action must be 'on' or 'off'.", threadID, messageID);
  }

  // Set active state and update timestamp
  data[eventName].active = action === "on";
  data[eventName].timestamp = new Date().toISOString();

  // Save JSON data
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    return api.sendMessage("❌ Failed to update event data.", threadID, messageID);
  }

  return api.sendMessage(
    `✅ Event "${eventName}" is now ${action === "on" ? "🟢 active" : "🔴 inactive"}.\n\nTimestamp: ${data[eventName].timestamp}`,
    threadID,
    messageID
  );
};