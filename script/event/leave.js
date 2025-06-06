module.exports.config = {
        name: "leave",
        eventType: ["log:unsubscribe"],
        version: "1.0.0",
        credits: "vern",
        description: "notify leave.",
};

module.exports.run = async function({ api, event, Users, Threads }) {
        try {
        if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
        const { threadID } = event;
        const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
        const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
        const type = (event.author == event.logMessageData.leftParticipantFbId) ? "FLY HIGH ingat sa byahe haha" : tanga mo kasi sarap mong sapakin";
        var msg, formPush
        (typeof data.customLeave == "undefined") ? msg = "fly high {name}, {type}" : msg = data.customLeave;
        msg = msg.replace(/\{name}/g, name).replace(/\{type}/g, type);

        var formPush = { body: msg }

        return api.sendMessage(formPush, threadID);
    } catch (err) {}
}