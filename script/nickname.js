const config = require("../config.json");

module.exports = {

    name: "nickname",

    handleEvent: true,

    async handleEvent({ api, event }) {

        if (

            event.logMessageType === "log:subscribe" &&

            event.logMessageData.addedParticipants.some(user => user.userFbId === api.getCurrentUserID())

        ) {

            try {

                const botID = api.getCurrentUserID();

                const botName = config.botName || "Bot";





                api.changeNickname(botName, event.threadID, botID, (err) => {

                    if (err) console.error("Failed to set nickname:", err);

                });

            } catch (error) {

                console.error("Error in nickname event:", error);

            }

        }

    }

};