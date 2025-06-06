const axios = require("axios");

const util = require("util");

module.exports = {

  name: "apitestv2",

  author: "aljur pogoy",
  version: "3.0.0",

  nonPrefix: false, // Requires prefix (e.g., /apitestv2)

  description: "Test an API endpoint and display the JSON response. Usage: /apitestv2 <url>",

  async run({ api, event, args }) {

    const { threadID, messageID } = event;

    // Validate the URL argument

    if (!args[0] || !args[0].startsWith("http")) {

      return api.sendMessage(

        "════『 𝗔𝗣𝗜𝗧𝗘𝗦𝗧𝗩𝟮 』════\n\n❌ Please provide a valid URL.\nExample: /apitestv2 https://api.example.com/data",

        threadID,

        messageID

      );

    }

    const url = args[0];

    try {

      // Fetch the API response

      const response = await axios.get(url, {

        headers: {

          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",

        },

      });

      const contentType = response.headers["content-type"] || "";

      // Ensure the response is JSON

      if (!contentType.includes("application/json")) {

        throw new Error(`Unsupported Content-Type: ${contentType}. This command only supports JSON responses.`);

      }

      const jsonData = response.data;

      // Format the JSON response using util.inspect for better readability

      const formattedData = util.inspect(jsonData, {

        depth: null, // Show full depth of objects

        colors: false, // No ANSI colors (since we're sending plain text)

        maxArrayLength: null, // Show all array elements

      });

      // Construct the response message

      let resultMessage = `════『 𝗔𝗣𝗜𝗧𝗘𝗦𝗧𝗩𝟮 』════\n\n`;

      resultMessage += `🌐 API Response 🌐\n\n`;

      resultMessage += `📋 Content-Type: ${contentType}\n\n`;

      resultMessage += `📜 JSON Data:\n${formattedData}\n\n`;

      resultMessage += `> Thank you for using our Cid Kagenou bot`;

      api.sendMessage(resultMessage, threadID, messageID);

    } catch (error) {

      console.error("❌ Error in apitestv2 command:", error.message);

      let errorMessage = `════『 𝗔𝗣𝗜𝗧𝗘𝗦𝗧𝗩𝟮 』════\n\n`;

      errorMessage += `  ┏━━━━━━━┓\n`;

      errorMessage += `  ┃ 『 𝗜𝗡𝗙𝗢 』 An error occurred while fetching the API.\n`;

      errorMessage += `  ┃ Error: ${error.message}\n`;

      errorMessage += `  ┗━━━━━━━┛\n\n`;

      errorMessage += `> Thank you for using our Cid Kagenou bot`;

      api.sendMessage(errorMessage, threadID, messageID);

    }

  },

};