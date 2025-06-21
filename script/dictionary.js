const axios = require('axios');

module.exports.config = {
  name: 'dictionary',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: 'Look up word definitions using an online dictionary.',
  usage: 'dictionary <word>',
  credits: 'Vern',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const word = args.join(' ');

  if (!word) {
    return api.sendMessage('Please enter a word to look up.\nExample: dictionary hello', threadID, messageID);
  }

  const apiUrl = `https://kaiz-apis.gleeze.com/api/dictionary?word=${encodeURIComponent(word)}&apikey=INSERT_APIKEY`;

  try {
    const { data } = await axios.get(apiUrl);

    if (!data || !data.meanings || data.meanings.length === 0) {
      return api.sendMessage(`No definitions found for "${word}".`, threadID, messageID);
    }

    let message = `Definitions for: ${data.word}\n`;

    data.meanings.forEach((meaning, i) => {
      message += `\n${i + 1}. (${meaning.partOfSpeech})\n`;
      meaning.definitions.forEach((def, j) => {
        message += `  - ${def.definition}\n`;
        if (def.example) message += `    Example: ${def.example}\n`;
      });

      if (meaning.synonyms && meaning.synonyms.length > 0) {
        message += `  Synonyms: ${meaning.synonyms.join(', ')}\n`;
      }

      if (meaning.antonyms && meaning.antonyms.length > 0) {
        message += `  Antonyms: ${meaning.antonyms.join(', ')}\n`;
      }
    });

    api.sendMessage(message, threadID, messageID);
  } catch (error) {
    console.error('dictionary command error:', error.message);
    return api.sendMessage('Error: Could not fetch definition. Please try again later.', threadID, messageID);
  }
};