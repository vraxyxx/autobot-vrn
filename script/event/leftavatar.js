const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "leftavatar",
  eventType: ['log:unsubscribe'],
  version: "1.0.0",
  credits: "vern",
  description: "Send the Facebook avatar of the user who left the group."
};

module.exports.run = async function ({ api, event }) {
  const { threadID, logMessageData } = event;
  const leftParticipantFbId = logMessageData.leftParticipantFbId;

  if (!leftParticipantFbId) return;

  const apiUrl = `https://graph.facebook.com/${leftParticipantFbId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  try {
    const waitMsg = `📤 Fetching avatar for user who left (ID: ${leftParticipantFbId})...`;
    await api.sendMessage(waitMsg, threadID);

    const response = await axios.get(apiUrl, { responseType: "stream" });
    return api.sendMessage(
      {
        body: `Here is the Facebook avatar of the user who left (ID: ${leftParticipantFbId}).\n\n> Powered by Facebook Graph API`,
        attachment: response.data
      },
      threadID
    );
  } catch (error) {
    console.error('❌ Error in leftavatar event:', error.message || error);

    const errorMessage =
      `🚫 Failed to fetch the avatar for the left user.\nReason: ${error.response?.data?.error?.message || error.message || 'Unknown error'}\n\n` +
      `> Please try again later.`;

    return api.sendMessage(errorMessage, threadID);
  }
};