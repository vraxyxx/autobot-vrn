const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: 'imgur',
  version: '1.0.0',
  role: 0,
  aliases: ['uploadimgur'],
  description: 'Upload an image to Imgur and get the link',
  usage: '<reply to an image>',
  credits: 'developer',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const imageUrl = messageReply?.attachments?.[0]?.url;

  if (!imageUrl) {
    return api.sendMessage(
      '❌ Please reply to an image or video to upload it to Imgur.',
      threadID,
      messageID
    );
  }

  const apiUrl = `https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(imageUrl)}`;

  api.sendMessage(
    '⌛ Uploading the image to Imgur, please wait...',
    threadID,
    async (err, info) => {
      if (err) return;

      try {
        const response = await axios.get(apiUrl);
        const imgurLink = response?.data?.uploaded?.image;

        if (imgurLink) {
          api.sendMessage(
            `✅ Uploaded successfully!\n\n${imgurLink}`,
            threadID,
            messageID
          );
        } else {
          api.editMessage(
            '❌ Failed to upload the image. Imgur link not found.',
            info.messageID
          );
        }
      } catch (error) {
        console.error('❌ Error uploading image to Imgur:', error.response?.data || error.message);
        api.editMessage(
          '❌ An error occurred while uploading to Imgur. Please try again later.',
          info.messageID
        );
      }
    }
  );
};