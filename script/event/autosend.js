module.exports.config = {
  name: "autosend",
  eventType: ["minutes"], // listens every minute event for checking time
  version: "0.0.1",
  credits: "vrax",
  description: "Automatically send a message at a specific time"
};

module.exports.run = async ({ event, api, Threads, Users }) => {
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Kolkata").format("HH:mm:ss");
  const cantsend = [];
  const allThread = global.data.allThreadID || [];

  // Send message exactly at 16:52:00 Asia/Kolkata time
  if (time === "16:52:00") {
    for (const idThread of allThread) {
      if (isNaN(parseInt(idThread)) || idThread === event.threadID) continue;

      // Sending a fixed test message; replace with your message content
      api.sendMessage("Test automatic message", idThread, (error) => {
        if (error) cantsend.push(idThread);
      });
    }

    // Notify bot admins if any errors occurred during sending
    if (cantsend.length > 0) {
      for (const adminId of global.config.ADMINBOT) {
        api.sendMessage(
          `Error when automatically sending messages to threads:\n${cantsend.join("\n")}`,
          adminId
        );
      }
    }
  }
};
