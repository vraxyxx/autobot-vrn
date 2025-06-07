module.exports.config = {
  name: "vernavatar",
  version: "1.0.0",
  credits: "vern",
  description: "Get the profile picture of a user.",
  commandCategory: "Utility",
  usages: "[mention or userID]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  let userID = event.senderID;
  if (args.length) {
    if (event.mentions && Object.keys(event.mentions).length) userID = Object.keys(event.mentions)[0];
    else userID = args[0];
  }
  try {
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?type=large`;
    return api.sendMessage({ body: "Here is the profile picture:", attachment: await global.utils.getStream(avatarUrl) }, event.threadID);
  } catch {
    return api.sendMessage("Cannot fetch profile picture.", event.threadID);
  }
};
