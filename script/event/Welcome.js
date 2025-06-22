const axios = require('axios');  
const fs = require('fs');  

module.exports.config = {  
name: "welcomenoti",  
version: "1.0.0",  
};  

module.exports.handleEvent = async function ({ api, event }) {  
if (event.logMessageType === "log:subscribe") {  
const addedParticipants = event.logMessageData.addedParticipants;  
const senderID = addedParticipants[0].userFbId;  
let name = await api.getUserInfo(senderID).then(info => info[senderID].name);  

// Truncate name if it's too long    
    const maxLength = 15;    
    if (name.length > maxLength) {    
        name = name.substring(0, maxLength - 3) + '...';    
    }    

    const groupInfo = await api.getThreadInfo(event.threadID);    
    const groupIcon = groupInfo.imageSrc || "https://i.ibb.co/G5mJZxs/rin.jpg";    
    const memberCount = groupInfo.participantIDs.length;    
    const groupName = groupInfo.threadName || "this group";    
    const background = groupInfo.imageSrc || "https://i.ibb.co/FkQMsQgG/494820034-1290485175939968-835018671615168300-n-jpg-nc-cat-103-ccb-1-7-nc-sid-fc17b8-nc-ohc-gtlt82-D.jpg";    

    const apiKey = "APIKEYYYYY";    
    const welcomeUrl = `https://kaiz-apis.gleeze.com/api/welcome` +    
        `?username=${encodeURIComponent(name)}` +    
        `&avatarUrl=https://i.imgur.com/rCPBLSe.jpeg` +    
        `&groupname=${encodeURIComponent(groupName)}` +    
        `&bg=${encodeURIComponent(background)}` +    
        `&memberCount=${memberCount}` +    
        `&apikey=${apiKey}`;    

    try {    
        const { data } = await axios.get(welcomeUrl, { responseType: 'arraybuffer' });    
        const filePath = './script/cache/welcome_image.jpg';    
        fs.writeFileSync(filePath, Buffer.from(data));    

        api.sendMessage({    
            body: `👋 Welcome ${name} to ${groupName}! 🎉`,    
            attachment: fs.createReadStream(filePath)    
        }, event.threadID, () => fs.unlinkSync(filePath));    
    } catch (error) {    
        console.error("❌ Error fetching welcome image:", error);    
        api.sendMessage({    
            body: `👋 Welcome ${name} to ${groupName}!`    
        }, event.threadID);    
    }    
}  

};