const axios = require('axios');

module.exports.config = {
  name: 'recipe',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: 'Get a detailed recipe based on the ingredient you provide.',
  usage: 'recipe <ingredient>',
  credits: 'developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!args || args.length === 0) {
    return api.sendMessage('Please provide an ingredient.\nUsage: recipe <ingredient>', threadID, messageID);
  }

  const ingredient = args.join(' ');
  api.sendMessage(`Searching recipe for “${ingredient}”, please wait...`, threadID, async (err, info) => {
    if (err) return;

    const apiUrl = `https://kaiz-apis.gleeze.com/api/recipe?ingredients=${encodeURIComponent(ingredient)}&apikey=APIKEY`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data?.recipe) {
        return api.editMessage('No recipe found for that ingredient.', info.messageID);
      }

      return api.editMessage(data.recipe, info.messageID);

    } catch (error) {
      console.error('Recipe API Error:', error.message);
      return api.editMessage('Error: Failed to fetch recipe. Try again later.', info.messageID);
    }
  });
};