module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "vern",
  description: "Notify when someone leaves the thread."
};

module.exports.run = async function({ api, event, Users, Threads }) {
  try {
    // If the current user left, ignore
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    const threadID = event.threadID;
    const leftID = event.logMessageData.leftParticipantFbId;

    // Get thread data
    const threadData = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;

    // Get the name of the user who left
    const name = global.data.userName.get(leftID) || await Users.getNameUser(leftID);

    // Determine the type of leave message depending on who left
    const type = (event.author == leftID) 
      ? "FLY HIGH ingat sa byahe haha" 
      : "tanga mo kasi sarap mong sapakin";

    // Use custom leave message if available
    let msg = typeof threadData.customLeave === "undefined" 
      ? "fly high {name}, {type}" 
      : threadData.customLeave;

    // Replace placeholders
    msg = msg.replace(/\{name}/g, name).replace(/\{type}/g, type);

    // Prepare message
    const formPush = { body: msg };

    // Send leave notification
    return api.sendMessage(formPush, threadID);

  } catch (err) {
    // Silently ignore errors or log if you want:
    // console.error(err);
  }
};
