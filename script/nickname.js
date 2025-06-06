const config = require("../config.json");

module.exports.config = {
    name: "nickname",
    version: "1.0.0",
    role: 0,
    description: "Automatically sets the bot's nickname when added to a group.",
    prefix: false,
    premium: false,
    credits: "Original Author",
    cooldowns: 0,
    category: "system",
    handleEvent: true
};

module.exports.handleEvent = async function ({ api, event }) {
    try {
        if (
            event.logMessageType === "log:subscribe" &&
            event.logMessageData.addedParticipants.some(user => user.userFbId === api.getCurrentUserID())
        ) {
            const botID = api.getCurrentUserID();
            const botName = config.botName || "Bot";

            api.changeNickname(botName, event.threadID, botID, (err) => {
                if (err) console.error("❌ Failed to set nickname:", err);
            });
        }
    } catch (error) {
        console.error("❌ Error in nickname event handler:", error);
    }
};
