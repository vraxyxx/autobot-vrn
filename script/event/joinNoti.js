module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.4",
    credits: "vern",
    description: "Notify when the bot or a user joins the group",
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.run = async function({ api, event, Users }) {
    const { join } = global.nodemodule["path"];
    const { threadID } = event;

    // If the bot itself was added to the group
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        api.changeNickname(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? "Made by CatalizCS and SpermLord" : global.config.BOTNAME}`, threadID, api.getCurrentUserID());
        return api.sendMessage(`Connected successfully! This bot was made by CatalizCS and SpermLord\nThank you for using our product, have fun UwU <3`, threadID);
    } else {
        try {
            const { createReadStream, existsSync, mkdirSync } = global.nodemodule["fs-extra"];
            let { threadName, participantIDs } = await api.getThreadInfo(threadID);

            const threadData = global.data.threadData.get(parseInt(threadID)) || {};
            const path = join(__dirname, "cache", "joinGif");
            const pathGif = join(path, `${threadID}.gif`);

            let mentions = [], nameArray = [], memLength = [], i = 0;

            // Loop through new participants
            for (id in event.logMessageData.addedParticipants) {
                const userName = event.logMessageData.addedParticipants[id].fullName;
                nameArray.push(userName);
                mentions.push({ tag: userName, id });
                memLength.push(participantIDs.length - i++);

                // Add user to global data if not already present
                if (!global.data.allUserID.includes(id)) {
                    await Users.createData(id, { name: userName, data: {} });
                    global.data.userName.set(id, userName);
                    global.data.allUserID.push(id);
                }
            }

            memLength.sort((a, b) => a - b);

            // Use custom or default welcome message
            let msg = (typeof threadData.customJoin == "undefined")
                ? "Welcome aboard {name}.\nWelcome to {threadName}.\nYou are member number {soThanhVien} 🥳"
                : threadData.customJoin;

            msg = msg
                .replace(/\{name}/g, nameArray.join(', '))
                .replace(/\{type}/g, (memLength.length > 1) ? 'you all' : 'you')
                .replace(/\{soThanhVien}/g, memLength.join(', '))
                .replace(/\{threadName}/g, threadName);

            if (!existsSync(path)) mkdirSync(path, { recursive: true });

            let formPush;
            if (existsSync(pathGif)) {
                formPush = { body: msg, attachment: createReadStream(pathGif), mentions };
            } else {
                formPush = { body: msg, mentions };
            }

            return api.sendMessage(formPush, threadID);
        } catch (e) {
            return console.log(e);
        }
    }
};
