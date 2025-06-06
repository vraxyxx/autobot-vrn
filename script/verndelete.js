module.exports.config = {
  name: "verndelete",
  version: "1.0.0",
  credits: "vern",
  description: "Delete recent bot messages from this thread.",
  commandCategory: "Automation",
  usages: "<count>",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const count = parseInt(args[0]);
  if (isNaN(count) || count < 1 || count > 20) return api.sendMessage("Specify a number between 1 and 20.", event.threadID);

  try {
    const messages = await api.getThreadHistory(event.threadID, count + 50);
    const botID = api.getCurrentUserID();
    const msgIDsToDelete = [];

    for (const msg of messages) {
      if (msg.senderID == botID && msg.messageID && msgIDsToDelete.length < count) {
        msgIDsToDelete.push(msg.messageID);
      }
    }

    if (msgIDsToDelete.length === 0) return api.sendMessage("No bot messages found to delete.", event.threadID);

    await api.unsendMessages(msgIDsToDelete);
    return api.sendMessage(`Deleted ${msgIDsToDelete.length} bot messages.`, event.threadID);
  } catch (e) {
    return api.sendMessage("Failed to delete messages.", event.threadID);
  }
};
