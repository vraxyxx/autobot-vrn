const axios = require("axios");

module.exports.config = {
  name: "vernsearch",
  version: "1.0.0",
  credits: "vern",
  description: "Search anything like school work, assignments, research via DuckDuckGo Instant Answer API.",
  commandCategory: "Utility",
  usages: "<search query>",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  try {
    if (args.length === 0) {
      return api.sendMessage("Please provide a search query.\nUsage: !vernsearch <search query>", event.threadID);
    }

    const query = args.join(" ");

    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&skip_disambig=1`;

    const response = await axios.get(url);
    const data = response.data;

    if (data.AbstractText) {
      // Return the instant answer
      let message = `🔍 Search results for "${query}":\n\n${data.Heading}\n\n${data.AbstractText}\n\nMore info: ${data.AbstractURL}`;
      return api.sendMessage(message, event.threadID);
    } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      // Return a list of related topics (up to 5)
      let message = `🔍 Related topics for "${query}":\n\n`;
      let count = 0;
      for (const topic of data.RelatedTopics) {
        if (topic.Text) {
          message += `- ${topic.Text}\n  ${topic.FirstURL}\n\n`;
          count++;
          if (count >= 5) break;
        } else if (topic.Topics && topic.Topics.length > 0) {
          for (const subtopic of topic.Topics) {
            if (subtopic.Text) {
              message += `- ${subtopic.Text}\n  ${subtopic.FirstURL}\n\n`;
              count++;
              if (count >= 5) break;
            }
          }
          if (count >= 5) break;
        }
      }
      return api.sendMessage(message, event.threadID);
    } else {
      return api.sendMessage("No results found.", event.threadID);
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage("An error occurred while searching.", event.threadID);
  }
};
