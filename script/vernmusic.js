module.exports.config = {
  name: "vernmusic",
  version: "1.0.0",
  credits: "vern",
  description: "Search and send music from YouTube",
  commandCategory: "Music",
  usages: "<song name>",
  cooldowns: 5
};

const axios = require("axios");

module.exports.run = async function({ api, event, args }) {
  try {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage("Please enter a song name to search for music.", threadID, messageID);
    }

    const query = args.join(" ");

    // Step 1: Search YouTube for video ID
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=AIzaSyA-Your-API-Key`;

    // NOTE: The above requires YouTube Data API key. For zero-key, use third-party alternatives (less reliable).

    // For demo, I'll use an open API from https://api.vevioz.com/api/button/mp3/VIDEO_ID

    // But first we need to get the video ID from YouTube

    // Since no API key, let's scrape YouTube search using web scraping:

    const searchRes = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);

    // Extract videoId from HTML
    const videoIdMatch = searchRes.data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (!videoIdMatch) {
      return api.sendMessage("No results found for your query.", threadID, messageID);
    }

    const videoId = videoIdMatch[1];

    // Step 2: Get MP3 download link from vevioz.com

    const veviozRes = await axios.get(`https://api.vevioz.com/api/button/mp3/${videoId}`);

    // The response contains mp3 download url in data.url or data.mp3

    if (!veviozRes.data || !veviozRes.data.url) {
      return api.sendMessage("Unable to get MP3 download link.", threadID, messageID);
    }

    const mp3Url = veviozRes.data.url;

    // Send message with mp3 link

    return api.sendMessage(
      `🎵 Here is your music for "${query}":\n${mp3Url}\n\n*Note: You can click the link to download or stream the music.*`,
      threadID,
      messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage("An error occurred while searching for music.", event.threadID, event.messageID);
  }
};
