const axios = require('axios');

module.exports = {
    name: 'chatgpt',
    description: 'Chat with GPT-4o Pro and analyze images.',
    async execute(api, event, args, commands, prefix, admins, appState, sendMessage) {
        const { threadID, messageID, messageReply, attachments, senderID } = event;

        if (args.length === 0 && !messageReply && attachments.length === 0) {
            return sendMessage(api, {
                threadID,
                message: '⚠️ Please provide a question or reply with an image.\n\nExample:\n/chatgpt What is AI?\n(Or reply to an image with /chatgpt)'
            });
        }

        let query = args.join(" ");
        let imageUrl = null;


        if (messageReply && messageReply.attachments.length > 0) {
            const imageAttachment = messageReply.attachments.find(att => att.type === 'photo');
            if (imageAttachment) {
                imageUrl = imageAttachment.url;
            }
        }


        if (attachments.length > 0) {
            const imageAttachment = attachments.find(att => att.type === 'photo');
            if (imageAttachment) {
                imageUrl = imageAttachment.url;
            }
        }


        const imageUrlParam = imageUrl ? `&imageUrl=${encodeURIComponent(imageUrl)}` : '';
        const apiUrl = `https://kaiz-apis.gleeze.com/api/gpt-4o-pro?ask=${encodeURIComponent(query)}&uid=${senderID}${imageUrlParam}`;

        try {
            const response = await axios.get(apiUrl);

            if (!response.data || !response.data.response) {
                return sendMessage(api, { threadID, message: '⚠️ No response from GPT. Please try again.' });
            }

            const aiResponse = response.data.response;


            const imageUrlMatch = aiResponse.match(/(https?:\/\/[^\s)]+)/);
            const extractedImageUrl = imageUrlMatch ? imageUrlMatch[1] : null;

            if (extractedImageUrl && extractedImageUrl.includes("oaidalleapiprodscus.blob.core.windows.net")) {
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
                await sendMessage(api, {
                    threadID,
                    message: `🤖 **GPT-4o Pro Response:**\n\n${aiResponse}`
                }, messageID);
            }

        } catch (error) {
            console.error('Error fetching GPT-4o response:', error);
            sendMessage(api, { threadID, message: '❌ Error connecting to the GPT API. Please try again later.' });
        }
    }
};