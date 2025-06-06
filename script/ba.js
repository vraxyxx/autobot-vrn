const fs = require("fs-extra");

const path = require("path");

const axios = require("axios");

module.exports = {

  name: "ba",

  author: "Your Name",

  nonPrefix: false, // Requires prefix (e.g., /ba)

  description: "Get a fun BA image!",

  async run({ api, event }) {

    const { threadID, messageID } = event;

    try {

      // Fetch the API response

      const apiResponse = await axios.get("https://haji-mix-api.gleeze.com/api/ba", {

        responseType: "json", // First try to parse as JSON

      });

      let imageUrl;

      let imageResponse;

      // Check if the response is JSON with a URL

      if (apiResponse.headers["content-type"].includes("application/json")) {

        const data = apiResponse.data;

        // Assume the API returns a URL in a field like "url" or "image"

        imageUrl = data.url || data.image || data.result;

        if (!imageUrl) {

          throw new Error("No image URL found in API response");

        }

        // Fetch the image from the URL

        imageResponse = await axios({

          url: imageUrl,

          method: "GET",

          responseType: "stream",

        });

      } else {

        // If not JSON, assume the API returned the raw image

        imageResponse = await axios({

          url: "https://haji-mix-api.gleeze.com/api/ba",

          method: "GET",

          responseType: "stream",

        });

      }

      // Create a temporary file path

      const tempImagePath = path.join(__dirname, "../temp/ba_image.jpg");

      // Save the image to a temporary file

      const writer = fs.createWriteStream(tempImagePath);

      imageResponse.data.pipe(writer);

      // Wait for the file to finish writing

      await new Promise((resolve, reject) => {

        writer.on("finish", resolve);

        writer.on("error", reject);

      });

      // Construct the message

      let baMessage = `════『 𝗕𝗔 』════\n\n`;

      baMessage += `✨ Here's your BA image! ✨\n\n`;

      baMessage += `> Thank you for using our Cid Kagenou bot`;

      // Send the image as an attachment

      const imageStream = fs.createReadStream(tempImagePath);

      await api.sendMessage(

        {

          body: baMessage,

          attachment: imageStream,

        },

        threadID,

        messageID

      );

      // Clean up the temporary file

      fs.unlinkSync(tempImagePath);

    } catch (error) {

      console.error("❌ Error in ba command:", error.message);

      let errorMessage = `════『 𝗕𝗔 』════\n\n`;

      errorMessage += `  ┏━━━━━━━┓\n`;

      errorMessage += `  ┃ 『 𝗜𝗡𝗙𝗢 』 An error occurred while fetching the image.\n`;

      errorMessage += `  ┃ ${error.message}\n`;

      errorMessage += `  ┗━━━━━━━┛\n\n`;

      errorMessage += `> Thank you for using our Cid Kagenou bot`;

      api.sendMessage(errorMessage, threadID, messageID);

    }

  },

};