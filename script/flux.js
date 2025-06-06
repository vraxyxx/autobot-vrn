const axios = require('axios');

module.exports = {

  name: 'flux',

  category: 'AI',

  description: 'Generate an image using the Flux AI model.',

  author: 'Aljur Pogoy',

  version: '3.0.0',

  usage: '/flux <prompt>',

  async execute(api, event, args, commands, prefix, admins, appState, sendMessage) {

    const { threadID, messageID } = event;

    const prompt = args.join(' ').trim();

    try {

      if (!prompt) {

        const usageMessage = `====『 𝗙𝗟U𝗫 』====\n\n`;

        usageMessage += `  ╭─╮\n`;

        usageMessage += `  | 『 𝗜𝗡𝗙𝗢 』 Please provide a prompt.\n`;

        usageMessage += `  | ✅ Usage: ${prefix}flux <prompt>\n`;

        usageMessage += `  | 📜 Example: ${prefix}flux A futuristic city at sunset\n`;

        usageMessage += `  ╰─────────────ꔪ\n\n`;

        usageMessage += `> 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗼𝘂𝗿 𝗖𝗶𝗱 𝗞𝗮𝗴𝗲𝗻𝗼𝘂 𝗯𝗼𝘁\n`;

        usageMessage += `> 𝗙𝗼𝗿 𝗳𝘂𝗿𝘁𝗵𝗲𝗿 𝗮𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝗰𝗲, 𝗰𝗼𝗻𝘁𝗮𝗰𝘁: veaxdev36@gmail.com`;

        sendMessage(api, { threadID, message: usageMessage }, messageID);

        return;

      }

      const url = `https://kaiz-apis.gleeze.com/api/flux`;

      const processingMessage = `====『 𝗙𝗟𝗨𝗫 』====\n\n`;

      processingMessage += `  ╭─╮\n`;

      processingMessage += `  | 『 𝗜𝗡𝗙𝗢 』 Generating image for "${prompt}", please wait...\n`;

      processingMessage += `  ╰─────────────ꔪ\n\n`;

      processingMessage += `> 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 this bot`;

      sendMessage(api, { threadID, message: processingMessage });

      const response = await axios.get(url, {

        responseType: 'stream',

        params: { prompt },

      });

      if (response.data) {

        const successMessage = `====『 𝗙𝗟𝗨𝗫 』====\n\n`;

        successMessage += `  ╭─╮\n`;

        successMessage += `  | 『 𝗦𝗨𝗖𝗖𝗘𝗦𝗦 』 Generated image for: "${prompt}"\n`;

        successMessage += `  ╰─────────────ꔪ\n\n`;

        successMessage += `> 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻�_g 𝗼𝘂𝗿 𝗖𝗶𝗱 𝗞𝗮𝗴𝗲𝗻𝗼𝘂 𝗯𝗼𝘁\n`;

        successMessage += `> 𝗙𝗼𝗿 𝗳𝘂𝗿𝘁𝗵𝗲𝗿 𝗮𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝗰𝗲, 𝗰𝗼𝗻𝘁𝗮𝗰𝘁: 𝗸𝗼𝗿𝗶𝘀𝗮𝘄𝗮𝘂𝗺𝘂𝘇𝗮𝗸𝗶@𝗴𝗺𝗮𝗶𝗹.𝗰𝗼𝗺`;

        sendMessage(api, {

          threadID,

          message: successMessage,

          attachment: response.data,

        }, messageID);

      } else {

        const errorMessage = `====『 𝗙𝗟𝗨𝗫 𝗘𝗥𝗥𝗢𝗥 』====\n\n`;

        errorMessage += `  ╭─╮\n`;

        errorMessage += `  | 『 𝗜𝗡𝗙𝗢 』 No image generated. Please try again later.\n`;

        errorMessage += `  ╰─────────────ꔪ\n\n`;

        errorMessage += `> 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗼𝘂𝗿 𝗖𝗶𝗱 𝗞𝗮𝗴𝗲𝗻𝗼𝘂 𝗯𝗼𝘁\n`;

        errorMessage += `> 𝗙𝗼𝗿 𝗳𝘂𝗿𝘁𝗵𝗲𝗿 𝗮𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝗰𝗲, 𝗰𝗼𝗻𝘁�_a𝗰𝘁: 𝗸𝗼𝗿𝗶𝘀𝗮𝘄𝗮𝘂𝗺𝘂𝘇𝗮𝗸𝗶@�_g𝗺𝗮𝗶𝗹.𝗰𝗼𝗺`;

        sendMessage(api, { threadID, message: errorMessage }, messageID);

      }

    } catch (error) {

      console.error('❌ Error in flux command:', error);

      const errorMessage = `====『 𝗙𝗟𝗨𝗫 𝗘𝗥𝗥𝗢𝗥 』====\n\n`;

      errorMessage += `  ╭─╮\n`;

      errorMessage += `  | 『 𝗜𝗡𝗙𝗢 』 Failed to generate image. Please try again later.\n`;

      errorMessage += `  ╰─────────────ꔪ\n\n`;

      errorMessage += `> 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗼𝘂𝗿 𝗖𝗶𝗱 𝗞𝗮𝗴𝗲𝗻𝗼𝘂 𝗯𝗼𝘁\n`;

      errorMessage += `> 𝗙𝗼𝗿 𝗳𝘂𝗿𝘁𝗵𝗲𝗿 𝗮𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝗰𝗲, 𝗰𝗼𝗻𝘁𝗮𝗰𝘁: 𝗸𝗼𝗿𝗶𝘀𝗮𝘄𝗮𝘂𝗺𝘂𝘇𝗮𝗸𝗶@𝗴𝗺𝗮𝗶𝗹.𝗰𝗼𝗺`;

      sendMessage(api, { threadID, message: errorMessage }, messageID);

    }

  },

};