module.exports.config = {
  name: "vernremind",
  version: "1.0.0",
  credits: "vern",
  description: "Set a reminder message in seconds.",
  commandCategory: "Automation",
  usages: "<seconds> <message>",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const seconds = parseInt(args[0]);
  if (isNaN(seconds) || seconds < 1 || seconds > 3600) return api.sendMessage("Enter a time between 1 and 3600 seconds.", event.threadID);
  const reminderMessage = args.slice(1).join(" ");
  if (!reminderMessage) return api.sendMessage("Specify a reminder message.", event.threadID);

  api.sendMessage(`⏰ Reminder set for ${seconds} seconds from now.`, event.threadID);

  setTimeout(() => {
    api.sendMessage(`⏰ Reminder: ${reminderMessage}`, event.threadID);
  }, seconds * 1000);
};
