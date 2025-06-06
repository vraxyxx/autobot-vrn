module.exports.config = {
  name: "2north",
  version: "1.0.0",
  credits: "vern",
  description: "Describe all members in the group chat.",
  commandCategory: "Group",
  usages: "",
  cooldowns: 10
};

module.exports.run = async function({ api, event, Threads, Users }) {
  try {
    const threadID = event.threadID;

    // Get thread info
    const threadInfo = await Threads.getInfo(threadID);
    const memberIDs = threadInfo.participantIDs;

    // Prepare list of members with their names
    const members = await Promise.all(
      memberIDs.map(async (id) => {
        const name = await Users.getNameUser(id);
        return `- ${name}`;
      })
    );

    const msg = `👥 Members of this group (${memberIDs.length}):\n${members.join("\n")}`;

    return api.sendMessage(msg, threadID);
  } catch (error) {
    console.error(error);
    return api.sendMessage("Failed to get group members.", event.threadID);
  }
};
