const axios = require('axios');

module.exports = {
  name: 'chatgpt',
  description: 'Chat with GPT-4o Pro and analyze images.',
  usage: '/chatgpt [question] or reply to an image',
  cooldown: 3,
  permissions: 0,
  credits: 'vern',
  commandCategory: 'AI',

  async execute(api, event, args, commands, prefix, admins, appState, sendMessage) {
    const { threadID, messageID, messageReply, attachments, senderID } = event;

    // No input provided
    if (args.length === 0 && !messageReply && attachments.length === 0) {
      return sendMessage(api, {
        threadID,
        message: '⚠️ Please provide a question or reply to an image.\n\nExample:\n/chatgpt What is AI?\n(Or reply to an image with /chatgpt)'
      }, messageID);
    }

    const query = args.join(' ');
    let imageUrl = null;

    // Check for image in reply
    if (messageReply && messageReply.attachments?.length > 0) {
      const replyImage = messageReply.attachments.find(att => att.type === 'photo');
      if (replyImage) imageUrl = replyImage.url;
    }

    // Check for direct image attachment
    if (!imageUrl && attachments.length > 0) {
      const attachmentImage = attachments.find(att => att.type === 'photo');
      if (attachmentImage) imageUrl = attachmentImage.url;
    }

    // Prepare API request
    const imageParam = imageUrl ? `&imageUrl=${encodeURIComponent(imageUrl)}` : '';
    const apiUrl = `https://kaiz-apis.gleeze.com/api/gpt-4o-pro?ask=${encodeURIComponent(query)}&uid=${senderID}${imageParam}`;

    try {
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.response) {
        return sendMessage(api, {
          threadID,
          message: '⚠️ No response from GPT. Please try again.'
        }, messageID);
      }

      const aiResponse = response.data.response;

      // Extract image from response (if any)
      const imageMatch = aiResponse.match(/(https?:\/\/[^\s)]+)/);
      const extractedImageUrl = imageMatch ? imageMatch[1] : null;

      // Send image if it's from DALL·E-style output
      if (extractedImageUrl && extractedImageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
        await sendMessage(api, {
          threadID,
          attachment: {
            type: 'image',
            payload: {
              url: extractedImageUrl,
              is_reusable: true
            }
          }
        }, messageID);
      } else {
        // Send plain text response
        await sendMessage(api, {
          threadID,
          message: `🤖 **GPT-4o Pro Response:**\n\n${aiResponse}`
        }, messageID);
      }

    } catch (err) {
      console.error('[GPT-4o ERROR]', err.message || err);
      return sendMessage(api, {
        threadID,
        message: '❌ Error connecting to the GPT API. Please try again later.'
      }, messageID);
    }
  }
};
