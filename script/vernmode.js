module.exports.config = {
  name: "vernmode",
  version: "1.0.0",
  credits: "vern",
  description: "Toggle Vern Mode ON or OFF. When ON, the bot auto-replies and reacts to messages.",
  commandCategory: "Settings",
  usages: "<on/off>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    if (!args.length) 
      return api.sendMessage("Please specify 'on' or 'off' to toggle Vern Mode.", event.threadID);

    const mode = args[0].toLowerCase();
    if (mode !== "on" && mode !== "off") 
      return api.sendMessage("Invalid option. Use 'on' or 'off'.", event.threadID);

    const threadID = event.threadID;
    const threadData = global.data.threadData.get(threadID) || {};
    threadData.vernMode = (mode === "on");
    global.data.threadData.set(threadID, threadData);

    return api.sendMessage(`Vern Mode has been turned ${mode.toUpperCase()}!`, threadID);
  } catch (error) {
    console.error(error);
  }
};
