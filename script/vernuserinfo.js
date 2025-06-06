module.exports.config = {
  name: "vernuserinfo",
  version: "1.0.0",
  credits: "vern",
  description: "Get info about a user by mention or ID.",
  commandCategory: "Utility",
  usages: "[mention or userID]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users }) {
  let userID = event.senderID;
  if (args.length) {
    if (event.mentions && Object.keys(event.mentions).length) userID = Object.keys(event.mentions)[0];
    else userID = args[0];
  }
  try {
    const userInfo = await Users.getUserInfo(userID);
    const name = userInfo.name || "Unknown";
    const gender = userInfo.gender === 2 ? "Male" : userInfo.gender === 1 ? "Female" : "Unknown";
    const birthday = userInfo.birthday || "Not set";

    const msg = `👤 Name: ${name}\n⚧ Gender: ${gender}\n🎂 Birthday: ${birthday}\n🆔 UserID: ${userID}`;
    return api.sendMessage(msg, event.threadID);
  } catch {
    return api.sendMessage("User not found or cannot fetch info.", event.threadID);
  }
};
