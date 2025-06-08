module.exports.config = {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "1.0.0",
    credits: "Mirai Team",
    description: "Notify when the bot or a user leaves the group",
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

module.exports.run = async function({ api, event, Users, Threads }) {
    // Don't run if the bot itself left the group
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    const { createReadStream, existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const { threadID } = event;

    // Get thread data
    const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;

    // Get the name of the user who left
    const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);

    // Determine if the user left voluntarily or was removed by an admin
    const type = (event.author == event.logMessageData.leftParticipantFbId) ? "left voluntarily" : "was removed by an admin";

    // Paths for optional leave GIF
    const path = join(__dirname, "cache", "leaveGif");
    const gifPath = join(path, `${threadID}.gif`);

    let msg, formPush;

    // Create directory if it doesn't exist
    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    // Custom or default leave message
    msg = (typeof data.customLeave == "undefined") 
        ? "{name} has {type} the group" 
        : data.customLeave;

    // Replace placeholders with actual values
    msg = msg.replace(/\{name}/g, name).replace(/\{type}/g, type);

    // Check if a leave GIF exists for this group
    if (existsSync(gifPath)) {
        formPush = { body: msg, attachment: createReadStream(gifPath) };
    } else {
        formPush = { body: msg };
    }

    // Send the message
    return api.sendMessage(formPush, threadID);
};
